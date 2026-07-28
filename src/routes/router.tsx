import { createBrowserRouter, Navigate, Outlet } from "react-router-dom";
import { MobileLayout } from "@/components/layout/MobileLayout";
import Splash from "@/pages/auth/Splash";
import Login from "@/pages/auth/LoginPage";
import AgreementPage from "@/pages/onboarding/AgreementPage";
import SignupPage from "@/pages/onboarding/SignupPage";
import ModeSelecPage from "@/pages/onboarding/ModeSelectPage";
import FanNicknamePage from "@/pages/onboarding/FanNicknamePage";
import GenreSelectPage from "@/pages/onboarding/GenreSelectPage";
import RegionSelectPage from "@/pages/onboarding/RegionSelectPage";
import OnboardingCompletePage from "@/pages/onboarding/OnboardingCompletePage";
import OAuthCallbackPage from "@/pages/auth/OAuthCallbackPage";
import BandHomePage from "@/pages/band/home/BandHomePage";
import ProfileFormPage from "@/pages/band/my/ProfileFormPage";
import BandNotificationPage from "@/pages/band/home/NotificationPage";
import InviteMemberPage from "@/pages/band/my/InviteMemberPage";
import ConcertRegisterPage from "@/pages/band/home/ConcertRegisterPage";
import CompletePage from "@/pages/band/home/CompletePage";
import MusicRegisterPage from "@/pages/band/home/MusicRegisterPage";
import ContentRegisterPage from "@/pages/band/home/ContentRegisterPage";
import FanHomePage from "@/pages/fan/home/FanHomePage";
import FanMyPage from "@/pages/fan/my/MyPage";
import FollowedBandsPage from "@/pages/fan/my/FollowedBandsPage";
import InterestedConcertsPage from "@/pages/fan/my/InterestedConcertsPage";
import AttendedConcertsPage from "@/pages/fan/my/AttendedConcertsPage";
import ConcertAlertSettingsPage from "@/pages/fan/my/ConcertAlertSettingsPage";
import FanLiveAlertSettingsPage from "@/pages/fan/my/LiveAlertSettingsPage";
import ProfileEditPage from "@/pages/fan/my/ProfileEditPage";
import FanExplorePage from "@/pages/fan/explore/FanExplorePage";
import FanExploreSearchPage from "@/pages/fan/explore/FanExploreSearchPage";
import FanExploreSearchResultPage from "@/pages/fan/explore/FanExploreSearchResultPage";
import FanExploreConcertMorePage from "@/pages/fan/explore/FanExploreConcertMorePage";
import FanExploreContentMorePage from "@/pages/fan/explore/FanExploreContentMorePage";
import FanContentDetailPage from "@/pages/fan/explore/FanContentDetailPage";
import FanBandProfilePage from "@/pages/fan/explore/FanBandProfilePage";
import FollowedBandNewsPage from "@/pages/fan/home/FollowedBandNewsPage";
import FollowedConcertsPage from "@/pages/fan/home/FollowedConcertsPage";
import ConcertCalendarPage from "@/pages/fan/home/ConcertCalendarPage";
import ConcertDetailPage from "@/pages/fan/home/ConcertDetailPage";
import NotificationPage from "@/pages/fan/home/NotificationPage";
import {
  FanLiveHomePage,
  FanLiveNowPage,
  FanLivePage,
  FanLivePlaybackPage,
  FanLiveReplayPage,
  FanLiveScheduledPage,
} from "@/pages/fan/live";
import { BandLivePage } from "@/pages/band/live/BandLivePage";
import BandSessionPage from "@/pages/band/session/BandSessionPage";
import MemberInviteSearchPage from "@/pages/band/home/MemberInviteSearchPage";
import ApplicationManagementPage from "@/pages/band/my/ApplicationManagementPage";
import PostingManagementPage from "@/pages/band/my/PostingManagementPage";
import MyPage from "@/pages/band/my/MyPage";
import RecruitAlertSettingsPage from "@/pages/band/my/RecruitAlertSettingsPage";
import LiveAlertSettingsPage from "@/pages/band/my/LiveAlertSettingsPage";
import SessionMailboxPage from "@/pages/band/session/components/SessionMailboxPage";
import SessionChatPage from "@/pages/band/session/components/SessionChatPage";
import ApplicationDetailPage from "@/pages/band/my/ApplicationDetailPage";

