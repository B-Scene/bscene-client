import { useRef, useState } from "react";
import type { AxiosError } from "axios";
import { useNavigate } from "react-router-dom";

import ArrowLeftIcon from "@/assets/icons/arrow-left.svg";
import UserDefaultProfileIcon from "@/assets/icons/band/user-default-profile.svg";
import PlayButtonIcon from "@/assets/icons/band/play-button.svg";
import Button from "@/components/common/Button/Button";
import {
  useMySessionApplicationDetailQuery,
  useSessionApplicationDetailQuery,
} from "@/hooks/api/session/useSessionApplication";
import { useCreateSessionChatRoomMutation } from "@/hooks/api/session/useSessionChat";
import type { SessionChatApiResponse } from "@/types/session/sessionChat";
import { getRenderableProfileImageUrl } from "@/utils/profileImageUrl";

interface SessionApplicationDetailScreenProps {
  sessionApplicationId: number;
  onBack: () => void;
  isOwnApplication?: boolean;
}

type DetailSectionId =
  | "introduction"
  | "information"
  | "career"
  | "portfolio";

interface DetailTab {
  id: DetailSectionId;
  label: string;
}

const DETAIL_TABS: DetailTab[] = [
  {
    id: "introduction",
    label: "소개",
  },
  {
    id: "information",
    label: "정보",
  },
  {
    id: "career",
    label: "경력",
  },
  {
    id: "portfolio",
    label: "포트폴리오",
  },
];

const DetailChip = ({
  children,
}: {
  children: string;
}) => {
  return (
    <span className="inline-flex h-[26px] items-center justify-center rounded-[8px] border border-neutral-400 bg-neutral-0 px-[15px] text-caption3 text-neutral-600">
      {children}
    </span>
  );
};

