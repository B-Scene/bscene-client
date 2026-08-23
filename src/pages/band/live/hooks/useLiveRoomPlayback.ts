import { useCallback, useEffect, useRef, useState } from "react";

import {
  createWhepSession,
  deleteWhipSession,
} from "@/api/live/live";
import type { LiveCoPublisher } from "@/types/live/live";
import { getStoredAuthUser } from "@/utils/authUser";

import type { ActiveLive } from "../types";
import { waitForIceGatheringComplete } from "./liveMediaUtils";

interface UseLiveRoomPlaybackParams {
  live: ActiveLive;
  canBroadcast: boolean;
  audioConnected: boolean;
}

type CoPublisherPeer = {
  userId: number;
  whepUrl: string;
  peerConnection: RTCPeerConnection;
  audio: HTMLAudioElement;
  abortController: AbortController;
  sessionUrl: string | null;
  disconnectTimer: number | null;
};

const WHEP_RETRY_DELAY_MS = 3000;

const normalizeCoPublishers = (publishers: LiveCoPublisher[]) => {
  const currentUserId = getStoredAuthUser()?.userId;
  const normalized = new Map<number, string>();

  publishers.forEach((publisher) => {
    if (!Number.isFinite(publisher.userId)) return;
    if (publisher.userId === currentUserId) return;
    if (typeof publisher.whepUrl !== "string") return;

    const whepUrl = publisher.whepUrl.trim();
    if (!whepUrl) return;

    normalized.set(publisher.userId, whepUrl);
  });

  return normalized;
};

const mapToPublisherList = (publishers: Map<number, string>): LiveCoPublisher[] => {
  return Array.from(publishers, ([userId, whepUrl]) => ({
    userId,
    whepUrl,
  }));
};

