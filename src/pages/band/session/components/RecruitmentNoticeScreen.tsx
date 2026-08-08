import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import type { AxiosError } from "axios";

import {
  useAddSessionRecruitmentInterest,
  useRemoveSessionRecruitmentInterest,
  useSessionRecruitmentsQuery,
} from "@/hooks/api/session/useSessionRecruitment";
import {
  useApplySessionRecruitmentMutation,
  useMySessionApplicationSummaryQuery,
} from "@/hooks/api/session/useSessionApplication";
import { useCreateSessionChatRoomMutation } from "@/hooks/api/session/useSessionChat";
import { usePullToRefresh } from "@/hooks/usePullToRefresh";
import type {
  SessionRecruitmentListItem,
  SessionRecruitmentSort,
} from "@/types/session/sessionRecruitment";
import type { SessionApiResponse } from "@/types/session/sessionApplication";

import { INITIAL_SESSION_FILTERS } from "../data/sessionRecruitmentPosts";
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

const FIND_FILTER_KEYS = ["genre", "region"] as const;

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
    tags: [recruitment.part, recruitment.skillLevel].filter(Boolean),
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
    tags: [recruitment.part, recruitment.skillLevel].filter(Boolean),
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

const PullToRefreshIndicator = ({
  pullDistance,
  isRefreshing,
}: {
  pullDistance: number;
  isRefreshing: boolean;
}) => {
  const shouldShow = pullDistance > 0 || isRefreshing;

  if (!shouldShow) {
    return null;
  }

  const visibleDistance = Math.min(pullDistance, 52);
  const opacity = Math.min(1, Math.max(0.35, pullDistance / 76));

  return (
    <div
      className="pointer-events-none fixed left-1/2 z-[70] flex size-9 items-center justify-center rounded-full bg-neutral-0 shadow-[0_4px_18px_rgba(0,0,0,0.18)]"
      style={{
        top: "calc(env(safe-area-inset-top) + 72px)",
        opacity,
        transform: `translate(-50%, ${visibleDistance}px)`,
      }}
    >
      <div className="size-5 animate-spin rounded-full border-2 border-neutral-300 border-t-secondary-500" />
    </div>
  );
};

