import { createBrowserRouter, Outlet } from "react-router-dom";
import { MobileLayout } from "@/components/layout/MobileLayout";
import Splash from "../pages/auth/Splash";
import Login from "../pages/auth/LoginPage";
import AgreementPage from "../pages/onboarding/AgreementPage";
import SignupPage from "../pages/onboarding/SingupPage";
import ModeSelecPage from "../pages/onboarding/ModeSelectPage";
import FanNicknamePage from "../pages/onboarding/FanNicknamePage";
import GenreSelectPage from "../pages/onboarding/GenreSelectPage";
import RegionSelectPage from "../pages/onboarding/RegionSelectPage";
import OnboardingCompletePage from "../pages/onboarding/OnboardingCompletePage";
import OAuthCallbackPage from "@/pages/auth/OAuthCallbackPage";
import HomePage from "@/pages/band/home/HomePage";


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
        element: <HomePage />,
      },
    ],
  },
]);
