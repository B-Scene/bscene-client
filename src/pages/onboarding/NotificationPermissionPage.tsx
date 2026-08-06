import { useState } from "react";
import { useNavigate } from "react-router-dom";
import NotificationIcon from "@/assets/icons/ic_Notification.svg";
import IPhoneIcon from "@/assets/icons/ic_iPhone.svg";
import Button from "@/components/common/Button/Button";
import { requestAndRegisterWebPushToken } from "@/utils/webPushNotifications";

const NotificationPermissionPage = () => {
  const navigate = useNavigate();
  const [isRequesting, setIsRequesting] = useState(false);

  const continueToComplete = () => {
    navigate("/onboarding/complete");
  };

  const handleAllowNotifications = async () => {
    if (isRequesting) return;

    setIsRequesting(true);

    try {
      await requestAndRegisterWebPushToken();
    } catch (error) {
      console.error("푸시 알림 설정에 실패했습니다.", error);
    } finally {
      continueToComplete();
    }
  };

  return (
    <main className="flex min-h-dvh flex-col bg-neutral-0 px-5 pt-[136px] pb-[84px]">
      <section className="flex flex-col items-center text-center">
        <div className="flex size-20 items-center justify-center rounded-full bg-[linear-gradient(135deg,#FFE031_14.64%,#F04579_85.36%)] shadow-[0_8px_18px_0_rgba(240,69,121,0.18)]">
          <img
            src={NotificationIcon}
            alt=""
            className="h-9 w-8 scale-[1.35] object-contain brightness-0 invert"
          />
        </div>

        <h1 className="mt-7 text-h2 text-neutral-900">
          중요한 소식을
          <br />
          놓치지 마세요
        </h1>

        <p className="mt-3 text-body2 leading-[22px] text-neutral-600">
          밴드 초대, 세션 지원 결과, 새로운 쪽지와
          <br />
          팔로우한 밴드의 공연, 라이브 소식을 바로 알려드려요.
        </p>

        <aside className="mt-11 flex w-full flex-col items-start gap-2.5 rounded-xl border border-[#FCD7E2] bg-[#FFF6F8] p-4 text-left">
          <div className="flex items-center gap-2">
            <img src={IPhoneIcon} alt="" className="h-5 w-[18px] shrink-0" />
            <strong className="font-body text-[14px] font-semibold leading-5 text-neutral-900">
              iPhone 사용자 안내
            </strong>
          </div>

          <p className="font-body text-[13px] font-medium leading-5 text-neutral-600">
            iPhone에서는 B:Scene을 홈 화면에 추가해야 알림을 받을 수
            있어요.
            <br />
            Safari 공유 버튼 → 홈 화면에 추가
          </p>
        </aside>
      </section>

      <div className="mt-auto flex flex-col items-center">
        <Button
          size="large"
          tone={isRequesting ? "gray" : "pink"}
          disabled={isRequesting}
          className="w-full"
          onClick={() => void handleAllowNotifications()}
        >
          {isRequesting ? "알림 설정 중..." : "알림 허용하고 시작하기"}
        </Button>

        <button
          type="button"
          disabled={isRequesting}
          onClick={continueToComplete}
          className="mt-3 flex h-10 items-center justify-center font-body text-[15px] font-semibold leading-5 text-neutral-600 disabled:cursor-not-allowed"
        >
          나중에 하기
        </button>

        <p className="mt-3 text-center font-body text-[12px] font-medium leading-[18px] text-neutral-400">
          알림 설정은 마이페이지에서 언제든 변경할 수 있어요.
        </p>
      </div>
    </main>
  );
};

export default NotificationPermissionPage;
