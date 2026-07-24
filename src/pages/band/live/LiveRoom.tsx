import { useEffect, useState } from "react";
import Modal from "@/components/Modal/Modal";
import { ModalOverlay } from "@/components/common/Modal/ModalOverlay";
import { subscribeViewerCount } from "@/api/live/live";
import type { ActiveLive, ChatMessage, GoLiveScreen } from "./types";
import {
  ChatComposer,
  LiveActionBar,
  LiveRoomHeader,
  LiveRoomHero,
  MemberSheet,
  RoomMessageArea,
} from "./components/LiveRoomParts";

interface LiveRoomProps {
  go: GoLiveScreen;
  live: ActiveLive;
  messages: ChatMessage[];
  onSendMessage: (message: string) => void;
  overlay?: "members" | "endConfirm";
}

export function LiveRoom({
  go,
  live,
  messages,
  onSendMessage,
  overlay,
}: LiveRoomProps) {
  const [viewerCount, setViewerCount] = useState(live?.viewerCount ?? 0);

  useEffect(() => {
    if (!live?.liveId) return;

    const controller = new AbortController();

    subscribeViewerCount({
      liveId: live.liveId,
      watchOnly: true,
      onViewerCount: setViewerCount,
      signal: controller.signal,
    }).catch(() => {
      // SSE는 연결 종료/취소 시에도 에러가 날 수 있어서 화면에서는 조용히 처리
    });

    return () => {
      controller.abort();
    };
  }, [live?.liveId]);

  return (
    <main className="relative flex min-h-dvh flex-col overflow-hidden bg-neutral-0 text-neutral-900">
      <LiveRoomHeader go={go} viewerCount={viewerCount} />
      <LiveRoomHero live={live} />
      <RoomMessageArea messages={messages} />
      <ChatComposer onSendMessage={onSendMessage} />
      <LiveActionBar go={go} />

      {overlay === "members" ? <MemberSheet go={go} /> : null}

      {overlay === "endConfirm" ? (
        <ModalOverlay open onClose={() => go("room")}>
          <Modal
            tone="orange"
            title="라이브를 종료할까요?"
            description={
              <>
                라이브를 종료하면 청취자들이
                <br />
                자동으로 퇴장해요
              </>
            }
            cancelLabel="취소"
            confirmLabel="종료"
            onCancel={() => go("room")}
            onConfirm={() => go("ended")}
          />
        </ModalOverlay>
      ) : null}
    </main>
  );
}

export function LiveChatRoom({
  go,
  live,
  messages,
  onSendMessage,
}: Omit<LiveRoomProps, "overlay">) {
  return (
    <LiveRoom
      go={go}
      live={live}
      messages={messages}
      onSendMessage={onSendMessage}
    />
  );
}