import {
  useMemo,
  useState,
} from "react";
import { useNavigate } from "react-router-dom";
import type { AxiosError } from "axios";

import {
  useAddSessionRecruitmentInterest,
  useRemoveSessionRecruitmentInterest,
  useSessionRecruitmentsQuery,
} from "@/hooks/api/session/useSessionRecruitment";
import {
  useApplySessionRecruitmentMutation,
} from "@/hooks/api/session/useSessionApplication";
import { useCreateSessionChatRoomMutation } from "@/hooks/api/session/useSessionChat";
import type {
  SessionRecruitmentListItem,
  SessionRecruitmentSort,
} from "@/types/session/sessionRecruitment";
import type { SessionApiResponse } from "@/types/session/sessionApplication";

import {
  INITIAL_SESSION_FILTERS,
} from "../data/sessionRecruitmentPosts";
import type {
  SessionFilterValues,
  SessionRecruitmentPost,
  SessionTabId,
} from "../types";

import { FloatingCreateButton } from "./FloatingCreateButton";
import { RecruitmentPostCard } from "./RecruitmentPostCard";
import { SessionApplicationsScreen } from "./SessionApplicationsScreen";
import { SessionApplicationDetailScreen } from "./SessionApplicationDetailScreen";
import { SessionBasicProfileEditScreen } from "./SessionBasicProfileEditScreen";
import { SessionFilterBar } from "./SessionFilterBar";
import { SessionFilterBottomSheet } from "./SessionFilterBottomSheet";
import { SessionFindScreen } from "./SessionFindScreen";
import { SessionPageHeader } from "./SessionPageHeader";
import { SessionRecruitmentDetailScreen } from "./SessionRecruitmentDetailScreen";
import { SessionRecruitmentFormScreen } from "./SessionRecruitmentFormScreen";
import { SessionSearchScreen } from "./SessionSearchScreen";
import { SessionTabs } from "./SessionTabs";
import type {
  ApplicationHistoryItem,
  RecruitmentHistoryItem,
} from "@/features/session/applicationHistory/applicationHistory.types";

const toDeadlineLabel = (dDay: number) => {
  if (dDay < 0) return "마감";
  if (dDay === 0) return "오늘 마감";
  return `D-${dDay}`;
};

const mapRecruitmentToPost = (
  recruitment: SessionRecruitmentListItem,
): SessionRecruitmentPost => {
  return {
    id: recruitment.sessionRecruitmentId,
    isMine: recruitment.isMine ?? false,
    deadline: toDeadlineLabel(recruitment.dDay),
    title: recruitment.recruitmentTitle,
    bandName: recruitment.bandName,
    genre: recruitment.bandGenre,
    location: recruitment.bandRegion,
    description: recruitment.summary,
    tags: [
      recruitment.part,
      recruitment.skillLevel,
    ].filter(Boolean),
    bookmarked: recruitment.isInterested,
  };
};

const mapHistoryRecruitmentToPost = (
  recruitment: RecruitmentHistoryItem,
): SessionRecruitmentPost => {
  return {
    id: recruitment.id,
    deadline: recruitment.deadlineLabel,
    title: recruitment.title,
    bandName: recruitment.bandName,
    genre: recruitment.genre,
    location: recruitment.region,
    description: recruitment.description,
    tags: [
      recruitment.part,
      recruitment.skillLevel,
    ].filter(Boolean),
    bookmarked: recruitment.bookmarked,
  };
};

const createFallbackPost = (
  sessionRecruitmentId: number,
  isMine = false,
): SessionRecruitmentPost => {
  return {
    id: sessionRecruitmentId,
    isMine,
    deadline: "",
    title: "",
    bandName: "",
    genre: "",
    location: "",
    description: "",
    tags: [],
    bookmarked: false,
  };
};