export const SessionApplicationDetailScreen = ({
  sessionApplicationId,
  onBack,
  isOwnApplication = false,
}: SessionApplicationDetailScreenProps) => {
  const navigate = useNavigate();
  const createChatRoomMutation =
    useCreateSessionChatRoomMutation();

  const publicDetailQuery =
    useSessionApplicationDetailQuery(
      isOwnApplication
        ? 0
        : sessionApplicationId,
    );

  const myDetailQuery =
    useMySessionApplicationDetailQuery(
      isOwnApplication
        ? sessionApplicationId
        : 0,
    );

  const detailQuery = isOwnApplication
    ? myDetailQuery
    : publicDetailQuery;

  const detail = isOwnApplication
    ? myDetailQuery.data
      ? {
          ...myDetailQuery.data,
          userId: null,
          nickname:
            myDetailQuery.data.name ||
            "닉네임 없음",
        }
      : undefined
    : publicDetailQuery.data;

  const [activeSection, setActiveSection] =
    useState<DetailSectionId>(
      "introduction",
    );

  const scrollContainerRef =
    useRef<HTMLElement>(null);

  const sectionRefs = useRef<
    Record<
      DetailSectionId,
      HTMLElement | null
    >
  >({
    introduction: null,
    information: null,
    career: null,
    portfolio: null,
  });

  const moveToSection = (
    sectionId: DetailSectionId,
  ) => {
    const scrollContainer =
      scrollContainerRef.current;
    const section =
      sectionRefs.current[sectionId];

    setActiveSection(sectionId);

    if (!scrollContainer || !section) {
      return;
    }

    const containerTop =
      scrollContainer.getBoundingClientRect().top;
    const sectionTop =
      section.getBoundingClientRect().top;

    scrollContainer.scrollTo({
      top:
        scrollContainer.scrollTop +
        sectionTop -
        containerTop -
        47,
      behavior: "smooth",
    });
  };

  const handleCreateChatRoom = async () => {
    if (
      !detail ||
      isOwnApplication ||
      createChatRoomMutation.isPending
    ) {
      return;
    }

    try {
      const room =
        await createChatRoomMutation.mutateAsync({
          contextType: "SESSION_SEARCH",
          sessionApplicationId,
        });

      navigate(
        `/band/session/messages/${room.chatRoomId}`,
        {
          state: {
            senderName:
              room.recipientName || detail.nickname,
            profileImageUrl:
              detail.profileImageUrl,
            chatRoomId: room.chatRoomId,
            canSend: true,
          },
        },
      );
    } catch (error) {
      const apiMessage = (
        error as AxiosError<
          SessionChatApiResponse<null>
        >
      ).response?.data?.message;

      window.alert(
        apiMessage ??
          "쪽지방 생성에 실패했어요. 잠시 후 다시 시도해주세요.",
      );
    }
  };

  return (
    <main
      ref={scrollContainerRef}
      className="fixed inset-0 z-50 mx-auto w-full max-w-[393px] overflow-y-auto bg-neutral-0 pb-[92px]"
    >
      <header className="flex h-12 w-full items-center bg-neutral-0 px-[15px] py-[5px]">
        <button
          type="button"
          aria-label="뒤로가기"
          onClick={onBack}
          className="flex size-[38px] items-center justify-center"
        >
          <img
            src={ArrowLeftIcon}
            alt=""
            className="size-6"
          />
        </button>
      </header>

      {detailQuery.isLoading ? (
        <section className="flex min-h-[560px] items-center justify-center text-caption1 text-neutral-500">
          지원서 정보를 불러오고 있어요
        </section>
      ) : detailQuery.isError ? (
        <section className="flex min-h-[560px] flex-col items-center justify-center px-6 text-center">
          <p className="text-caption1 text-neutral-500">
            지원서 정보를 불러오지
            못했어요
          </p>

          <button
            type="button"
            onClick={() =>
              detailQuery.refetch()
            }
            className="mt-3 rounded-[8px] bg-secondary-500 px-4 py-2 text-caption2 text-neutral-0"
          >
            다시 시도
          </button>
        </section>
      ) : detail ? (
        <>
          <section className="px-6 pt-[25px] pb-[30px]">
            <h1 className="text-h3 text-neutral-900">
              {detail.title}
            </h1>

            <div className="mt-[30px] flex items-center gap-[32px]">
              <img
                src={
                  getRenderableProfileImageUrl(detail.profileImageUrl) ||
                  UserDefaultProfileIcon
                }
                alt=""
                onError={(event) => {
                  event.currentTarget.onerror = null;
                  event.currentTarget.src = UserDefaultProfileIcon;
                }}
                className="size-24 shrink-0 rounded-full object-cover"
              />

              <div className="min-w-0">
                <strong className="block truncate text-label1 text-neutral-900">
                  {detail.nickname}
                </strong>

                <p className="mt-2 truncate text-caption3 text-neutral-600">
                  {detail.part} ·{" "}
                  {detail.skillLevel} ·{" "}
                  {detail.region}
                </p>
              </div>
            </div>
          </section>

          <nav
            aria-label="세션 지원서 상세 메뉴"
            className="sticky top-0 z-20 grid h-12 grid-cols-4 border-b border-neutral-400 bg-neutral-0"
          >
            {DETAIL_TABS.map((tab) => {
              const isActive =
                activeSection === tab.id;

              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() =>
                    moveToSection(tab.id)
                  }
                  className={`relative flex items-center justify-center text-body1 ${
                    isActive
                      ? "text-secondary-500"
                      : "text-neutral-400"
                  }`}
                >
                  {tab.label}

                  {isActive ? (
                    <span className="absolute inset-x-0 bottom-[-1px] h-0.5 bg-secondary-500" />
                  ) : null}
                </button>
              );
            })}
          </nav>

          <div className="px-6">
            <section
              ref={(element) => {
                sectionRefs.current.introduction =
                  element;
              }}
              className="scroll-mt-12 border-b border-neutral-300 py-[28px]"
            >
              <h2 className="text-label1 text-neutral-900">
                세션 소개
              </h2>

              <p className="mt-5 whitespace-pre-line text-body1 text-secondary-500">
                “
                {detail.oneLineIntro ||
                  "등록된 한줄 소개가 없어요"}
                ”
              </p>

              <p className="mt-3 whitespace-pre-line text-caption2 text-neutral-800">
                {detail.intro ||
                  "자기소개가 없습니다."}
              </p>
            </section>

            <section
              ref={(element) => {
                sectionRefs.current.information =
                  element;
              }}
              className="scroll-mt-12 border-b border-neutral-300 py-[28px]"
            >
              <h2 className="text-label1 text-neutral-900">
                세션 정보
              </h2>

              <dl className="mt-5 flex flex-col gap-5">
                <DetailInfo
                  label="파트"
                  values={[detail.part]}
                />

                <DetailInfo
                  label="실력대"
                  values={[
                    detail.skillLevel,
                  ]}
                />

                <DetailInfo
                  label="선호 장르"
                  values={detail.genre
                    .split(/[,/·]/)
                    .map((value) =>
                      value.trim(),
                    )}
                />

                <DetailInfo
                  label="활동 지역"
                  values={[detail.region]}
                />

                <DetailInfo
                  label="가능한 활동"
                  values={
                    detail.availableActivities
                  }
                  emptyText="등록된 가능 활동이 없어요"
                />
              </dl>
            </section>

            <section
              ref={(element) => {
                sectionRefs.current.career =
                  element;
              }}
              className="scroll-mt-12 border-b border-neutral-300 py-[28px]"
            >
              <h2 className="text-label1 text-neutral-900">
                경력
              </h2>

              {detail.careers.length >
              0 ? (
                <div className="mt-5 flex flex-col gap-5">
                  {detail.careers.map(
                    (career) => (
                      <article
                        key={
                          career.sessionApplicationCareerId
                        }
                        className="relative pl-7"
                      >
                        <span className="absolute top-[2px] left-1 size-2.5 rounded-full bg-secondary-400" />

                        <p className="text-body4 text-neutral-500">
                          {career.period}
                        </p>

                        <h3 className="mt-1 text-body6 text-neutral-800">
                          {career.name}
                        </h3>

                        {career.description ? (
                          <p className="mt-1 whitespace-pre-line text-caption2 text-neutral-700">
                            {
                              career.description
                            }
                          </p>
                        ) : null}
                      </article>
                    ),
                  )}
                </div>
              ) : (
                <p className="mt-5 text-caption2 text-neutral-500">
                  등록된 경력이 없어요
                </p>
              )}
            </section>

            <section
              ref={(element) => {
                sectionRefs.current.portfolio =
                  element;
              }}
              className="scroll-mt-12 py-[28px]"
            >
              <h2 className="text-label1 text-neutral-900">
                포트폴리오
              </h2>

              {detail.portfolioLinks
                .length > 0 ? (
                <div className="mt-5 flex flex-col gap-6">
                  {detail.portfolioLinks.map(
                    (link) => (
                      <a
                        key={
                          link.sessionApplicationLinkId
                        }
                        href={link.url}
                        target="_blank"
                        rel="noreferrer"
                        className="block"
                      >
                        <div className="relative flex h-[172px] w-full items-center justify-center overflow-hidden rounded-[8px] bg-neutral-400">
                          {link.thumbnailUrl ? (
                            <img
                              src={
                                link.thumbnailUrl
                              }
                              alt=""
                              className="size-full object-cover"
                            />
                          ) : null}

                          <img
                            src={
                              PlayButtonIcon
                            }
                            alt=""
                            className="absolute size-6"
                          />
                        </div>

                        <h3 className="mt-4 text-body1 text-neutral-800">
                          {link.title}
                        </h3>

                        <p className="mt-1 truncate text-caption2 text-neutral-500">
                          {link.url}
                        </p>
                      </a>
                    ),
                  )}
                </div>
              ) : (
                <p className="mt-5 text-caption2 text-neutral-500">
                  등록된 포트폴리오가
                  없어요
                </p>
              )}
            </section>
          </div>
        </>
      ) : null}

      {detail && !isOwnApplication ? (
        <div className="fixed inset-x-0 bottom-0 z-10 mx-auto w-full max-w-[393px] bg-neutral-0 px-5 py-4 shadow-[0_-5px_20px_rgba(0,0,0,0.03)]">
          <Button
            tone="orange"
            className="w-full"
            disabled={createChatRoomMutation.isPending}
            onClick={() =>
              void handleCreateChatRoom()
            }
          >
            {createChatRoomMutation.isPending
              ? "쪽지방 여는 중"
              : "쪽지 보내기"}
          </Button>
        </div>
      ) : null}
    </main>
  );
};

interface DetailInfoProps {
  label: string;
  values: string[];
  emptyText?: string;
}

const DetailInfo = ({
  label,
  values,
  emptyText,
}: DetailInfoProps) => {
  const visibleValues = values.filter(
    (value) =>
      typeof value === "string" &&
      value.trim().length > 0,
  );

  return (
    <div>
      <dt className="text-body1 text-neutral-800">
        {label}
      </dt>

      <dd className="mt-2 flex flex-wrap gap-2">
        {visibleValues.length > 0 ? (
          visibleValues.map(
            (value, index) => (
              <DetailChip
                key={`${label}-${value}-${index}`}
              >
                {value}
              </DetailChip>
            ),
          )
        ) : (
          <span className="text-caption2 text-neutral-500">
            {emptyText ||
              "등록된 정보가 없어요"}
          </span>
        )}
      </dd>
    </div>
  );
};
