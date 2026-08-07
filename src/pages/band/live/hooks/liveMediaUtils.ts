export const extractWhipPath = (playbackUrl: string) => {
  const rawValue = playbackUrl.trim();

  try {
    const url = new URL(rawValue, window.location.origin);
    const segments = decodeURIComponent(url.pathname)
      .replace(/\/+$/, "")
      .replace(/^\/+/, "")
      .split("/")
      .filter(Boolean);
    const rtcIndex = segments.indexOf("rtc");
    const protocolIndex = segments.findIndex(
      (segment) => segment === "whip" || segment === "whep",
    );

    if (rtcIndex >= 0) {
      const endIndex =
        protocolIndex > rtcIndex ? protocolIndex : segments.length;
      return segments.slice(rtcIndex + 1, endIndex).join("/");
    }

    return segments
      .join("/")
      .replace(/^api\/rtc\//, "")
      .replace(/^rtc\//, "")
      .replace(/\/(?:whip|whep)$/, "")
      .replace(/^\/+|\/+$/g, "");
  } catch {
    return rawValue
      .replace(/^https?:\/\/[^/]+/i, "")
      .replace(/^\/+/, "")
      .replace(/^api\/rtc\//, "")
      .replace(/^rtc\//, "")
      .replace(/\/(?:whip|whep)$/, "")
      .replace(/^\/+|\/+$/g, "");
  }
};

export const waitForIceGatheringComplete = (
  peerConnection: RTCPeerConnection,
  timeoutMs = 3000,
) => {
  if (peerConnection.iceGatheringState === "complete") {
    return Promise.resolve();
  }

  return new Promise<void>((resolve) => {
    let isResolved = false;
    const timeoutId = window.setTimeout(finish, timeoutMs);

    function finish() {
      if (isResolved) return;

      isResolved = true;
      peerConnection.removeEventListener(
        "icegatheringstatechange",
        handleChange,
      );
      window.clearTimeout(timeoutId);
      resolve();
    }

    function handleChange() {
      if (peerConnection.iceGatheringState === "complete") finish();
    }

    peerConnection.addEventListener("icegatheringstatechange", handleChange);
  });
};

export const getAudioContextConstructor = () => {
  return (
    window.AudioContext ??
    (window as Window & typeof globalThis & {
      webkitAudioContext?: typeof AudioContext;
    }).webkitAudioContext
  );
};
