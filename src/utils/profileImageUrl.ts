const PLACEHOLDER_IMAGE_HOSTS = new Set(["example.com", "www.example.com"]);

export const getRenderableProfileImageUrl = (
  value?: string | null,
): string | null => {
  const url = value?.trim();

  if (!url) {
    return null;
  }

  if (url.startsWith("//")) {
    return null;
  }

  if (url.startsWith("/") || url.startsWith("blob:") || url.startsWith("data:")) {
    return url;
  }

  try {
    const parsedUrl = new URL(url);

    if (
      !["http:", "https:"].includes(parsedUrl.protocol) ||
      PLACEHOLDER_IMAGE_HOSTS.has(parsedUrl.hostname)
    ) {
      return null;
    }

    return url;
  } catch {
    return null;
  }
};
