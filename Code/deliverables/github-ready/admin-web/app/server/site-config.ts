const DEVELOPMENT_SITE_URL = "http://localhost:3001";
const DEVELOPMENT_STOREFRONT_URL = "http://localhost:3000";

function resolveUrl(value: string | undefined, fallback: string): string {
  if (!value) {
    return fallback;
  }

  try {
    const url = new URL(value.trim());
    if (url.protocol !== "http:" && url.protocol !== "https:") return fallback;
    return url.origin;
  } catch {
    return fallback;
  }
}

export function resolveSiteUrl(value = process.env.SITE_URL): string {
  return resolveUrl(value, DEVELOPMENT_SITE_URL);
}

export const siteUrl = resolveSiteUrl();
export const storefrontUrl = resolveUrl(process.env.STOREFRONT_URL, DEVELOPMENT_STOREFRONT_URL);
