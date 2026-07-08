import { createBrowserRouter, Outlet } from "react-router-dom";
import { MobileLayout } from "@/components/layout/MobileLayout";
import Splash from "../pages/auth/Splash";
import Login from "../pages/auth/LoginPage";
import AgreementPage from "../pages/auth/AgreementPage";
import SignupPage from "../pages/auth/SingupPage";
import ModeSelecPage from "../pages/auth/ModeSelectPage";
import FanNicknamePage from "../pages/auth/FanNicknamePage";
import GenreSelectPage from "../pages/auth/GenreSelectPage";
import RegionSelectPage from "../pages/auth/RegionSelectPage";
import OnboardingCompletePage from "../pages/auth/OnboardingCompletePage";
import BandHomePage from "../pages/band/home/BandHomePage";
import EditProfilePage from "../pages/band/home/EditProfilePage";
import InviteMemberPage from "../pages/band/home/InviteMemberPage";
import ConcertRegisterPage from "../pages/band/home/ConcertRegisterPage";
import CompletePage from "../pages/band/home/CompletePage";
import MusicRegisterPage from "../pages/band/home/MusicRegisterPage";

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
        path: "/onboarding/agreement",
        element: <AgreementPage />,
      },
      {
        path: "/onboarding/signup",
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
        path: "/band/home",
        element: <BandHomePage />,
      },
      {
        path: "/band/profile/edit",
        element: <EditProfilePage />,
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
        path: "/band/register/complete",
        element: <CompletePage />,
      },
      {
        path: "/band/music/new",
        element: <MusicRegisterPage />,
      },
    ],
  },
]);
