import { useCallback, useEffect, useRef, useState } from "react";
import {
  createWhepSession,
  deleteWhipSession,
  enterLive,
} from "@/api/live/live";
import { getStoredAuthUser } from "@/utils/authUser";
import type { PlaybackProtocol } from "@/types/live/live";
import type { ActiveLive } from "../types";
import { waitForIceGatheringComplete } from "./liveMediaUtils";

const getOtherCoPublisherWhepUrl = (live: ActiveLive) => {
  const currentUserId = getStoredAuthUser()?.userId;

  return live?.coPublishers?.find(
    (publisher) =>
      publisher.whepUrl &&
      (!Number.isFinite(currentUserId) || publisher.userId !== currentUserId),
  )?.whepUrl;
};

interface UseLiveRoomPlaybackParams {
  live: ActiveLive;
  canBroadcast: boolean;
  audioConnected: boolean;
}

export const useLiveRoomPlayback = ({
  live,
  canBroadcast,
  audioConnected,
}: UseLiveRoomPlaybackParams) => {
  const playbackRole = live?.playback?.role;
  const playbackUrl = live?.playback?.playbackUrl;
  const initialWhepUrl = getOtherCoPublisherWhepUrl(live);
  const [monitorPlaybackUrl, setMonitorPlaybackUrl] = useState<string | null>(
    () => initialWhepUrl ?? live?.monitorPlaybackUrl ?? null,
  );
  const [monitorPlaybackProtocol, setMonitorPlaybackProtocol] =
    useState<PlaybackProtocol | null>(
      () =>
        (initialWhepUrl ? "WHEP" : live?.monitorPlaybackProtocol) ?? null,
    );
  const [listenerAudioMessage, setListenerAudioMessage] = useState("");
  const [showListenerPlayButton, setShowListenerPlayButton] = useState(false);
  const listenerAudioRef = useRef<HTMLAudioElement | null>(null);
  const whepSessionUrlRef = useRef<string | null>(null);
  const monitorPeerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const connectedMonitorUrlRef = useRef<string | null>(null);
  const negotiatingMonitorUrlRef = useRef<string | null>(null);
  const whepAbortControllerRef = useRef<AbortController | null>(null);
  const whepGenerationRef = useRef(0);

  const isListenerPlayback =
    Boolean(live?.liveId) && playbackRole === "LISTENER" && Boolean(playbackUrl);
  const isBroadcasterMonitorPlayback =
    Boolean(live?.liveId) &&
    canBroadcast &&
    audioConnected &&
    Boolean(monitorPlaybackUrl);

  const stopListenerPlayback = useCallback((resetUi = true) => {
    const audio = listenerAudioRef.current;

    if (audio) {
      audio.pause();
      audio.srcObject = null;
      audio.removeAttribute("src");
      audio.load();
    }

    if (resetUi) {
      setListenerAudioMessage("");
      setShowListenerPlayButton(false);
    }
  }, []);

  const startListenerPlayback = useCallback(async () => {
    const audio = listenerAudioRef.current;

    if (!audio || !playbackUrl) return;

    try {
      if (audio.src !== playbackUrl) audio.src = playbackUrl;
      audio.volume = 1;
      await audio.play();
      setListenerAudioMessage("");
      setShowListenerPlayButton(false);
    } catch {
      setListenerAudioMessage("오디오 재생을 위해 버튼을 눌러주세요.");
      setShowListenerPlayButton(true);
    }
  }, [playbackUrl]);

  const stopBroadcasterMonitorPlayback = useCallback(
    async (resetUi = true) => {
      whepGenerationRef.current += 1;
      whepAbortControllerRef.current?.abort();
      whepAbortControllerRef.current = null;
      const sessionUrl = whepSessionUrlRef.current;

      whepSessionUrlRef.current = null;
      connectedMonitorUrlRef.current = null;
      negotiatingMonitorUrlRef.current = null;
      monitorPeerConnectionRef.current?.close();
      monitorPeerConnectionRef.current = null;

      const audio = listenerAudioRef.current;
      if (audio) {
        audio.pause();
        audio.srcObject = null;
        audio.removeAttribute("src");
        audio.load();
      }

      if (sessionUrl) {
        try {
          await deleteWhipSession(sessionUrl);
        } catch {
          // 이미 종료된 수신 세션이면 무시합니다.
        }
      }

      if (resetUi) {
        setListenerAudioMessage("");
        setShowListenerPlayButton(false);
      }
    },
    [],
  );

  const startBroadcasterMonitorPlayback = useCallback(async () => {
    const audio = listenerAudioRef.current;

    if (!audio || !monitorPlaybackUrl) return;

    const activeMonitorUrl =
      connectedMonitorUrlRef.current ?? negotiatingMonitorUrlRef.current;

    if (activeMonitorUrl && activeMonitorUrl !== monitorPlaybackUrl) {
      await stopBroadcasterMonitorPlayback(false);
    } else if (monitorPeerConnectionRef.current) {
      try {
        await audio.play();
        setListenerAudioMessage("");
        setShowListenerPlayButton(false);
      } catch {
        setListenerAudioMessage("상대 진행자 소리를 들으려면 눌러주세요.");
        setShowListenerPlayButton(true);
      }
      return;
    }

    try {
      if (
        monitorPlaybackProtocol === "HLS" ||
        monitorPlaybackUrl.toLowerCase().includes(".m3u8")
      ) {
        audio.srcObject = null;
        audio.src = monitorPlaybackUrl;
        audio.volume = 1;
        connectedMonitorUrlRef.current = monitorPlaybackUrl;
        await audio.play();
        setListenerAudioMessage("");
        setShowListenerPlayButton(false);
        return;
      }

      const targetWhepUrl = monitorPlaybackUrl;
      const generation = whepGenerationRef.current + 1;
      whepGenerationRef.current = generation;
      whepAbortControllerRef.current?.abort();
      const abortController = new AbortController();
      whepAbortControllerRef.current = abortController;
      negotiatingMonitorUrlRef.current = targetWhepUrl;

      const peerConnection = new RTCPeerConnection();
      monitorPeerConnectionRef.current = peerConnection;
      peerConnection.addTransceiver("audio", { direction: "recvonly" });
      peerConnection.ontrack = (event) => {
        audio.srcObject =
          event.streams[0] ?? new MediaStream([event.track]);
        audio.volume = 1;
        void audio.play().catch(() => {
          setListenerAudioMessage("상대 진행자 소리를 들으려면 눌러주세요.");
          setShowListenerPlayButton(true);
        });
      };

      const offer = await peerConnection.createOffer();
      await peerConnection.setLocalDescription(offer);
      await waitForIceGatheringComplete(peerConnection);

      const sdpOffer = peerConnection.localDescription?.sdp;
      if (!sdpOffer) throw new Error("WHEP SDP Offer 생성에 실패했습니다.");

      const { sdpAnswer, sessionUrl } = await createWhepSession({
        whepUrl: targetWhepUrl,
        sdpOffer,
        signal: abortController.signal,
      });

      if (
        abortController.signal.aborted ||
        whepGenerationRef.current !== generation
      ) {
        peerConnection.close();
        await deleteWhipSession(sessionUrl).catch(() => undefined);
        return;
      }

      whepSessionUrlRef.current = sessionUrl;
      negotiatingMonitorUrlRef.current = null;
      connectedMonitorUrlRef.current = targetWhepUrl;
      await peerConnection.setRemoteDescription({
        type: "answer",
        sdp: sdpAnswer,
      });
      setListenerAudioMessage("");
      setShowListenerPlayButton(false);
    } catch (error) {
      if (
        error instanceof DOMException &&
        error.name === "AbortError"
      ) {
        return;
      }

      await stopBroadcasterMonitorPlayback(false);
      setListenerAudioMessage(
        error instanceof Error
          ? error.message
          : "공동 진행자 오디오 수신에 실패했어요.",
      );
      setShowListenerPlayButton(true);
    } finally {
      if (whepAbortControllerRef.current?.signal.aborted) {
        whepAbortControllerRef.current = null;
      }
    }
  }, [
    monitorPlaybackProtocol,
    monitorPlaybackUrl,
    stopBroadcasterMonitorPlayback,
  ]);

  const handleCoPublisherJoined = useCallback(
    ({ userId, whepUrl }: { userId: number; whepUrl: string }) => {
      if (userId === getStoredAuthUser()?.userId) return;

      setMonitorPlaybackUrl(whepUrl);
      setMonitorPlaybackProtocol("WHEP");
    },
    [],
  );

  useEffect(() => {
    if (
      !live?.liveId ||
      !canBroadcast ||
      !audioConnected ||
      monitorPlaybackUrl
    ) {
      return;
    }

    let isCancelled = false;
    let timeoutId: number | undefined;

    const refreshCoPublishers = async () => {
      try {
        const refreshedLive = await enterLive(live.liveId);
        const whepUrl = getOtherCoPublisherWhepUrl(refreshedLive);

        if (isCancelled) return;
        if (whepUrl) {
          setMonitorPlaybackUrl(whepUrl);
          setMonitorPlaybackProtocol("WHEP");
          return;
        }
      } catch {
        // SSE 이벤트를 놓친 경우의 보조 조회이므로 다음 주기에 재시도합니다.
      }

      if (!isCancelled) {
        timeoutId = window.setTimeout(refreshCoPublishers, 3000);
      }
    };

    void refreshCoPublishers();
    return () => {
      isCancelled = true;
      if (timeoutId !== undefined) window.clearTimeout(timeoutId);
    };
  }, [audioConnected, canBroadcast, live?.liveId, monitorPlaybackUrl]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      if (isListenerPlayback) {
        void stopBroadcasterMonitorPlayback(false);
        void startListenerPlayback();
        return;
      }

      if (isBroadcasterMonitorPlayback) {
        stopListenerPlayback(false);
        void startBroadcasterMonitorPlayback();
        return;
      }

      stopListenerPlayback(false);
      void stopBroadcasterMonitorPlayback(false);
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [
    isBroadcasterMonitorPlayback,
    isListenerPlayback,
    startBroadcasterMonitorPlayback,
    startListenerPlayback,
    stopBroadcasterMonitorPlayback,
    stopListenerPlayback,
  ]);

  useEffect(() => {
    return () => {
      stopListenerPlayback(false);
      void stopBroadcasterMonitorPlayback(false);
    };
  }, [stopBroadcasterMonitorPlayback, stopListenerPlayback]);

  return {
    handleCoPublisherJoined,
    isBroadcasterMonitorPlayback,
    isListenerPlayback,
    listenerAudioMessage,
    listenerAudioRef,
    setListenerAudioMessage,
    setShowListenerPlayButton,
    showListenerPlayButton,
    startBroadcasterMonitorPlayback,
    startListenerPlayback,
    stopListenerPlayback,
  };
};
