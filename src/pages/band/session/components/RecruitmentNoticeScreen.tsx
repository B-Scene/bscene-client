import { useMemo, useState } from "react";
import { sessionFindCandidates } from "../data/sessionFindCandidates";
import {
  INITIAL_SESSION_FILTERS,
  sessionRecruitmentPosts,
} from "../data/sessionRecruitmentPosts";
import type { SessionFilterValues, SessionTabId } from "../types";
import { FloatingCreateButton } from "./FloatingCreateButton";
import { SessionApplicationsScreen } from "./SessionApplicationsScreen";
import { SessionBasicProfileEditScreen } from "./SessionBasicProfileEditScreen";
import { RecruitmentPostCard } from "./RecruitmentPostCard";
import { SessionFilterBar } from "./SessionFilterBar";
import { SessionFilterBottomSheet } from "./SessionFilterBottomSheet";
import { SessionFindScreen } from "./SessionFindScreen";
import { SessionPageHeader } from "./SessionPageHeader";
import { SessionRecruitmentDetailScreen } from "./SessionRecruitmentDetailScreen";
import { SessionRecruitmentFormScreen } from "./SessionRecruitmentFormScreen";
import { SessionSearchScreen } from "./SessionSearchScreen";
import { SessionTabs } from "./SessionTabs";

export const RecruitmentNoticeScreen = () => {
  const [activeTab, setActiveTab] = useState<SessionTabId>("recruitment");
  const [posts, setPosts] = useState(sessionRecruitmentPosts);
  const [candidates, setCandidates] = useState(sessionFindCandidates);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filterValues, setFilterValues] = useState<SessionFilterValues>(INITIAL_SESSION_FILTERS);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isBasicProfileEditOpen, setIsBasicProfileEditOpen] = useState(false);
  const [selectedPostId, setSelectedPostId] = useState<number | null>(null);

  const filteredPosts = useMemo(() => {
    return posts.filter((post) => {
      const matchesPart = filterValues.part === "전체" || post.tags.includes(filterValues.part);
      const matchesSkill = filterValues.skill === "전체" || post.tags.includes(filterValues.skill);
      const matchesGenre = filterValues.genre === "전체" || post.genre.includes(filterValues.genre);
      const matchesRegion = filterValues.region === "전체" || post.location.includes(filterValues.region);

      return matchesPart && matchesSkill && matchesGenre && matchesRegion;
    });
  }, [filterValues, posts]);

  const filteredCandidates = useMemo(() => {
    return candidates.filter((candidate) => {
      const matchesPart = filterValues.part === "전체" || candidate.part === filterValues.part;
      const matchesSkill = filterValues.skill === "전체" || candidate.skill === filterValues.skill;
      const matchesGenre = filterValues.genre === "전체" || candidate.genre.includes(filterValues.genre);
      const matchesRegion = filterValues.region === "전체" || candidate.location.includes(filterValues.region);

      return matchesPart && matchesSkill && matchesGenre && matchesRegion;
    });
  }, [candidates, filterValues]);

  const selectedPost = useMemo(() => {
    return posts.find((post) => post.id === selectedPostId) ?? null;
  }, [posts, selectedPostId]);

  const handleToggleBookmark = (postId: number) => {
    setPosts((currentPosts) =>
      currentPosts.map((post) =>
        post.id === postId ? { ...post, bookmarked: !post.bookmarked } : post,
      ),
    );
  };

  const handleToggleCandidateBookmark = (candidateId: number) => {
    setCandidates((currentCandidates) =>
      currentCandidates.map((candidate) =>
        candidate.id === candidateId ? { ...candidate, bookmarked: !candidate.bookmarked } : candidate,
      ),
    );
  };

  if (isCreateOpen) {
    return (
      <SessionRecruitmentFormScreen
        onBack={() => setIsCreateOpen(false)}
        onClose={() => setIsCreateOpen(false)}
        onViewCreatedPost={() => {
          setIsCreateOpen(false);
          setSelectedPostId(posts[0]?.id ?? null);
        }}
      />
    );
  }

  if (isBasicProfileEditOpen) {
    return <SessionBasicProfileEditScreen onBack={() => setIsBasicProfileEditOpen(false)} />;
  }

  if (isSearchOpen) {
    return (
      <SessionSearchScreen
        posts={posts}
        values={filterValues}
        onBack={() => setIsSearchOpen(false)}
        onApplyFilters={setFilterValues}
        onToggleBookmark={handleToggleBookmark}
      />
    );
  }

  if (selectedPost) {
    return (
      <SessionRecruitmentDetailScreen
        post={selectedPost}
        onBack={() => setSelectedPostId(null)}
        onToggleBookmark={handleToggleBookmark}
      />
    );
  }

  return (
    <main className="relative min-h-dvh bg-neutral-0 pb-[calc(var(--bottom-nav-height)+24px)]">
      <SessionPageHeader onSearch={() => setIsSearchOpen(true)} />
      <SessionTabs activeTab={activeTab} onTabChange={setActiveTab} />
      {activeTab !== "applications" ? (
        <SessionFilterBar
          values={filterValues}
          showBottomBorder={activeTab !== "find"}
          compactHeight={activeTab === "find"}
          onOpenFilter={() => setIsFilterOpen(true)}
        />
      ) : null}

      {activeTab === "recruitment" ? (
        <section className="flex flex-col gap-4 px-[22px] pt-5">
          {filteredPosts.length > 0 ? (
            filteredPosts.map((post) => (
              <RecruitmentPostCard
                key={post.id}
                post={post}
                onToggleBookmark={handleToggleBookmark}
                onSelect={setSelectedPostId}
              />
            ))
          ) : (
            <div className="flex min-h-[220px] items-center justify-center rounded-[14px] bg-neutral-0 px-6 text-center text-caption1 text-neutral-500 shadow-[0_0_12px_rgba(0,0,0,0.08)]">
              선택한 조건에 맞는 모집 공고가 없어요
            </div>
          )}
        </section>
      ) : activeTab === "find" ? (
        <SessionFindScreen
          candidates={filteredCandidates}
          onToggleBookmark={handleToggleCandidateBookmark}
        />
      ) : activeTab === "applications" ? (
        <SessionApplicationsScreen
          onEditBasicInfo={() => setIsBasicProfileEditOpen(true)}
        />
      ) : null}

      {activeTab === "recruitment" ? (
        <FloatingCreateButton onClick={() => setIsCreateOpen(true)} />
      ) : null}

      {isFilterOpen ? (
        <SessionFilterBottomSheet
          values={filterValues}
          onApply={setFilterValues}
          onClose={() => setIsFilterOpen(false)}
        />
      ) : null}
    </main>
  );
};
