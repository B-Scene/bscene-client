import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Modal from "@/components/Modal/Modal";
import { ModalOverlay } from "@/components/common/Modal/ModalOverlay";
import "./FanLivePage.css";
import {
  EmptyChatArea,
  FanLiveActionBar,
  FanLiveChatArea,
  FanLiveHeader,
  FanLiveHero,
  FanLiveMemberSheet,
  FanLiveProfileActionSheet,
} from "./components/FanLiveRoomParts";
import {
  FanLiveReportCompletePage,
  FanLiveReportPage,
} from "./components/FanLiveReportFlow";

type FanLiveView = "room" | "report" | "reportComplete";

export function FanLivePage() {
  const navigate = useNavigate();
  const [view, setView] = useState<FanLiveView>("room");
  const [isMemberSheetOpen, setIsMemberSheetOpen] = useState(false);
  const [hasOpenedChat, setHasOpenedChat] = useState(false);
  const [isChatComposerOpen, setIsChatComposerOpen] = useState(false);
  const [isProfileActionSheetOpen, setIsProfileActionSheetOpen] = useState(false);
  const [isExitModalOpen, setIsExitModalOpen] = useState(false);

  const handleToggleChat = () => {
    setHasOpenedChat(true);
    setIsChatComposerOpen((current) => !current);
  };

  if (view === "report") {
    return (
      <FanLiveReportPage
        onBack={() => setView("room")}
        onComplete={() => setView("reportComplete")}
      />
    );
  }

  if (view === "reportComplete") {
    return <FanLiveReportCompletePage onBackToLive={() => setView("room")} />;
  }

  return (
    <main className="relative h-full min-h-full overflow-hidden bg-neutral-0 text-neutral-900">
      <FanLiveHeader onExit={() => setIsExitModalOpen(true)} />
      <FanLiveHero />
      {hasOpenedChat ? (
        <FanLiveChatArea
          composerOpen={isChatComposerOpen}
          onProfileClick={() => setIsProfileActionSheetOpen(true)}
        />
      ) : (
        <EmptyChatArea />
      )}
      <FanLiveActionBar
        chatOpen={isChatComposerOpen}
        onOpenMembers={() => setIsMemberSheetOpen(true)}
        onToggleChat={handleToggleChat}
      />
      <FanLiveMemberSheet
        open={isMemberSheetOpen}
        onClose={() => setIsMemberSheetOpen(false)}
      />
      <FanLiveProfileActionSheet
        open={isProfileActionSheetOpen}
        onClose={() => setIsProfileActionSheetOpen(false)}
        onReport={() => {
          setIsProfileActionSheetOpen(false);
          setView("report");
        }}
      />
      <ModalOverlay
        open={isExitModalOpen}
        onClose={() => setIsExitModalOpen(false)}
        panelClassName="rounded-[24px]"
      >
        <Modal
          onCancel={() => setIsExitModalOpen(false)}
          onConfirm={() => navigate("/fan/live")}
        />
      </ModalOverlay>
    </main>
  );
}

export default FanLivePage;
