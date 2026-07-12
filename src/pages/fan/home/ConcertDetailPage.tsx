import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import Modal from "@/components/Modal/Modal";
import { ModalOverlay } from "@/components/common/Modal/ModalOverlay";
import NotificationOffIcon from "@/assets/icons/Notification Off.svg";
import CloseIcon from "@/assets/icons/close.svg";
import HeartIcon from "@/assets/icons/Heart.svg";
import ShareIcon from "@/assets/icons/ic_share.svg";
import LikedHeartIcon from "@/assets/icons/Union.svg";
import BandProfileImage from "@/assets/icons/band/band-default-profile.svg";

const CONCERT_INFO = [
  { label: "공연 일시", value: "2026.04.12. (토) 19:00" },
  { label: "공연 장소", value: "홍대 롤링홀" },
  { label: "티켓 가격", value: "66,000원 (전석 스탠딩)" },
  { label: "관람 연령", value: "만 15세이상" },
];

const SUMMARY_INFO = CONCERT_INFO.slice(0, 3);
const TABS = ["공연정보", "공연소개", "캐스팅"] as const;

type ConcertDetailTab = (typeof TABS)[number];
type KakaoSharePayload = {
  objectType: "text";
  text: string;
  link: {
    mobileWebUrl: string;
    webUrl: string;
  };
  buttonTitle: string;
};

type KakaoShareApi = {
  sendDefault: (payload: KakaoSharePayload) => void;
};

declare global {
  interface Window {
    Kakao?: {
      Share?: KakaoShareApi;
      Link?: KakaoShareApi;
    };
  }
}

const ImagePlaceholderIcon = () => (
  <svg
    width="30"
    height="30"
    viewBox="0 0 24 24"
    fill="none"
    aria-hidden="true"
  >
    <rect
      x="3"
      y="4"
      width="18"
      height="16"
      rx="2"
      stroke="currentColor"
      strokeWidth="2"
    />
    <path
      d="M6 16L10 12L13 15L15 13L19 17"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <circle cx="16.5" cy="8.5" r="1.5" fill="currentColor" />
  </svg>
);

const ChevronLeftIcon = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    aria-hidden="true"
  >
    <path
      d="M16.75 20.34C17.114 20.7544 17.0737 21.3853 16.66 21.75C16.2456 22.114 15.6147 22.0737 15.25 21.66L7.24999 12.66C6.91834 12.2825 6.91834 11.7175 7.24999 11.34L15.25 2.34003C15.4806 2.05369 15.8498 1.91701 16.2113 1.9841C16.5728 2.0512 16.8683 2.31126 16.9808 2.66129C17.0933 3.01132 17.0047 3.39487 16.75 3.66003L9.33999 12L16.75 20.34Z"
      fill="white"
    />
  </svg>
);

const ArrowRightIcon = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    aria-hidden="true"
  >
    <path
      d="M9 6L15 12L9 18"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const NotificationOnIcon = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    aria-hidden="true"
  >
    <path
      d="M13 21C13.5523 21 14 21.4477 14 22C14 22.5523 13.5523 23 13 23H11C10.4477 23 10 22.5523 10 22C10 21.4477 10.4477 21 11 21H13ZM12 1C13.1046 1 14 1.89543 14 3C14 3.09664 13.9898 3.1912 13.9766 3.28418C16.8799 4.13731 19 6.82054 19 10V18H20C20.5523 18 21 18.4477 21 19C21 19.5523 20.5523 20 20 20H4C3.44772 20 3 19.5523 3 19C3 18.4477 3.44772 18 4 18H5V10C5 6.82087 7.11957 4.1376 10.0225 3.28418C10.0092 3.19125 10 3.09659 10 3C10 1.89543 10.8954 1 12 1Z"
      fill="currentColor"
    />
  </svg>
);

const KakaoTalkIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="20"
    height="20"
    viewBox="0 0 20 20"
    fill="none"
    aria-hidden="true"
  >
    <path
      d="M20 10C20 15.5228 15.5228 20 10 20C4.47715 20 0 15.5228 0 10C0 4.47715 4.47715 0 10 0C15.5228 0 20 4.47715 20 10Z"
      fill="#FEE500"
    />
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M10 6.48889C7.83877 6.48889 6.08696 7.87243 6.08696 9.57879C6.08696 10.64 6.76452 11.5755 7.79631 12.132L7.36219 13.7531C7.32383 13.8964 7.48409 14.0105 7.60716 13.9275L9.51015 12.6436C9.67074 12.6595 9.83395 12.6687 10 12.6687C12.1611 12.6687 13.913 11.2852 13.913 9.57879C13.913 7.87243 12.1611 6.48889 10 6.48889Z"
      fill="black"
    />
  </svg>
);

const LinkCopyIcon = () => (
  <span
    aria-hidden="true"
    className="flex size-5 items-center justify-center rounded-full bg-neutral-600"
  >
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="9"
      height="10"
      viewBox="0 0 9 10"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M3.30934 7.82498L2.56514 8.69077C2.37 8.9244 2.10532 9.05565 1.82935 9.05565C1.55338 9.05565 1.28871 8.9244 1.09356 8.69077C0.898419 8.45715 0.788789 8.14028 0.788789 7.80988C0.788789 7.47948 0.898419 7.16261 1.09356 6.92898L3.00241 4.63865C3.18976 4.41362 3.44221 4.28341 3.70751 4.27498C3.97281 4.26655 4.23067 4.38053 4.42773 4.59335L4.47819 4.64369C4.55792 4.73714 4.66539 4.78884 4.77696 4.78743C4.88854 4.78601 4.99507 4.73159 5.07312 4.63614C5.15118 4.54068 5.19437 4.41201 5.19319 4.27844C5.192 4.14486 5.14655 4.01732 5.06682 3.92387C5.04309 3.88714 5.01783 3.85185 4.99114 3.81816C4.63222 3.44432 4.16804 3.24777 3.6926 3.26833C3.21717 3.28889 2.76604 3.52503 2.43059 3.9289L0.496523 6.21923C0.16788 6.64749 -0.00985925 7.2112 0.000422442 7.79264C0.0107041 8.37407 0.208212 8.92827 0.551699 9.3395C0.895187 9.75073 1.35809 9.98719 1.84375 9.99949C2.32941 10.0118 2.80026 9.79901 3.15797 9.40556L3.88535 8.55486C3.95717 8.46106 3.99665 8.33817 3.99585 8.21093C3.99505 8.08368 3.95402 7.96152 3.88103 7.86903C3.80803 7.77654 3.70849 7.72057 3.60242 7.7124C3.49635 7.70423 3.39163 7.74445 3.30934 7.82498ZM7.80395 0.657003C7.45026 0.23619 6.97187 0 6.47323 0C5.97458 0 5.49619 0.23619 5.1425 0.657003L4.41512 1.5077C4.3433 1.6015 4.30382 1.72439 4.30462 1.85163C4.30543 1.97888 4.34645 2.10104 4.41945 2.19353C4.49244 2.28602 4.59199 2.34199 4.69806 2.35016C4.80412 2.35833 4.90884 2.31811 4.99114 2.23758L5.71852 1.37179C5.91366 1.13816 6.17833 1.00691 6.4543 1.00691C6.73028 1.00691 6.99495 1.13816 7.19009 1.37179C7.38524 1.60542 7.49487 1.92228 7.49487 2.25268C7.49487 2.58308 7.38524 2.89995 7.19009 3.13358L5.28125 5.42391C5.09389 5.64894 4.84145 5.77915 4.57615 5.78758C4.31085 5.79601 4.05299 5.68203 3.85592 5.46921L3.80547 5.41887C3.72574 5.32542 3.61826 5.27372 3.50669 5.27513C3.39512 5.27655 3.28859 5.33097 3.21053 5.42642C3.13247 5.52188 3.08928 5.65055 3.09047 5.78412C3.09165 5.9177 3.13711 6.04524 3.21684 6.13869C3.24738 6.17609 3.27966 6.21138 3.31354 6.2444C3.67289 6.61712 4.13688 6.81293 4.61202 6.79238C5.08716 6.77183 5.53813 6.53645 5.87408 6.13366L7.78713 3.84333C8.14087 3.42255 8.34118 2.8513 8.34433 2.25432C8.34748 1.65733 8.15322 1.0831 7.80395 0.657003Z"
        fill="white"
      />
    </svg>
  </span>
);

