import { useState } from "react";
import { initialChatMessages } from "./data";
import { BandLiveHome } from "./BandLiveHome";
import { EndedLive } from "./EndedLive";
import { CancelConfirm, LiveForm } from "./LiveForm";
import { LiveChatRoom, LiveRoom } from "./LiveRoom";
import type { ActiveLive, BandLiveScreen, ChatMessage } from "./types";

export function BandLivePage() {
  const [screen, setScreen] = useState<BandLiveScreen>("home");
  const [activeLive, setActiveLive] = useState<ActiveLive>(null);
  const [liveMessages, setLiveMessages] = useState<ChatMessage[]>(initialChatMessages);

  const handleSendMessage = (message: string) => {
    setLiveMessages((prevMessages) => [
      ...prevMessages,
      {
        id: Date.now(),
        sender: activeLive?.bandName ?? "WAVY",
        message,
        time: "지금",
        highlighted: true,
      },
    ]);
  };

  if (screen === "room") {
    return (
      <LiveRoom
        go={setScreen}
        live={activeLive}
        messages={liveMessages}
        onSendMessage={handleSendMessage}
      />
    );
  }

  if (screen === "members") {
    return (
      <LiveRoom
        go={setScreen}
        live={activeLive}
        messages={liveMessages}
        onSendMessage={handleSendMessage}
        overlay="members"
      />
    );
  }

  if (screen === "chat") {
    return (
      <LiveChatRoom
        go={setScreen}
        live={activeLive}
        messages={liveMessages}
        onSendMessage={handleSendMessage}
      />
    );
  }

  if (screen === "endConfirm") {
    return (
      <LiveRoom
        go={setScreen}
        live={activeLive}
        messages={liveMessages}
        onSendMessage={handleSendMessage}
        overlay="endConfirm"
      />
    );
  }

  if (screen === "ended") return <EndedLive go={setScreen} />;
  if (screen === "instantForm") return <LiveForm mode="instant" go={setScreen} onCreatedLive={setActiveLive} />;
  if (screen === "reserveForm") return <LiveForm mode="reserve" go={setScreen} onCreatedLive={setActiveLive} />;
  if (screen === "editForm") return <LiveForm mode="edit" go={setScreen} />;
  if (screen === "cancelConfirm") return <CancelConfirm go={setScreen} />;

  return <BandLiveHome go={setScreen} onEnterLive={setActiveLive} />;
}

export default BandLivePage;