export const useLiveRoomPlayback = ({
  live,
  canBroadcast,
  audioConnected,
}: UseLiveRoomPlaybackParams) => {
  const playbackRole = live?.playback?.role;
  const playbackUrl = live?.playback?.playbackUrl;

  const listenerAudioRef = useRef<HTMLAudioElement | null>(null);

  const desiredPublishersRef = useRef<Map<number, string>>(new Map());
  const initialSnapshotLiveIdRef = useRef<number | null>(null);
  const canBroadcastRef = useRef(canBroadcast);
  const audioConnectedRef = useRef(audioConnected);

  canBroadcastRef.current = canBroadcast;
  audioConnectedRef.current = audioConnected;

  const peersRef = useRef<Map<number, CoPublisherPeer>>(new Map());

  const retryTimerRef = useRef<number | null>(null);
  const isUnmountedRef = useRef(false);

  const [listenerAudioMessage, setListenerAudioMessage] = useState("");
  const [showListenerPlayButton, setShowListenerPlayButton] = useState(false);
  const [coPublisherCount, setCoPublisherCount] = useState(() =>
    normalizeCoPublishers(live?.coPublishers ?? []).size,
  );
  const [retryNonce, setRetryNonce] = useState(0);

  const isListenerPlayback =
    Boolean(live?.liveId) && playbackRole === "LISTENER" && Boolean(playbackUrl);

  const isBroadcasterMonitorPlayback =
    Boolean(live?.liveId) &&
    canBroadcast &&
    audioConnected &&
    coPublisherCount > 0;

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
      if (audio.src !== playbackUrl) {
        audio.srcObject = null;
        audio.src = playbackUrl;
      }

      audio.volume = 1;
      await audio.play();

      setListenerAudioMessage("");
      setShowListenerPlayButton(false);
    } catch {
      setListenerAudioMessage("오디오 재생을 위해 버튼을 눌러주세요.");
      setShowListenerPlayButton(true);
    }
  }, [playbackUrl]);

  const syncCoPublisherPlaybackUi = useCallback(() => {
    if (isUnmountedRef.current) return;

    const peers = Array.from(peersRef.current.values());
    const playablePeers = peers.filter((peer) => peer.audio.srcObject !== null);

    if (playablePeers.length === 0) {
      if (desiredPublishersRef.current.size === 0) {
        setListenerAudioMessage("");
        setShowListenerPlayButton(false);
      }
      return;
    }

    const hasBlockedPlayback = playablePeers.some((peer) => peer.audio.paused);

    if (hasBlockedPlayback) {
      setListenerAudioMessage("상대 진행자 소리를 들으려면 눌러주세요.");
      setShowListenerPlayButton(true);
      return;
    }

    setListenerAudioMessage("");
    setShowListenerPlayButton(false);
  }, []);

  const closePeer = useCallback(
    async (userId: number) => {
      const peer = peersRef.current.get(userId);

      if (!peer) return;

      peersRef.current.delete(userId);

      if (peer.disconnectTimer !== null) {
        window.clearTimeout(peer.disconnectTimer);
        peer.disconnectTimer = null;
      }

      peer.abortController.abort();
      peer.peerConnection.ontrack = null;
      peer.peerConnection.onconnectionstatechange = null;
      peer.peerConnection.close();

      peer.audio.pause();
      peer.audio.srcObject = null;
      peer.audio.removeAttribute("src");
      peer.audio.remove();

      if (peer.sessionUrl) {
        try {
          await deleteWhipSession(peer.sessionUrl);
        } catch {
        }
      }

      syncCoPublisherPlaybackUi();
    },
    [syncCoPublisherPlaybackUi],
  );

  const closeAllPeers = useCallback(
    async (resetUi = true) => {
      if (retryTimerRef.current !== null) {
        window.clearTimeout(retryTimerRef.current);
        retryTimerRef.current = null;
      }

      const userIds = Array.from(peersRef.current.keys());
      await Promise.all(userIds.map((userId) => closePeer(userId)));

      if (resetUi && !isUnmountedRef.current) {
        setListenerAudioMessage("");
        setShowListenerPlayButton(false);
      }
    },
    [closePeer],
  );

  const scheduleRetry = useCallback(() => {
    if (isUnmountedRef.current) return;
    if (retryTimerRef.current !== null) return;

    retryTimerRef.current = window.setTimeout(() => {
      retryTimerRef.current = null;
      setRetryNonce((current) => current + 1);
    }, WHEP_RETRY_DELAY_MS);
  }, []);

  const connectPeer = useCallback(
    async (userId: number, whepUrl: string) => {
      if (
        !canBroadcastRef.current ||
        !audioConnectedRef.current ||
        isUnmountedRef.current
      ) {
        return;
      }

      const desiredUrl = desiredPublishersRef.current.get(userId);
      if (desiredUrl !== whepUrl) return;

      const existing = peersRef.current.get(userId);

      if (existing?.whepUrl === whepUrl) {
        return;
      }

      if (existing) {
        await closePeer(userId);
      }

      if (desiredPublishersRef.current.get(userId) !== whepUrl) return;

      const abortController = new AbortController();
      const peerConnection = new RTCPeerConnection();
      const audio = document.createElement("audio");

      audio.autoplay = true;
      audio.volume = 1;
      audio.setAttribute("data-live-co-publisher-user-id", String(userId));
      audio.style.display = "none";
      document.body.appendChild(audio);

      const peer: CoPublisherPeer = {
        userId,
        whepUrl,
        peerConnection,
        audio,
        abortController,
        sessionUrl: null,
        disconnectTimer: null,
      };

      peersRef.current.set(userId, peer);

      peerConnection.addTransceiver("audio", { direction: "recvonly" });

      peerConnection.ontrack = (event) => {
        if (peersRef.current.get(userId) !== peer) return;

        audio.srcObject =
          event.streams[0] ?? new MediaStream([event.track]);
        audio.volume = 1;

        void audio.play().finally(() => {
          syncCoPublisherPlaybackUi();
        });
      };

      peerConnection.onconnectionstatechange = () => {
        if (peersRef.current.get(userId) !== peer) return;

        const state = peerConnection.connectionState;

        if (state === "connected") {
          if (peer.disconnectTimer !== null) {
            window.clearTimeout(peer.disconnectTimer);
            peer.disconnectTimer = null;
          }

          syncCoPublisherPlaybackUi();
          return;
        }

        if (state === "failed") {
          void closePeer(userId).then(() => {
            if (desiredPublishersRef.current.get(userId) === whepUrl) {
              scheduleRetry();
            }
          });
          return;
        }

        if (state === "disconnected" && peer.disconnectTimer === null) {
          peer.disconnectTimer = window.setTimeout(() => {
            peer.disconnectTimer = null;

            if (
              peersRef.current.get(userId) === peer &&
              peerConnection.connectionState === "disconnected"
            ) {
              void closePeer(userId).then(() => {
                if (desiredPublishersRef.current.get(userId) === whepUrl) {
                  scheduleRetry();
                }
              });
            }
          }, WHEP_RETRY_DELAY_MS);
        }
      };

      try {
        const offer = await peerConnection.createOffer();
        await peerConnection.setLocalDescription(offer);
        await waitForIceGatheringComplete(peerConnection);

        const sdpOffer = peerConnection.localDescription?.sdp;

        if (!sdpOffer) {
          throw new Error("WHEP SDP Offer 생성에 실패했습니다.");
        }

        const { sdpAnswer, sessionUrl } = await createWhepSession({
          whepUrl,
          sdpOffer,
          signal: abortController.signal,
        });

        if (
          abortController.signal.aborted ||
          peersRef.current.get(userId) !== peer ||
          desiredPublishersRef.current.get(userId) !== whepUrl
        ) {
          peerConnection.close();
          await deleteWhipSession(sessionUrl).catch(() => undefined);
          return;
        }

        peer.sessionUrl = sessionUrl;

        await peerConnection.setRemoteDescription({
          type: "answer",
          sdp: sdpAnswer,
        });
      } catch (error) {
        if (
          abortController.signal.aborted ||
          (error instanceof DOMException && error.name === "AbortError")
        ) {
          return;
        }

        await closePeer(userId);

        if (desiredPublishersRef.current.get(userId) === whepUrl) {
          if (!isUnmountedRef.current) {
            setListenerAudioMessage(
              error instanceof Error
                ? error.message
                : "공동 진행자 오디오 수신에 실패했어요.",
            );
            setShowListenerPlayButton(true);
          }

          scheduleRetry();
        }
      }
    },
    [closePeer, scheduleRetry, syncCoPublisherPlaybackUi],
  );

  const reconcileCoPublishers = useCallback(
    (publishers: LiveCoPublisher[]) => {
      const next = normalizeCoPublishers(publishers);
      desiredPublishersRef.current = next;
      setCoPublisherCount(next.size);

      for (const [userId, peer] of peersRef.current) {
        const nextWhepUrl = next.get(userId);

        if (!nextWhepUrl) {
          void closePeer(userId);
          continue;
        }

        if (nextWhepUrl !== peer.whepUrl) {
          void closePeer(userId).then(() => {
            if (desiredPublishersRef.current.get(userId) === nextWhepUrl) {
              void connectPeer(userId, nextWhepUrl);
            }
          });
        }
      }

      if (canBroadcastRef.current && audioConnectedRef.current) {
        for (const [userId, whepUrl] of next) {
          const existing = peersRef.current.get(userId);

          if (!existing) {
            void connectPeer(userId, whepUrl);
          }
        }
      }

      if (next.size === 0) {
        setListenerAudioMessage("");
        setShowListenerPlayButton(false);
      }
    },
    [closePeer, connectPeer],
  );

  const handleCoPublishersChanged = useCallback(
    (publishers: LiveCoPublisher[]) => {
      reconcileCoPublishers(publishers);
    },
    [reconcileCoPublishers],
  );

  const startBroadcasterMonitorPlayback = useCallback(async () => {
    const desiredPublishers = desiredPublishersRef.current;

    for (const [userId, whepUrl] of desiredPublishers) {
      if (!peersRef.current.has(userId)) {
        void connectPeer(userId, whepUrl);
      }
    }

    const playableAudios = Array.from(peersRef.current.values())
      .map((peer) => peer.audio)
      .filter((audio) => audio.srcObject !== null);

    if (playableAudios.length === 0) {
      scheduleRetry();
      return;
    }

    await Promise.allSettled(
      playableAudios.map(async (audio) => {
        audio.volume = 1;
        await audio.play();
      }),
    );

    syncCoPublisherPlaybackUi();
  }, [
    connectPeer,
    scheduleRetry,
    syncCoPublisherPlaybackUi,
  ]);

  useEffect(() => {
    const liveId = live?.liveId ?? null;

    if (!liveId) {
      initialSnapshotLiveIdRef.current = null;
      return;
    }

    if (initialSnapshotLiveIdRef.current === liveId) {
      return;
    }

    initialSnapshotLiveIdRef.current = liveId;
    reconcileCoPublishers(live?.coPublishers ?? []);
  }, [live?.coPublishers, live?.liveId, reconcileCoPublishers]);

  useEffect(() => {
    if (!canBroadcast || !audioConnected) {
      void closeAllPeers(false);
      return;
    }

    reconcileCoPublishers(mapToPublisherList(desiredPublishersRef.current));
  }, [audioConnected, canBroadcast, closeAllPeers, reconcileCoPublishers]);

  useEffect(() => {
    if (!retryNonce || !canBroadcast || !audioConnected) return;

    reconcileCoPublishers(mapToPublisherList(desiredPublishersRef.current));
  }, [
    audioConnected,
    canBroadcast,
    reconcileCoPublishers,
    retryNonce,
  ]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      if (isListenerPlayback) {
        void closeAllPeers(false);
        void startListenerPlayback();
        return;
      }

      if (canBroadcast) {
        stopListenerPlayback(false);
        return;
      }

      stopListenerPlayback(false);
      void closeAllPeers(false);
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [
    canBroadcast,
    closeAllPeers,
    isListenerPlayback,
    startListenerPlayback,
    stopListenerPlayback,
  ]);

  useEffect(() => {
    return () => {
      isUnmountedRef.current = true;

      if (retryTimerRef.current !== null) {
        window.clearTimeout(retryTimerRef.current);
        retryTimerRef.current = null;
      }

      stopListenerPlayback(false);
      void closeAllPeers(false);
    };
  }, [closeAllPeers, stopListenerPlayback]);

  return {
    handleCoPublishersChanged,
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