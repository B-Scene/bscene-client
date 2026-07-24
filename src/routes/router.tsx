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
import ProfileFormPage from "@/pages/band/home/ProfileFormPage";
import BandNotificationPage from "@/pages/band/home/NotificationPage";
import InviteMemberPage from "@/pages/band/home/InviteMemberPage";
import ConcertRegisterPage from "@/pages/band/home/ConcertRegisterPage";
import CompletePage from "@/pages/band/home/CompletePage";
import MusicRegisterPage from "@/pages/band/home/MusicRegisterPage";
import ContentRegisterPage from "@/pages/band/home/ContentRegisterPage";
import FanHomePage from "@/pages/fan/home/FanHomePage";
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
        path: "/band/home",
        element: <BandHomePage />,
      },
      {
        path: "/band/profile/edit",
        element: <ProfileFormPage mode="edit" />,
      },
      {
        path: "/band/profile/new",
        element: <ProfileFormPage mode="create" />,
      },
      {
        path: "/band/profile/invite",
        element: <InviteMemberPage />,
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
    ],
  },
]);

