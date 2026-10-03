// Compressed layers for preview; originals (5000x5000) only fetched at download time.
// Custom domain on the R2 bucket (proxied) — r2.dev URLs are rate-limited and never edge-cached.
const R2_BASE = "https://br01.tqrc.org";
const R2_ORIGINAL_BASE = `${R2_BASE}/original`;

export function elementUrl(path) {
  return `${R2_BASE}${path}`;
}

export function originalElementUrl(path) {
  return `${R2_ORIGINAL_BASE}${path}`;
}
