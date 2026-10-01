// Compressed layers for preview; originals (5000x5000) only fetched at download time.
const R2_BASE = "https://pub-4754cac80f48428a9ce827610314079e.r2.dev";
const R2_ORIGINAL_BASE = `${R2_BASE}/original`;

export function elementUrl(path) {
  return `${R2_BASE}${path}`;
}

export function originalElementUrl(path) {
  return `${R2_ORIGINAL_BASE}${path}`;
}