export const RecruitmentNoticeScreen = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [activeTab, setActiveTab] = useState<SessionTabId>("recruitment");

  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const [recruitmentFilterValues, setRecruitmentFilterValues] =
    useState<SessionFilterValues>(INITIAL_SESSION_FILTERS);

  const [findFilterValues, setFindFilterValues] =
    useState<SessionFilterValues>(INITIAL_SESSION_FILTERS);

  const hasInitializedFindFilters = useRef(false);

  const [sort, setSort] = useState<SessionRecruitmentSort>("LATEST");

  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const [editingRecruitmentId, setEditingRecruitmentId] = useState<
    number | null
  >(null);

  const [isBasicProfileEditOpen, setIsBasicProfileEditOpen] = useState(false);

  const openPostId =
    (location.state as { openPostId?: number } | null)?.openPostId ?? null;

  const [selectedPostId, setSelectedPostId] = useState<number | null>(
    () => openPostId,
  );

  const [selectedPostOverride, setSelectedPostOverride] =
    useState<SessionRecruitmentPost | null>(null);

  const [selectedApplicationId, setSelectedApplicationId] = useState<
    number | null
  >(null);

  const [deletedPostIds, setDeletedPostIds] = useState<number[]>([]);

  const [createdPostIds, setCreatedPostIds] = useState<number[]>([]);

  const [bookmarkOverrides, setBookmarkOverrides] = useState<
    Record<number, boolean>
  >({});

  const addInterestMutation = useAddSessionRecruitmentInterest();
  const removeInterestMutation = useRemoveSessionRecruitmentInterest();
  const applyRecruitmentMutation = useApplySessionRecruitmentMutation();
  const myApplicationSummaryQuery = useMySessionApplicationSummaryQuery();
  const createChatRoomMutation = useCreateSessionChatRoomMutation();

  const sessionRecruitmentsQuery = useSessionRecruitmentsQuery({
    size: 20,
    sort,
  });

  const handleRefreshPage = useCallback(async () => {
    await new Promise<void>((resolve) => {
      window.setTimeout(resolve, 250);
    });

    window.location.reload();
  }, []);

  const recruitmentPullToRefresh = usePullToRefresh<HTMLElement>({
    enabled:
      (activeTab === "recruitment" || activeTab === "find") &&
      !isFilterOpen &&
      !isSearchOpen &&
      !isCreateOpen &&
      editingRecruitmentId === null &&
      !isBasicProfileEditOpen &&
      selectedPostId === null &&
      selectedApplicationId === null,
    onRefresh: handleRefreshPage,
  });

  useEffect(() => {
    if (!Number.isFinite(openPostId)) return;

    const timeoutId = window.setTimeout(() => {
      setSelectedPostId(openPostId);

      navigate(`${location.pathname}${location.search}${location.hash}`, {
        replace: true,
        state: null,
      });
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [location.hash, location.pathname, location.search, navigate, openPostId]);

  useEffect(() => {
    const summary = myApplicationSummaryQuery.data;

    if (!summary || hasInitializedFindFilters.current) {
      return;
    }

    hasInitializedFindFilters.current = true;

    setFindFilterValues({
      part: INITIAL_SESSION_FILTERS.part,
      skill: INITIAL_SESSION_FILTERS.skill,
      genre: summary.genre || INITIAL_SESSION_FILTERS.genre,
      region: summary.region || INITIAL_SESSION_FILTERS.region,
    });
  }, [myApplicationSummaryQuery.data]);

  const posts = useMemo(() => {
    const apiPosts =
      sessionRecruitmentsQuery.data?.content.map(mapRecruitmentToPost) ?? [];

    return apiPosts
      .filter((post) => !deletedPostIds.includes(post.id))
      .map((post) => ({
        ...post,
        bookmarked: bookmarkOverrides[post.id] ?? post.bookmarked,
      }));
  }, [bookmarkOverrides, deletedPostIds, sessionRecruitmentsQuery.data]);

  const filteredPosts = useMemo(() => {
    return posts.filter((post) => {
      const matchesPart =
        recruitmentFilterValues.part === "전체" ||
        post.tags.includes(recruitmentFilterValues.part);

      const matchesSkill =
        recruitmentFilterValues.skill === "전체" ||
        post.tags.includes(recruitmentFilterValues.skill);

      const matchesGenre =
        recruitmentFilterValues.genre === "전체" ||
        post.genre.includes(recruitmentFilterValues.genre);

      const matchesRegion =
        recruitmentFilterValues.region === "전체" ||
        post.location.includes(recruitmentFilterValues.region);

      return matchesPart && matchesSkill && matchesGenre && matchesRegion;
    });
  }, [recruitmentFilterValues, posts]);

  const selectedPost = useMemo(() => {
    if (!selectedPostId) return null;

    if (selectedPostOverride?.id === selectedPostId) {
      return selectedPostOverride;
    }

    const isCreatedByCurrentUser = createdPostIds.includes(selectedPostId);

    const post =
      posts.find((candidate) => candidate.id === selectedPostId) ??
      createFallbackPost(selectedPostId, isCreatedByCurrentUser);

    return isCreatedByCurrentUser
      ? {
          ...post,
          isMine: true,
        }
      : post;
  }, [createdPostIds, posts, selectedPostId, selectedPostOverride]);

  const handleToggleBookmark = (postId: number) => {
    const currentPost = posts.find((post) => post.id === postId);

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
        setBookmarkOverrides((currentOverrides) => ({
          ...currentOverrides,
          [postId]: currentBookmarked,
        }));

        if (selectedPostOverride?.id === postId) {
          setSelectedPostOverride({
            ...selectedPostOverride,
            bookmarked: currentBookmarked,
          });
        }
      },
    });
  };

  const handleDeletePost = (postId: number) => {
    setDeletedPostIds((currentIds) =>
      currentIds.includes(postId) ? currentIds : [...currentIds, postId],
    );

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
    const sessionRecruitmentId = application.sessionRecruitmentId;

    if (!sessionRecruitmentId) {
      window.alert("모집 공고 정보를 확인할 수 없어 쪽지방을 만들 수 없어요.");
      return;
    }

    if (createChatRoomMutation.isPending) {
      return;
    }

    try {
      const room = await createChatRoomMutation.mutateAsync({
        contextType: "RECRUITMENT",
        sessionRecruitmentId,
      });

      navigate(`/band/session/messages/${room.chatRoomId}`, {
        state: {
          senderName: room.recipientName,
          chatRoomId: room.chatRoomId,
          canSend: true,
        },
      });
    } catch (error) {
      const apiMessage = (error as AxiosError<SessionApiResponse<null>>)
        .response?.data?.message;

      window.alert(
        apiMessage ?? "쪽지방 생성에 실패했어요. 잠시 후 다시 시도해주세요.",
      );
    }
  };

  const handleOpenHistoryRecruitment = (
    recruitment: RecruitmentHistoryItem,
  ) => {
    setActiveTab("recruitment");
    setSelectedPostOverride(mapHistoryRecruitmentToPost(recruitment));
    setSelectedPostId(recruitment.id);
  };

  if (isCreateOpen) {
    return (
      <SessionRecruitmentFormScreen
        onBack={() => setIsCreateOpen(false)}
        onClose={() => setIsCreateOpen(false)}
        onViewCreatedPost={(sessionRecruitmentId) => {
          setIsCreateOpen(false);

          if (sessionRecruitmentId) {
            setCreatedPostIds((currentIds) =>
              currentIds.includes(sessionRecruitmentId)
                ? currentIds
                : [...currentIds, sessionRecruitmentId],
            );

            setSelectedPostId(sessionRecruitmentId);
            setSelectedPostOverride(null);
            void sessionRecruitmentsQuery.refetch();
          }
        }}
      />
    );
  }

  if (editingRecruitmentId !== null) {
    return (
      <SessionRecruitmentFormScreen
        editSessionRecruitmentId={editingRecruitmentId}
        onBack={() => setEditingRecruitmentId(null)}
        onClose={() => setEditingRecruitmentId(null)}
        onSaved={() => {
          const savedRecruitmentId = editingRecruitmentId;

          setEditingRecruitmentId(null);
          setSelectedPostId(savedRecruitmentId);
          setSelectedPostOverride(null);
          void sessionRecruitmentsQuery.refetch();
        }}
      />
    );
  }

  if (isBasicProfileEditOpen) {
    return (
      <SessionBasicProfileEditScreen
        onBack={() => setIsBasicProfileEditOpen(false)}
      />
    );
  }

  if (isSearchOpen) {
    return (
      <SessionSearchScreen
        values={recruitmentFilterValues}
        onBack={() => setIsSearchOpen(false)}
        onApplyFilters={setRecruitmentFilterValues}
      />
    );
  }

  if (selectedApplicationId) {
    return (
      <SessionApplicationDetailScreen
        sessionApplicationId={selectedApplicationId}
        isOwnApplication
        onBack={() => setSelectedApplicationId(null)}
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
        onEditPost={(postId) => {
          setEditingRecruitmentId(postId);
        }}
        onPreviewApplication={setSelectedApplicationId}
        onApplyApplication={handleApplyApplication}
      />
    );
  }

  return (
    <main
      ref={recruitmentPullToRefresh.containerRef}
      className="relative min-h-dvh overscroll-y-contain bg-neutral-0 pb-[calc(var(--bottom-nav-height)+24px)]"
    >
      {activeTab === "recruitment" || activeTab === "find" ? (
        <PullToRefreshIndicator
          pullDistance={recruitmentPullToRefresh.pullDistance}
          isRefreshing={recruitmentPullToRefresh.isRefreshing}
        />
      ) : null}

      <SessionPageHeader
        onSearch={() => setIsSearchOpen(true)}
        onMessages={() => navigate("/band/session/messages")}
      />

      <SessionTabs activeTab={activeTab} onTabChange={setActiveTab} />

      {activeTab !== "applications" ? (
        <SessionFilterBar
          values={
            activeTab === "find"
              ? findFilterValues
              : recruitmentFilterValues
          }
          sort={sort}
          onSortChange={setSort}
          showBottomBorder={activeTab !== "find"}
          compactHeight={activeTab === "find"}
          filterKeys={activeTab === "find" ? [...FIND_FILTER_KEYS] : undefined}
          onOpenFilter={() => setIsFilterOpen(true)}
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
                모집 공고를 불러오지 못했어요
              </p>

              <button
                type="button"
                onClick={() => void sessionRecruitmentsQuery.refetch()}
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
                onToggleBookmark={handleToggleBookmark}
                onSelect={(postId) => {
                  setSelectedPostOverride(null);
                  setSelectedPostId(postId);
                }}
              />
            ))
          ) : (
            <div className="flex min-h-[220px] items-center justify-center rounded-[14px] bg-neutral-0 px-6 text-center text-caption1 text-neutral-500 shadow-[0_0_12px_rgba(0,0,0,0.08)]">
              선택한 조건에 맞는 모집 공고가 없어요
            </div>
          )}
        </section>
      ) : activeTab === "find" ? (
        <SessionFindScreen values={findFilterValues} />
      ) : activeTab === "applications" ? (
        <SessionApplicationsScreen
          onEditBasicInfo={() => setIsBasicProfileEditOpen(true)}
          onBrowseRecruitments={() => setActiveTab("recruitment")}
          onViewHistoryApplication={(application) => {
            if (!application.sessionApplicationId) {
              window.alert(
                "지원서 정보를 확인할 수 없어요. 잠시 후 다시 시도해주세요.",
              );
              return;
            }

            setSelectedApplicationId(application.sessionApplicationId);
          }}
          onMessage={handleMessageApplication}
          onOpenRecruitment={handleOpenHistoryRecruitment}
        />
      ) : null}

      {activeTab === "recruitment" ? (
        <FloatingCreateButton onClick={() => setIsCreateOpen(true)} />
      ) : null}

      {isFilterOpen ? (
        <SessionFilterBottomSheet
          values={
            activeTab === "find"
              ? findFilterValues
              : recruitmentFilterValues
          }
          onApply={
            activeTab === "find"
              ? setFindFilterValues
              : setRecruitmentFilterValues
          }
          filterKeys={activeTab === "find" ? [...FIND_FILTER_KEYS] : undefined}
          onClose={() => setIsFilterOpen(false)}
        />
      ) : null}
    </main>
  );
};