const Tag = ({ children }: { children: string }) => (
  <span className="rounded-full bg-primary-50 px-[9px] py-[3px] font-body text-caption5 text-primary-400">
    {children}
  </span>
);

const InfoRows = ({
  rows,
  valueClassName = "text-body1 text-neutral-900",
}: {
  rows: ReadonlyArray<{ label: string; value: string }>;
  valueClassName?: string;
}) => (
  <dl className="m-0 flex flex-col gap-[10px]">
    {rows.map((item) => (
      <div key={item.label} className="grid grid-cols-[88px_1fr] gap-2">
        <dt className="font-body text-caption2 text-neutral-700">
          {item.label}
        </dt>
        <dd className={`m-0 text-right font-body ${valueClassName}`}>
          {item.value}
        </dd>
      </div>
    ))}
  </dl>
);

const ConcertDetailPage = () => {
  const navigate = useNavigate();
  const concertInfoRef = useRef<HTMLElement | null>(null);
  const concertIntroRef = useRef<HTMLElement | null>(null);
  const castingRef = useRef<HTMLElement | null>(null);
  const [selectedTab, setSelectedTab] =
    useState<ConcertDetailTab>("공연정보");
  const [isLiked, setIsLiked] = useState(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isShareSheetOpen, setIsShareSheetOpen] = useState(false);
  const [isNotificationModalOpen, setIsNotificationModalOpen] =
    useState(false);
  const [isNotificationEnabled, setIsNotificationEnabled] = useState(false);

  useEffect(() => {
    if (!toastMessage) return;

    const timerId = window.setTimeout(() => {
      setToastMessage(null);
    }, 2500);

    return () => window.clearTimeout(timerId);
  }, [toastMessage]);

  const handleLikeClick = () => {
    const nextLiked = !isLiked;

    setIsLiked(nextLiked);
    if (!nextLiked) {
      setToastMessage("관심 공연을 해제했어요");
    }
  };

  const handleTabClick = (tab: ConcertDetailTab) => {
    const sectionRef =
      tab === "공연정보"
        ? concertInfoRef
        : tab === "공연소개"
          ? concertIntroRef
          : castingRef;

    setSelectedTab(tab);
    sectionRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  const handleNotificationClick = () => {
    if (isNotificationEnabled) {
      setIsNotificationEnabled(false);
      return;
    }

    setIsNotificationEnabled(true);
    setIsNotificationModalOpen(true);
  };

  const getConcertLink = () => window.location.href;

  const handleKakaoShareClick = () => {
    const concertLink = getConcertLink();
    const kakaoShareApi = window.Kakao?.Share ?? window.Kakao?.Link;

    if (kakaoShareApi) {
      try {
        kakaoShareApi.sendDefault({
          objectType: "text",
          text: "WAVY 단독 공연",
          link: {
            mobileWebUrl: concertLink,
            webUrl: concertLink,
          },
          buttonTitle: "공연 보러가기",
        });
        setIsShareSheetOpen(false);
        setToastMessage("카카오톡 공유 화면을 열었어요");
      } catch {
        setToastMessage("카카오톡 공유를 시작하지 못했어요");
      }

      return;
    }

    const shareUrl = `https://sharer.kakao.com/talk/friends/picker/link?url=${encodeURIComponent(
      concertLink,
    )}&text=${encodeURIComponent("WAVY 단독 공연")}`;
    const shareWindow = window.open(shareUrl, "_blank");

    if (!shareWindow) {
      setToastMessage("카카오톡 공유를 시작하지 못했어요");
      return;
    }

    shareWindow.opener = null;
    setIsShareSheetOpen(false);
    setToastMessage("카카오톡 공유 화면을 열었어요");
  };

  const handleCopyLinkClick = async () => {
    if (!window.isSecureContext || !navigator.clipboard) {
      setToastMessage("보안 연결에서만 링크를 복사할 수 있어요");
      return;
    }

    try {
      await navigator.clipboard.writeText(getConcertLink());
      setIsShareSheetOpen(false);
      setToastMessage("링크를 복사했어요");
    } catch {
      setToastMessage("링크 복사에 실패했어요");
    }
  };

  return (
    <main className="min-h-dvh bg-neutral-0">
      <section className="relative flex h-[492px] w-full items-center justify-center bg-neutral-400 text-neutral-700">
        <div className="absolute left-0 top-11 flex w-full items-center justify-between pl-[15px] pr-6 text-neutral-0">
          <button
            type="button"
            aria-label="뒤로가기"
            onClick={() => navigate(-1)}
            className="flex size-6 items-center justify-center"
          >
            <ChevronLeftIcon />
          </button>

          <div className="flex items-center gap-4">
            <button
              type="button"
              aria-label={
                isNotificationEnabled ? "공연 알림 설정됨" : "공연 알림 설정"
              }
              aria-pressed={isNotificationEnabled}
              onClick={handleNotificationClick}
              className="flex size-6 items-center justify-center"
            >
              {isNotificationEnabled ? (
                <span className="flex size-6 items-center justify-center text-neutral-0">
                  <NotificationOnIcon />
                </span>
              ) : (
                <img src={NotificationOffIcon} alt="" className="size-6" />
              )}
            </button>
            <button
              type="button"
              aria-label="공유하기"
              onClick={() => setIsShareSheetOpen(true)}
              className="flex size-6 items-center justify-center"
            >
              <img src={ShareIcon} alt="" className="size-6" />
            </button>
          </div>
        </div>

        <ImagePlaceholderIcon />
      </section>

      <section className="px-6 pb-6 pt-[24px]">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <span className="inline-flex h-5 items-center rounded-[5px] bg-primary-50 px-[15px] font-body text-caption3 text-primary-400">
              D-6
            </span>
            <h1 className="m-0 mt-1 font-body text-[24px] font-bold leading-[38px] tracking-[0.72px] text-neutral-900">
              WAVY 단독 공연
            </h1>
            <p className="m-0 font-body text-caption2 text-neutral-600">
              인디록 · 서울
            </p>
          </div>

          <button
            type="button"
            aria-label={isLiked ? "좋아요 취소" : "좋아요"}
            aria-pressed={isLiked}
            onClick={handleLikeClick}
            className="mt-[38px] flex size-6 shrink-0 items-center justify-center"
          >
            <img
              src={isLiked ? LikedHeartIcon : HeartIcon}
              alt=""
              className="size-6"
            />
          </button>
        </div>

        <section className="mt-4 rounded-[12px] bg-neutral-0 px-4 pb-3 pt-3 shadow-[0_0_8px_0_rgba(0,0,0,0.10)]">
          <InfoRows rows={SUMMARY_INFO} />

          <button
            type="button"
            className="mt-4 flex h-[44px] w-full items-center justify-center rounded-[12px] border-[1.2px] border-primary-400 font-body text-label2 text-primary-400"
          >
            예매하기
          </button>
        </section>
      </section>

      <nav
        aria-label="공연 상세 메뉴"
        className="sticky top-0 z-10 grid h-[43px] grid-cols-3 border-b border-neutral-400 bg-neutral-0"
      >
        {TABS.map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => handleTabClick(tab)}
            className={`relative flex items-center justify-center font-body text-body1 ${
              selectedTab === tab ? "text-neutral-900" : "text-neutral-400"
            }`}
          >
            {tab}
            {selectedTab === tab ? (
              <span className="absolute bottom-[-1px] h-[2px] w-full bg-primary-400" />
            ) : null}
          </button>
        ))}
      </nav>

      <section ref={concertInfoRef} className="scroll-mt-[43px] px-[29px] py-4">
        <h2 className="m-0 font-body text-body1 text-neutral-900">공연정보</h2>
        <div className="mt-[17px]">
          <InfoRows
            rows={CONCERT_INFO}
            valueClassName="text-body2 text-neutral-800"
          />
        </div>
      </section>

      <div className="h-4 bg-primary-0" />

      <section ref={concertIntroRef} className="scroll-mt-[43px] px-6 pb-6 pt-4">
        <h2 className="m-0 font-body text-body1 text-neutral-900">공연소개</h2>
        <p className="m-0 mt-[20px] font-body text-caption2 text-neutral-900">
          WAVY의 새로운 시작을 함께해요.
          <br />
          따뜻한 사운드와 진심 어린 음악으로 여러분을 초대합니다.
        </p>

        <div className="mt-6 flex gap-1">
          <Tag>WAVY</Tag>
          <Tag>단독공연</Tag>
          <Tag>라이브</Tag>
        </div>
      </section>

      <div className="h-4 bg-primary-0" />

      <section ref={castingRef} className="scroll-mt-[43px] px-[29px] pb-12 pt-[16px]">
        <h2 className="m-0 font-body text-body1 text-neutral-900">캐스팅</h2>

        <article className="mt-4 flex h-[60px] items-center justify-between rounded-[8px] bg-neutral-0 px-4 shadow-[0_0_8px_0_rgba(0,0,0,0.10)]">
          <div className="flex min-w-0 items-center gap-[18px]">
            <img
              src={BandProfileImage}
              alt=""
              className="size-[35px] shrink-0 rounded-full object-cover"
            />
            <div className="min-w-0">
              <h3 className="m-0 truncate font-body text-caption3 text-neutral-900">
                WAVY
              </h3>
              <p className="m-0 truncate font-body text-caption2 text-neutral-600">
                인디록 · 서울
              </p>
            </div>
          </div>

          <button
            type="button"
            aria-label="WAVY 밴드 상세보기"
            className="flex size-6 shrink-0 items-center justify-center text-neutral-400"
          >
            <ArrowRightIcon />
          </button>
        </article>
      </section>

      {toastMessage ? (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-[42px] left-1/2 z-50 flex w-[353px] -translate-x-1/2 flex-col items-start gap-2.5 rounded-xl bg-neutral-800 px-6 py-[14px]"
        >
          <div className="flex w-full items-center gap-[12px]">
            <span
              aria-hidden="true"
              className="flex size-4 shrink-0 items-center justify-center rounded-full bg-neutral-0"
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 18 18"
                fill="none"
                aria-hidden="true"
              >
                <path
                  d="M5.25 9.375L7.5 11.625L12.75 6.375"
                  stroke="var(--color-neutral-800)"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
            <p className="m-0 flex-1 font-body text-body1 leading-5 text-neutral-0">
              {toastMessage}
            </p>
            <button
              type="button"
              aria-label="토스트 닫기"
              onClick={() => setToastMessage(null)}
              className="flex size-5 shrink-0 items-center justify-center"
            >
              <img
                src={CloseIcon}
                alt=""
                className="size-6 brightness-0 invert"
              />
            </button>
          </div>
        </div>
      ) : null}

      {isShareSheetOpen ? (
        <div className="fixed inset-0 z-40 flex items-end">
          <button
            type="button"
            aria-label="공유하기 닫기"
            onClick={() => setIsShareSheetOpen(false)}
            className="absolute inset-0 bg-neutral-900/50"
          />

          <section
            aria-label="공유하기"
            className="relative z-10 h-[200px] w-full rounded-t-[24px] bg-neutral-0 px-[31.5px] pt-2"
          >
            <div className="mx-auto h-1 w-[44px] rounded-full bg-neutral-300" />
            <h2 className="m-0 mt-5 text-center font-body text-label1 text-neutral-900">
              공유하기
            </h2>

            <div className="mt-6 flex flex-col gap-6">
              <button
                type="button"
                onClick={handleKakaoShareClick}
                className="flex items-center gap-6 text-left font-body text-body1 text-neutral-900"
              >
                <KakaoTalkIcon />
                <span>카카오톡으로 링크 보내기</span>
              </button>
              <button
                type="button"
                onClick={handleCopyLinkClick}
                className="flex items-center gap-6 text-left font-body text-body1 text-neutral-900"
              >
                <LinkCopyIcon />
                <span>링크 복사하기</span>
              </button>
            </div>
          </section>
        </div>
      ) : null}

      <ModalOverlay
        open={isNotificationModalOpen}
        onClose={() => setIsNotificationModalOpen(false)}
      >
        <Modal
          title="공연 알림이 설정됐어요"
          description="공연 시작 전날에 알림을 보내드릴게요"
          confirmLabel="확인"
          showCancel={false}
          onConfirm={() => setIsNotificationModalOpen(false)}
        />
      </ModalOverlay>
    </main>
  );
};

export default ConcertDetailPage;
