import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import logo from "@/assets/logo.svg";

export default function Splash() {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate("/login");
    }, 2000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <main className="flex min-h-screen justify-center bg-neutral-800">
      <section
        className="flex min-h-screen w-full max-w-[393px] items-center justify-center"
        style={{
          background: "linear-gradient(168deg, #FFE031 0%, #F04579 100%)",
        }}
      >
        <img src={logo} alt="B:Scene" className="w-[74px]" />
      </section>
    </main>
  );
}