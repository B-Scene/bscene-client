const STORAGE_KEY = "bscene:band-member-nicknames";

const readCache = (): Record<number, string> => {
  try {
    return JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? "{}");
  } catch {
    return {};
  }
};

export const getCachedNickname = (userId: number) => {
  return readCache()[userId];
};

export const cacheNicknames = (
  entries: { userId: number; nickname: string }[],
) => {
  if (entries.length === 0) return;

  const cache = readCache();

  entries.forEach(({ userId, nickname }) => {
    cache[userId] = nickname;
  });

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(cache));
};
