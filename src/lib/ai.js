const endpoint = import.meta.env.VITE_AI_ENDPOINT;
const authToken = import.meta.env.VITE_AI_AUTH_TOKEN;

function buildAssistantInput(product, buyerProfile, prompt) {
  return [
    "You are a shopping assistant inside an ecommerce frontend.",
    "Keep answers practical, concise, and buyer-focused.",
    "",
    `Buyer profile: ${buyerProfile.name}, ${buyerProfile.preference}.`,
    `Product: ${product.name}.`,
    `Category: ${product.category}.`,
    `Price: $${product.price}.`,
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
