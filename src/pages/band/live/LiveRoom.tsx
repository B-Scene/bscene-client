import Modal from "@/components/Modal/Modal";
import { ModalOverlay } from "@/components/common/Modal/ModalOverlay";
import type { ChatMessage, GoLiveScreen } from "./types";
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
  messages: ChatMessage[];
  onSendMessage: (message: string) => void;
  overlay?: "members" | "endConfirm";
}

export function LiveRoom({
  go,
  messages,
  onSendMessage,
  overlay,
}: LiveRoomProps) {
  return (
    <main className="relative flex min-h-dvh flex-col overflow-hidden bg-neutral-0 text-neutral-900">
      <LiveRoomHeader go={go} />
      <LiveRoomHero />
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
  messages,
  onSendMessage,
}: Omit<LiveRoomProps, "overlay">) {
  return (
    <main className="relative flex min-h-dvh flex-col overflow-hidden bg-neutral-0 text-neutral-900">
      <LiveRoomHeader go={go} />
      <LiveRoomHero />
      <RoomMessageArea messages={messages} />
      <ChatComposer onSendMessage={onSendMessage} />
      <LiveActionBar go={go} />
    </main>
  );
}
