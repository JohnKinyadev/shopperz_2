import { categorySpecs } from "../data/mockData";

export function sanitizePriceInput(value = "") {
  const cleaned = String(value).replace(/[^\d.,]/g, "").replace(/,/g, "");

  if (!cleaned) {
    return "";
  }

  const [wholePart = "", ...decimalParts] = cleaned.split(".");
  const normalizedWholePart = wholePart.replace(/^0+(?=\d)/, "");
  const decimalPart = decimalParts.join("").slice(0, 2);

  return decimalPart ? `${normalizedWholePart || "0"}.${decimalPart}` : normalizedWholePart;
}

export function formatPriceInput(value = "") {
  const normalizedValue = sanitizePriceInput(value);

  if (!normalizedValue) {
    return "";
  }

  const [wholePart = "0", decimalPart] = normalizedValue.split(".");
  const formattedWholePart = Number(wholePart).toLocaleString("en-US");

  return decimalPart !== undefined ? `${formattedWholePart}.${decimalPart}` : formattedWholePart;
}

export function parsePriceInput(value = "") {
  const normalizedValue = sanitizePriceInput(value);
  return normalizedValue ? Number(normalizedValue) : Number.NaN;
}

export function formatCurrency(value) {
  const amount = Number(value);

  if (Number.isNaN(amount)) {
    return "$0";
  }

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: Number.isInteger(amount) ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function getCategorySpecDefinitions(category) {
  return categorySpecs[category] || [];
}

export function getProductSpecEntries(category, specs = {}) {
  return getCategorySpecDefinitions(category)
    .map((definition) => {
      const value = specs?.[definition.field];
      return {
        ...definition,
        value: typeof value === "string" ? value.trim() : value,
      };
    })
    .filter((entry) => entry.value);
}

export function buildSpecHighlights(category, specs = {}) {
  return getProductSpecEntries(category, specs).map(
    ({ highlightLabel, label, value }) => `${highlightLabel || label}: ${value}`,
  );
}
