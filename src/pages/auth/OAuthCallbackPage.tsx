import { useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useOAuthExchange } from "@/hooks/api/auth/useAuth";
import { saveAuthenticatedUser } from "@/utils/authUser";

const OAuthCallbackPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { mutateAsync } = useOAuthExchange();

  const hasExchanged = useRef(false);

  useEffect(() => {
    const handleOAuthExchange = async () => {
      if (hasExchanged.current) return;
      hasExchanged.current = true;

      const code = searchParams.get("code");

      if (!code) {
        navigate("/login", { replace: true });
        return;
      }

      try {
        const data = await mutateAsync(code);


        if (data.isNewUser) {
          sessionStorage.setItem("signupToken", data.signupToken ?? "");
          sessionStorage.setItem("socialEmail", data.email ?? "");

          navigate("/signup", { replace: true });
          return;
        }

        if (data.token) {
          localStorage.setItem("accessToken", data.token.accessToken);
          localStorage.setItem("refreshToken", data.token.refreshToken);
          saveAuthenticatedUser({
            ...data.token.user,
            email:
              (data.token.user as { email?: string | null }).email ??
              data.email,
            fanNickname: (data.token.user as { fanNickname?: string | null })
              .fanNickname,
          });

          navigate(
            data.token.user.onboardingCompleted
              ? "/home"
              : "/onboarding/agreement",
            { replace: true },
          );
          return;
        }

        navigate("/login", { replace: true });
      } catch (error) {
        console.error(error);
        navigate("/login", { replace: true });
      }
    };

    handleOAuthExchange();
  }, [mutateAsync, navigate, searchParams]);

  return (
    <main className="flex min-h-dvh items-center justify-center bg-neutral-0">
      <p className="text-body2 text-neutral-700">로그인 처리 중...</p>
    </main>
  );
};

export default OAuthCallbackPage;
