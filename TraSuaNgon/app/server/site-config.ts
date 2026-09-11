const DEVELOPMENT_SITE_URL = "http://localhost:3000";

export function resolveSiteUrl(value = process.env.SITE_URL): string {
  if (!value) {
    return DEVELOPMENT_SITE_URL;
  }

  try {
    const url = new URL(value.trim());
    if (url.protocol !== "http:" && url.protocol !== "https:") return DEVELOPMENT_SITE_URL;
    return url.origin;
  } catch {
    return DEVELOPMENT_SITE_URL;
  }
}

export const siteUrl = resolveSiteUrl();
