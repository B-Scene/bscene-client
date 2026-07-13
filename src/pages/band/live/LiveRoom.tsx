import type { ChatMessage, GoLiveScreen } from "./types";
import { ConfirmDialog } from "./components/ConfirmDialog";
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
        <ConfirmDialog
          title="라이브를 종료할까요?"
          description="라이브를 종료하면 청취자들이 자동으로 퇴장해요"
          cancelLabel="취소"
          confirmLabel="종료"
          onCancel={() => go("room")}
          onConfirm={() => go("ended")}
        />
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