export const RecruitmentNoticeScreen = () => {
  const navigate = useNavigate();

  const [activeTab, setActiveTab] =
    useState<SessionTabId>("recruitment");

  const [
    isFilterOpen,
    setIsFilterOpen,
  ] = useState(false);

  const [filterValues, setFilterValues] =
    useState<SessionFilterValues>(
      INITIAL_SESSION_FILTERS,
    );

  const [sort, setSort] =
    useState<SessionRecruitmentSort>("LATEST");

  const [
    isSearchOpen,
    setIsSearchOpen,
  ] = useState(false);

  const [
    isCreateOpen,
    setIsCreateOpen,
  ] = useState(false);

  const [
    isBasicProfileEditOpen,
    setIsBasicProfileEditOpen,
  ] = useState(false);

  const [
    selectedPostId,
    setSelectedPostId,
  ] = useState<number | null>(null);

  const [
    selectedPostOverride,
    setSelectedPostOverride,
  ] =
    useState<SessionRecruitmentPost | null>(null);

  const [
    selectedApplicationId,
    setSelectedApplicationId,
  ] = useState<number | null>(null);

  const [
    deletedPostIds,
    setDeletedPostIds,
  ] = useState<number[]>([]);

  const [
    createdPostIds,
    setCreatedPostIds,
  ] = useState<number[]>([]);

  const [
    bookmarkOverrides,
    setBookmarkOverrides,
  ] = useState<Record<number, boolean>>({});

  const addInterestMutation =
    useAddSessionRecruitmentInterest();

  const removeInterestMutation =
    useRemoveSessionRecruitmentInterest();

  const applyRecruitmentMutation =
    useApplySessionRecruitmentMutation();

  const createChatRoomMutation =
    useCreateSessionChatRoomMutation();

  const sessionRecruitmentsQuery =
    useSessionRecruitmentsQuery({
      size: 20,
      sort,
    });

  const posts = useMemo(() => {
    const apiPosts =
      sessionRecruitmentsQuery.data?.content.map(
        mapRecruitmentToPost,
      ) ?? [];

    return apiPosts
      .filter(
        (post) =>
          !deletedPostIds.includes(post.id),
      )
      .map((post) => ({
        ...post,
        bookmarked:
          bookmarkOverrides[post.id] ??
          post.bookmarked,
      }));
  }, [
    bookmarkOverrides,
    deletedPostIds,
    sessionRecruitmentsQuery.data,
  ]);

  const filteredPosts = useMemo(() => {
    return posts.filter((post) => {
      const matchesPart =
        filterValues.part === "전체" ||
        post.tags.includes(filterValues.part);

      const matchesSkill =
        filterValues.skill === "전체" ||
        post.tags.includes(filterValues.skill);

      const matchesGenre =
        filterValues.genre === "전체" ||
        post.genre.includes(filterValues.genre);

      const matchesRegion =
        filterValues.region === "전체" ||
        post.location.includes(
          filterValues.region,
        );

      return (
        matchesPart &&
        matchesSkill &&
        matchesGenre &&
        matchesRegion
      );
    });
  }, [filterValues, posts]);

  const selectedPost = useMemo(() => {
    if (!selectedPostId) return null;

    if (
      selectedPostOverride?.id === selectedPostId
    ) {
      return selectedPostOverride;
    }

    const isCreatedByCurrentUser =
      createdPostIds.includes(selectedPostId);

    const post =
      posts.find(
        (candidate) =>
          candidate.id === selectedPostId,
      ) ??
      createFallbackPost(
        selectedPostId,
        isCreatedByCurrentUser,
      );

    return isCreatedByCurrentUser
      ? {
          ...post,
          isMine: true,
        }
      : post;
  }, [
    createdPostIds,
    posts,
    selectedPostId,
    selectedPostOverride,
  ]);

  const handleToggleBookmark = (
    postId: number,
  ) => {
    const currentPost = posts.find(
      (post) => post.id === postId,
    );

    const currentBookmarked =
      bookmarkOverrides[postId] ??
      currentPost?.bookmarked ??
      selectedPostOverride?.bookmarked ??
      false;

    const nextBookmarked = !currentBookmarked;

    setBookmarkOverrides((currentOverrides) => ({
      ...currentOverrides,
      [postId]: nextBookmarked,
    }));

    if (selectedPostOverride?.id === postId) {
      setSelectedPostOverride({
        ...selectedPostOverride,
        bookmarked: nextBookmarked,
      });
    }

    const mutation = nextBookmarked
      ? addInterestMutation
      : removeInterestMutation;

    mutation.mutate(postId, {
      onError: () => {
        setBookmarkOverrides(
          (currentOverrides) => ({
            ...currentOverrides,
            [postId]: currentBookmarked,
          }),
        );

        if (
          selectedPostOverride?.id === postId
        ) {
          setSelectedPostOverride({
            ...selectedPostOverride,
            bookmarked: currentBookmarked,
          });
        }
      },
    });
  };

  const handleDeletePost = (
    postId: number,
  ) => {
    setDeletedPostIds((currentIds) => [
      ...currentIds,
      postId,
    ]);
    setSelectedPostId(null);
    setSelectedPostOverride(null);
  };

  const handleApplyApplication = async (
    sessionRecruitmentId: number,
    sessionApplicationId: number,
  ) => {
    await applyRecruitmentMutation.mutateAsync({
      sessionRecruitmentId,
      body: {
        sessionApplicationId,
      },
    });
  };

  const handleMessageApplication = async (
    application: ApplicationHistoryItem,
  ) => {
    try {
      const room =
        await createChatRoomMutation.mutateAsync({
          contextType: "RECRUITMENT",
          applicationSubmissionId:
            application.applicationSubmissionId ??
            application.id,
        });

      navigate(
        `/band/session/messages/${room.chatRoomId}`,
        {
          state: {
            senderName: room.recipientName,
            chatRoomId: room.chatRoomId,
            canSend: true,
          },
        },
      );
    } catch (error) {
      const apiMessage = (
        error as AxiosError<
          SessionApiResponse<null>
        >
      ).response?.data?.message;

      window.alert(
        apiMessage ??
          "쪽지방 생성에 실패했어요. 잠시 후 다시 시도해주세요.",
      );
    }
  };

  const handleOpenHistoryRecruitment = (
    recruitment: RecruitmentHistoryItem,
  ) => {
    setActiveTab("recruitment");
    setSelectedPostOverride(
      mapHistoryRecruitmentToPost(recruitment),
    );
    setSelectedPostId(recruitment.id);
  };

  if (isCreateOpen) {
    return (
      <SessionRecruitmentFormScreen
        onBack={() => setIsCreateOpen(false)}
        onClose={() => setIsCreateOpen(false)}
        onViewCreatedPost={(
          sessionRecruitmentId,
        ) => {
          setIsCreateOpen(false);

          if (sessionRecruitmentId) {
            setCreatedPostIds(
              (currentIds) =>
                currentIds.includes(
                  sessionRecruitmentId,
                )
                  ? currentIds
                  : [
                      ...currentIds,
                      sessionRecruitmentId,
                    ],
            );

            setSelectedPostId(
              sessionRecruitmentId,
            );

            setSelectedPostOverride(null);
            sessionRecruitmentsQuery.refetch();
          }
        }}
      />
    );
  }

  if (isBasicProfileEditOpen) {
    return (
      <SessionBasicProfileEditScreen
        onBack={() =>
          setIsBasicProfileEditOpen(false)
        }
      />
    );
  }

  if (isSearchOpen) {
    return (
      <SessionSearchScreen
        values={filterValues}
        onBack={() => setIsSearchOpen(false)}
        onApplyFilters={setFilterValues}
      />
    );
  }

  if (selectedApplicationId) {
    return (
      <SessionApplicationDetailScreen
        sessionApplicationId={
          selectedApplicationId
        }
        isOwnApplication
        onBack={() =>
          setSelectedApplicationId(null)
        }
      />
    );
  }

  if (selectedPost) {
    return (
      <SessionRecruitmentDetailScreen
        post={selectedPost}
        onBack={() => {
          setSelectedPostId(null);
          setSelectedPostOverride(null);
        }}
        onToggleBookmark={handleToggleBookmark}
        onDeletePost={handleDeletePost}
        onPreviewApplication={
          setSelectedApplicationId
        }
        onApplyApplication={
          handleApplyApplication
        }
      />
    );
  }

  return (
    <main className="relative min-h-dvh bg-neutral-0 pb-[calc(var(--bottom-nav-height)+24px)]">
      <SessionPageHeader
        onSearch={() => setIsSearchOpen(true)}
        onMessages={() =>
          navigate("/band/session/messages")
        }
      />

      <SessionTabs
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      {activeTab !== "applications" ? (
        <SessionFilterBar
          values={filterValues}
          sort={sort}
          onSortChange={setSort}
          showBottomBorder={activeTab !== "find"}
          compactHeight={activeTab === "find"}
          onOpenFilter={() =>
            setIsFilterOpen(true)
          }
        />
      ) : null}

      {activeTab === "recruitment" ? (
        <section className="flex flex-col gap-4 px-[22px] pt-5">
          {sessionRecruitmentsQuery.isLoading ? (
            <div className="flex min-h-[220px] items-center justify-center rounded-[14px] bg-neutral-0 px-6 text-center text-caption1 text-neutral-500 shadow-[0_0_12px_rgba(0,0,0,0.08)]">
              모집 공고를 불러오고 있어요
            </div>
          ) : sessionRecruitmentsQuery.isError ? (
            <div className="flex min-h-[220px] flex-col items-center justify-center rounded-[14px] bg-neutral-0 px-6 text-center shadow-[0_0_12px_rgba(0,0,0,0.08)]">
              <p className="text-caption1 text-neutral-500">
                모집 공고를 불러오지
                못했어요
              </p>

              <button
                type="button"
                onClick={() =>
                  sessionRecruitmentsQuery.refetch()
                }
                className="mt-3 rounded-[8px] bg-secondary-500 px-4 py-2 text-caption2 text-neutral-0"
              >
                다시 시도
              </button>
            </div>
          ) : filteredPosts.length > 0 ? (
            filteredPosts.map((post) => (
              <RecruitmentPostCard
                key={post.id}
                post={post}
                onToggleBookmark={
                  handleToggleBookmark
                }
                onSelect={(postId) => {
                  setSelectedPostOverride(null);
                  setSelectedPostId(postId);
                }}
              />
            ))
          ) : (
            <div className="flex min-h-[220px] items-center justify-center rounded-[14px] bg-neutral-0 px-6 text-center text-caption1 text-neutral-500 shadow-[0_0_12px_rgba(0,0,0,0.08)]">
              선택한 조건에 맞는 모집 공고가
              없어요
            </div>
          )}
        </section>
      ) : activeTab === "find" ? (
        <SessionFindScreen
          values={filterValues}
        />
      ) : activeTab === "applications" ? (
        <SessionApplicationsScreen
          onEditBasicInfo={() =>
            setIsBasicProfileEditOpen(true)
          }
          onBrowseRecruitments={() =>
            setActiveTab("recruitment")
          }
          onViewHistoryApplication={(
            application,
          ) => {
            if (
              !application.sessionApplicationId
            ) {
              window.alert(
                "지원서 정보를 확인할 수 없어요. 잠시 후 다시 시도해주세요.",
              );
              return;
            }

            setSelectedApplicationId(
              application.sessionApplicationId,
            );
          }}
          onMessage={handleMessageApplication}
          onOpenRecruitment={
            handleOpenHistoryRecruitment
          }
        />
      ) : null}

      {activeTab === "recruitment" ? (
        <FloatingCreateButton
          onClick={() => setIsCreateOpen(true)}
        />
      ) : null}

      {isFilterOpen ? (
        <SessionFilterBottomSheet
          values={filterValues}
          onApply={setFilterValues}
          onClose={() =>
            setIsFilterOpen(false)
          }
        />
      ) : null}
    </main>
  );
};