import { formatCurrency } from "./productUtils";

const endpoint = import.meta.env.VITE_AI_ENDPOINT;
const authToken = import.meta.env.VITE_AI_AUTH_TOKEN;
const stopWords = new Set([
  "and",
  "the",
  "with",
  "for",
  "that",
  "this",
  "from",
  "your",
  "you",
  "all",
  "day",
  "use",
  "built",
  "good",
  "great",
]);

function buildAssistantInput(product, buyerProfile, prompt) {
  return [
    "You are a shopping assistant inside an ecommerce frontend.",
    "Keep answers practical, concise, and buyer-focused.",
    "",
    `Buyer profile: ${buyerProfile.name}, ${buyerProfile.preference}.`,
    `Product: ${product.name}.`,
    `Category: ${product.category}.`,
    `Price: ${formatCurrency(product.price)}.`,
    `Highlights: ${product.highlights.join(", ")}.`,
    `Description: ${product.description}`,
    "",
    `User question: ${prompt}`,
  ].join("\n");
}

function extractTextFromContent(content) {
  if (typeof content === "string") {
    return content;
  }

  if (Array.isArray(content)) {
    return content
      .map((item) => {
        if (typeof item === "string") {
          return item;
        }

        return item?.text?.value ?? item?.text ?? item?.content ?? "";
      })
      .filter(Boolean)
      .join("\n")
      .trim();
  }

  if (content && typeof content === "object") {
    return content.text?.value ?? content.text ?? content.content ?? "";
  }

  return "";
}

function extractAnswer(data) {
  if (!data) {
    return "";
  }

  if (typeof data === "string") {
    return data;
  }

  if (typeof data.answer === "string") {
    return data.answer;
  }

  if (typeof data.output_text === "string") {
    return data.output_text;
  }

  if (Array.isArray(data.output)) {
    const outputText = data.output
      .map((item) => extractTextFromContent(item?.content))
      .filter(Boolean)
      .join("\n")
      .trim();

    if (outputText) {
      return outputText;
    }
  }

  if (Array.isArray(data.choices)) {
    const choiceText = data.choices
      .map((choice) =>
        extractTextFromContent(choice?.message?.content ?? choice?.delta?.content),
      )
      .filter(Boolean)
      .join("\n")
      .trim();

    if (choiceText) {
      return choiceText;
    }
  }

  if (typeof data.message === "string") {
    return data.message;
  }

  return "";
}

function buildFallbackAnswer(product, buyerProfile) {
  return [
    `Based on your profile, ${product.name} fits buyers who care about ${product.tags.join(", ").toLowerCase()}.`,
    `The seller positions it around ${product.highlights[0].toLowerCase()} and ${product.highlights[1].toLowerCase()}, so it suits practical everyday use.`,
    `If your top priority is ${buyerProfile.preference.toLowerCase()}, this looks like a strong shortlist candidate.`,
  ].join(" ");
}

export function hasLiveAiEndpoint() {
  return Boolean(endpoint);
}

function tokenizeText(text = "") {
  return text
    .toLowerCase()
    .split(/[^a-z0-9]+/g)
    .map((token) => token.trim())
    .filter((token) => token.length > 2 && !stopWords.has(token));
}

function buildRecommendationReason(product, buyerProfile, matches) {
  const readableMatches = matches.slice(0, 2).join(" and ");

  if (readableMatches) {
    return `${product.name} stands out because it aligns with your preference for ${readableMatches}.`;
  }

  const fallbackSignal = product.highlights?.[0] || product.tags?.[0] || product.category.toLowerCase();
  return `${product.name} is a practical pick if you want ${buyerProfile.preference.toLowerCase()} and value ${fallbackSignal.toLowerCase()}.`;
}

export function getMarketplaceSuggestions(products, buyerProfile, limit = 3) {
  const preferenceTokens = tokenizeText(buyerProfile.preference);

  return products
    .map((product) => {
      const productSignals = [
        product.name,
        product.category,
        product.description,
        ...(product.tags || []),
        ...(product.highlights || []),
      ].join(" ").toLowerCase();

      const matchedTokens = preferenceTokens.filter((token) => productSignals.includes(token));
      const score =
        matchedTokens.length * 3
        + (product.rating || 0)
        + Math.min((product.stock || 0) / 10, 2);

      return {
        product,
        score,
        matches: matchedTokens,
        reason: buildRecommendationReason(product, buyerProfile, matchedTokens),
      };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}

export async function getProductAdvice(product, buyerProfile, prompt) {
  const trimmedPrompt = prompt.trim();

  if (!trimmedPrompt) {
    return "Ask about budget, style, daily usage, or how this product compares with another option.";
  }

  if (!endpoint) {
    return buildFallbackAnswer(product, buyerProfile);
  }

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
    },
    body: JSON.stringify({
      prompt: trimmedPrompt,
      product,
      buyerProfile,
      input: buildAssistantInput(product, buyerProfile, trimmedPrompt),
      metadata: {
        surface: "product-assistant",
        productId: product.id,
      },
    }),
  });

  if (!response.ok) {
    throw new Error(`AI endpoint request failed with status ${response.status}.`);
  }

  const data = await response.json();
  const answer = extractAnswer(data);

  if (!answer) {
    throw new Error("AI endpoint returned an unsupported response shape.");
  }

  return answer;
}