export const router = createBrowserRouter([
  {
    element: (
      <MobileLayout showBottomNav={false}>
        <Outlet />
      </MobileLayout>
    ),
    children: [
      //onboarding
      {
        path: "/",
        element: <Splash />,
      },
      {
        path: "/login",
        element: <Login />,
      },
      {
        path: "/oauth/callback/kakao",
        element: <OAuthCallbackPage />,
      },
      {
        path: "/oauth/callback/google",
        element: <OAuthCallbackPage />,
      },
      {
        path: "/oauth/callback",
        element: <OAuthCallbackPage />,
      },
      {
        path: "/onboarding/agreement",
        element: <AgreementPage />,
      },
      {
        path: "/signup",
        element: <SignupPage />,
      },
      {
        path: "/onboarding/mode",
        element: <ModeSelecPage />,
      },
      {
        path: "/onboarding/fan-nickname",
        element: <FanNicknamePage />,
      },
      {
        path: "/onboarding/genre",
        element: <GenreSelectPage />,
      },
      {
        path: "/onboarding/region",
        element: <RegionSelectPage />,
      },
      {
        path: "/onboarding/complete",
        element: <OnboardingCompletePage />,
      },
      {
        path: "/home",
        element: <Navigate to="/fan/home" replace />,
      },
      {
        path: "/fan/home/concerts/:concertId",
        element: <ConcertDetailPage />,
      },
      {
        path: "/fan/home/notifications",
        element: <NotificationPage />,
      },
      {
        path: "/fan/explore/contents/:contentId",
        element: <FanContentDetailPage />,
      },
      {
        path: "/band/live",
        element: <BandLivePage />,
      },
      {
        path: "/fan/live",
        element: <FanLiveHomePage />,
      },
      {
        path: "/fan/live/room",
        element: <FanLivePage />,
      },
      {
        path: "/fan/live/now",
        element: <FanLiveNowPage />,
      },
      {
        path: "/fan/live/scheduled",
        element: <FanLiveScheduledPage />,
      },
      {
        path: "/fan/live/replays",
        element: <FanLiveReplayPage />,
      },
      {
        path: "/fan/live/replays/:replayId",
        element: <FanLivePlaybackPage />,
      },
      {
        path: "/band/notifications",
        element: <BandNotificationPage />,
      },
      {
        path: "/band/my/recruit-alert",
        element: <RecruitAlertSettingsPage />,
      },
      {
        path: "/band/my/live-alert",
        element: <LiveAlertSettingsPage />,
      },
      {
        path: "/band/my/applications/:applySubmissionId",
        element: <ApplicationDetailPage />,
      },
      {
        path: "/band/profile/edit",
        element: <ProfileFormPage mode="edit" />,
      },
      {
        path: "/band/profile/invite",
        element: <InviteMemberPage />,
      },
      {
        path: "/band/profile/invite/search",
        element: <MemberInviteSearchPage />,
      },
      {
        path: "/band/profile/applications",
        element: <ApplicationManagementPage />,
      },
      {
        path: "/band/profile/postings",
        element: <PostingManagementPage />,
      },
      {
        path: "/fan/my/profile/edit",
        element: <ProfileEditPage />,
      },
      {
        path: "/band/session/messages",
        element: <SessionMailboxPage />,
      },
      {
        path: "/band/session/messages/:messageId",
        element: <SessionChatPage />,
      },
    ],
  },
  {
    element: (
      <MobileLayout showBottomNav={true}>
        <Outlet />
      </MobileLayout>
    ),
    children: [
      //band
      {
        path: "/fan/home",
        element: <FanHomePage />,
      },
      {
        path: "/fan/explore",
        element: <FanExplorePage />,
      },
      {
        path: "/fan/explore/search",
        element: <FanExploreSearchPage />,
      },
      {
        path: "/fan/explore/search/results",
        element: <FanExploreSearchResultPage />,
      },
      {
        path: "/fan/explore/search/results/concerts",
        element: <FanExploreConcertMorePage />,
      },
      {
        path: "/fan/explore/search/results/contents",
        element: <FanExploreContentMorePage />,
      },
      {
        path: "/fan/bands/:bandId",
        element: <FanBandProfilePage />,
      },
      {
        path: "/fan/home/news",
        element: <FollowedBandNewsPage />,
      },
      {
        path: "/fan/home/concerts",
        element: <FollowedConcertsPage />,
      },
      {
        path: "/fan/home/concerts/calendar",
        element: <ConcertCalendarPage />,
      },
      {
        path: "/fan/my",
        element: <FanMyPage />,
      },
      {
        path: "/fan/my/followed-bands",
        element: <FollowedBandsPage />,
      },
      {
        path: "/fan/my/interested-concerts",
        element: <InterestedConcertsPage />,
      },
      {
        path: "/fan/my/attended-concerts",
        element: <AttendedConcertsPage />,
      },
      {
        path: "/fan/my/concert-alert",
        element: <ConcertAlertSettingsPage />,
      },
      {
        path: "/fan/my/live-alert",
        element: <FanLiveAlertSettingsPage />,
      },
      {
        path: "/band/home",
        element: <BandHomePage />,
      },
      {
        path: "/band/profile/new",
        element: <ProfileFormPage mode="create" />,
      },
      {
        path: "/band/concerts/new",
        element: <ConcertRegisterPage />,
      },
      {
        path: "/band/concerts/:concertId/edit",
        element: <ConcertRegisterPage />,
      },
      {
        path: "/band/register/complete",
        element: <CompletePage />,
      },
      {
        path: "/band/music/new",
        element: <MusicRegisterPage />,
      },
      {
        path: "/band/videos/new",
        element: <ContentRegisterPage />,
      },
      {
        path: "/band/session",
        element: <BandSessionPage />,
      },
      {
        path: "/band/my",
        element: <MyPage />,
      },
    ],
  },
]);
