import { useNavigate } from "react-router-dom";
import logoSignature from "@/assets/logo_signature.svg";
import kakaoLoginButton from "@/assets/btn_kakao_login.svg";
import googleLoginButton from "@/assets/btn_google_login.svg";
import Button from "@/components/common/Button/Button";

export default function Login() {
  const navigate = useNavigate();

  return (
    <main className="h-full w-full bg-neutral-0 px-[30px] pt-[104px]">
      <section className="w-full">
        <div className="flex justify-center">
          <img src={logoSignature} alt="B:Scene" className="h-auto w-[151px]" />
        </div>

        <div className="mt-[43px] text-center">
          <h1 className="text-label1 text-neutral-900">Be the Scene!</h1>
          <p className="mt-1 text-label2 text-neutral-900">
            당신이 무대가 되는 순간
          </p>
        </div>

        <form className="mt-[54px] flex flex-col gap-3">
          <input
            type="text"
            placeholder="아이디를 입력해주세요"
            className="h-[52px] w-full rounded-xl border border-neutral-400 bg-neutral-0 px-[19px] text-label3 text-neutral-900 outline-none placeholder:text-neutral-400 focus:border-primary-400"
          />

          <input
            type="password"
            placeholder="비밀번호를 입력해주세요"
            className="h-[52px] w-full rounded-xl border border-neutral-400 bg-neutral-0 px-[19px] text-label3 text-neutral-900 outline-none placeholder:text-neutral-400 focus:border-primary-400"
          />

          <Button className="mt-[14px] w-full" size="large" tone="pink" 
          onClick={() => navigate("/onboarding/agreement")}>
            로그인
          </Button>
        </form>

        <div className="mt-[12px] flex justify-center gap-[10px] text-caption1 text-neutral-600">
          <button type="button">회원가입</button>
          <span className="text-neutral-400">|</span>
          <button type="button">아이디 찾기</button>
          <span className="text-neutral-400">|</span>
          <button type="button">비밀번호 찾기</button>
        </div>

        <div className="mt-[54px] h-px w-full bg-neutral-400 opacity-40" />

        <div className="mt-[35px] flex flex-col gap-3">
          <button type="button" className="h-[52px] w-full">
            <img src={kakaoLoginButton} alt="카카오계정으로 로그인" className="h-full w-full" />
          </button>

          <button type="button" className="h-[52px] w-full">
            <img src={googleLoginButton} alt="구글 계정으로 로그인" className="h-full w-full" />
          </button>
        </div>
      </section>
    </main>
  );
}