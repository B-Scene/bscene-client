import type { Mode } from "@/stores/useModeStore";

const PUSH_BACK_TARGET_KEY = "bscenePushNotificationBackTarget";

const getModeHomePath = (mode: Mode) =>
  mode === "band" ? "/band/home" : "/fan/home";

export const getPushNotificationBackTarget = (
  targetDeepLink: string,
  fallbackMode: Mode,
) => {
  try {
    const url = new URL(targetDeepLink, window.location.origin);

    if (url.pathname.startsWith("/band")) return "/band/home";
    if (url.pathname.startsWith("/fan")) return "/fan/home";
  } catch {
    // Fall back to the current app mode below.
  }

  return getModeHomePath(fallbackMode);
};

export const markPushNotificationEntry = (
  targetDeepLink: string,
  fallbackMode: Mode,
) => {
  sessionStorage.setItem(
    PUSH_BACK_TARGET_KEY,
    getPushNotificationBackTarget(targetDeepLink, fallbackMode),
  );
};

export const consumePushNotificationBackTarget = () => {
  const targetPath = sessionStorage.getItem(PUSH_BACK_TARGET_KEY);

  if (targetPath) {
    sessionStorage.removeItem(PUSH_BACK_TARGET_KEY);
  }

  return targetPath;
};
