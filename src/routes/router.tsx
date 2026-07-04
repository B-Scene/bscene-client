import { createBrowserRouter, Route } from "react-router-dom";
import Splash from "../pages/auth/Splash";
import Login from "../pages/auth/LoginPage";
import AgreementPage from "../pages/auth/AgreementPage";
import SignupPage from "../pages/auth/SingupPage";
import ModeSelecPage from "../pages/auth/ModeSelectPage";
import FanNicknamePage from "../pages/auth/FanNicknamePage";
import GenreSelectPage from "../pages/auth/GenreSelectPage";
import RegionSelectPage from "../pages/auth/RegionSelectPage";
import OnboardingCompletePage from "../pages/auth/OnboardingCompletePage";

export const router = createBrowserRouter([
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
]);
