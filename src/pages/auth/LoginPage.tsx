import { useState } from "react";
import { useNavigate } from "react-router-dom";
import logoSignature from "@/assets/logo_signature.svg";
import kakaoLoginButton from "@/assets/btn_kakao_login.svg";
import googleLoginButton from "@/assets/btn_google_login.svg";
import Button from "@/components/common/Button/Button";
import { useLogin } from "@/hooks/api/auth/useAuth";
import { saveAuthenticatedUser } from "@/utils/authUser";

export default function Login() {
  const navigate = useNavigate();
  const { mutate: loginMutate, isPending } = useLogin();

  const [loginId, setLoginId] = useState("");
  const [password, setPassword] = useState("");

  const isLoginValid = loginId.length > 0 && password.length > 0;

  const handleLogin = () => {
    if (!isLoginValid || isPending) return;

    loginMutate(
      { loginId, password },
      {
        onSuccess: (data) => {
          localStorage.setItem("accessToken", data.accessToken);
          localStorage.setItem("refreshToken", data.refreshToken);
          saveAuthenticatedUser({
            ...data.user,
            email: (data.user as { email?: string | null }).email,
            fanNickname: (data.user as { fanNickname?: string | null })
              .fanNickname,
          });

          navigate(
            data.user.onboardingCompleted ? "/home" : "/onboarding/agreement",
            { replace: true },
          );
        },
        onError: (error) => {
          console.error(error);
          alert("아이디 또는 비밀번호를 확인해주세요.");
        },
      },
    );
  };

  const handleSocialLogin = (provider: "kakao" | "google") => {
    const redirectOrigin = window.location.origin;

    window.location.href =
      `${import.meta.env.VITE_API_BASE_URL}/oauth2/authorization/${provider}` +
      `?redirect_origin=${encodeURIComponent(redirectOrigin)}`;
  };

  return (
    <main className="h-full w-full bg-neutral-0 px-[30px] pt-[104px]">
      <section className="w-full">
        <div className="flex justify-center">
          <img
            src={logoSignature}
            alt="B:Scene"
            className="h-auto w-[151px]"
          />
        </div>

        <div className="mt-[43px] text-center">
          <h1 className="text-h4 text-neutral-900">Be the Scene!</h1>

          <p className="mt-1 text-h4 text-neutral-900">
            당신이 무대가 되는 순간
          </p>
        </div>

        <form
          className="mt-[54px] flex flex-col gap-3"
          onSubmit={(e) => {
            e.preventDefault();
            handleLogin();
          }}
        >
          <input
            type="text"
            value={loginId}
            onChange={(e) => setLoginId(e.target.value)}
            placeholder="아이디를 입력해주세요"
            className="h-[52px] w-full rounded-xl border border-neutral-400 bg-neutral-0 px-[19px] text-label3 text-neutral-900 outline-none placeholder:text-neutral-400 focus:border-primary-400"
          />

          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="비밀번호를 입력해주세요"
            className="h-[52px] w-full rounded-xl border border-neutral-400 bg-neutral-0 px-[19px] text-label3 text-neutral-900 outline-none placeholder:text-neutral-400 focus:border-primary-400"
          />

          <Button
            type="submit"
            className="mt-[14px] w-full"
            size="large"
            tone={isLoginValid ? "pink" : "gray"}
            disabled={!isLoginValid || isPending}
          >
            {isPending ? "로그인 중..." : "로그인"}
          </Button>
        </form>

        <div className="mt-[12px] flex justify-center gap-[10px] text-caption1 text-neutral-600">
          <button type="button" onClick={() => navigate("/signup")}>
            회원가입
          </button>

          <span className="text-neutral-400">|</span>

          <button type="button">아이디 찾기</button>

          <span className="text-neutral-400">|</span>

          <button type="button">비밀번호 찾기</button>
        </div>

        <div className="mt-[54px] h-px w-full bg-neutral-400 opacity-40" />

        <div className="mt-[29px]">
          <p className="text-center text-caption1 text-neutral-700">
            SNS 계정으로 간편 로그인
          </p>

          <div className="mt-[17px] flex items-center justify-center gap-[14px]">
            <button
              type="button"
              onClick={() => handleSocialLogin("kakao")}
              className="size-11 shrink-0"
              aria-label="카카오계정으로 로그인"
            >
              <img
                src={kakaoLoginButton}
                alt=""
                className="size-full object-contain"
              />
            </button>

            <button
              type="button"
              onClick={() => handleSocialLogin("google")}
              className="size-11 shrink-0"
              aria-label="구글 계정으로 로그인"
            >
              <img
                src={googleLoginButton}
                alt=""
                className="size-full object-contain"
              />
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}
