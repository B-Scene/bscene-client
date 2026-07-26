export const formatApplicationDetailDate = (value: string) => {
  if (!value) return "";
  if (value.includes("작성") || value.includes("수정")) return value;
  if (value.includes("T")) return `${value.slice(0, 10)} 수정`;

  return value;
};

export const normalizeApplicationPortfolioUrl = (value: string) => {
  const trimmedValue = value.trim();

  if (
    trimmedValue.startsWith("http://") ||
    trimmedValue.startsWith("https://")
  ) {
    return trimmedValue;
  }

  return `https://${trimmedValue}`;
};

export const getApplicationPortfolioTitle = (
  link: string,
  index: number,
) => {
  try {
    const url = new URL(normalizeApplicationPortfolioUrl(link));

    if (
      url.hostname.includes("youtube.com") ||
      url.hostname.includes("youtu.be")
    ) {
      return index === 0
        ? "포트폴리오 영상"
        : `포트폴리오 영상 ${index + 1}`;
    }

    return url.hostname;
  } catch {
    return `포트폴리오 ${index + 1}`;
  }
};
