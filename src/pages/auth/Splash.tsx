import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import logo from "@/assets/logo.svg";
import Login from "@/pages/auth/LoginPage";

export default function Splash() {
  const navigate = useNavigate();
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    const transitionTimer = window.setTimeout(() => {
      setIsTransitioning(true);
    }, 1500);

    const navigateTimer = window.setTimeout(() => {
      navigate("/login", { replace: true });
    }, 2200);

    return () => {
      window.clearTimeout(transitionTimer);
      window.clearTimeout(navigateTimer);
    };
  }, [navigate]);

  return (
    <div className="relative h-full w-full overflow-hidden bg-neutral-0">
      {/* 로그인 화면을 미리 뒤에 렌더링 */}
      <div
        className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
          isTransitioning ? "opacity-100" : "opacity-0"
        }`}
      >
        <Login />
      </div>

      {/* 스플래시 화면 */}
      <main
        className={`absolute inset-0 z-10 flex items-center justify-center transition-opacity duration-700 ease-in-out ${
          isTransitioning
            ? "pointer-events-none opacity-0"
            : "opacity-100"
        }`}
        style={{
          background: "linear-gradient(168deg, #FFE031 0%, #F04579 100%)",
        }}
      >
        <img
          src={logo}
          alt="B:Scene"
          className={`w-[74px] transition-all duration-700 ease-in-out ${
            isTransitioning
              ? "scale-105 opacity-0"
              : "scale-100 opacity-100"
          }`}
        />
      </main>
    </div>
  );
}