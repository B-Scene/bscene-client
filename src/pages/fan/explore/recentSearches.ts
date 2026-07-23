const RECENT_SEARCHES_STORAGE_KEY = "bscene:fan-explore:recent-searches";
const MAX_RECENT_SEARCHES = 10;

export const getRecentSearches = () => {
  if (typeof window === "undefined") return [];

  const rawValue = window.localStorage.getItem(RECENT_SEARCHES_STORAGE_KEY);
  if (!rawValue) return [];

  try {
    const parsedValue = JSON.parse(rawValue);
    if (!Array.isArray(parsedValue)) return [];

    return parsedValue.filter(
      (item): item is string => typeof item === "string" && item.trim().length > 0,
    );
  } catch {
    return [];
  }
};

export const setRecentSearches = (keywords: string[]) => {
  if (typeof window === "undefined") return;

  window.localStorage.setItem(
    RECENT_SEARCHES_STORAGE_KEY,
    JSON.stringify(keywords),
  );
};

export const addRecentSearch = (keyword: string) => {
  const trimmedKeyword = keyword.trim();
  if (!trimmedKeyword) return getRecentSearches();

  const nextKeywords = [
    trimmedKeyword,
    ...getRecentSearches().filter((item) => item !== trimmedKeyword),
  ].slice(0, MAX_RECENT_SEARCHES);

  setRecentSearches(nextKeywords);
  return nextKeywords;
};
