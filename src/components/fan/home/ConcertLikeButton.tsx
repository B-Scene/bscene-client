import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import HeartIcon from "@/assets/icons/Heart.svg";
import LikedHeartIcon from "@/assets/icons/Union.svg";
import {
  fanHomeKeys,
  invalidatePerformanceInterestQueries,
  useAddPerformanceInterest,
  useDeletePerformanceInterest,
} from "@/hooks/api/fan/useFanHome";
import { isAlreadyInterestedPerformanceError } from "@/api/fan/home";
import type { FanPerformanceDetailResponse } from "@/types/fan/home";

type ConcertLikeButtonProps = {
  concertId: string;
  concertTitle: string;
  isInterested?: boolean;
  className?: string;
};

const ConcertLikeButton = ({
  concertId,
  concertTitle,
  isInterested,
  className = "",
}: ConcertLikeButtonProps) => {
  const queryClient = useQueryClient();
  const addPerformanceInterestMutation = useAddPerformanceInterest();
  const deletePerformanceInterestMutation = useDeletePerformanceInterest();
  const [isInterestSyncing, setIsInterestSyncing] = useState(false);
  const performanceId = Number(concertId);
  const cachedDetail = Number.isFinite(performanceId)
    ? queryClient.getQueryData<FanPerformanceDetailResponse>(
        fanHomeKeys.performanceDetail(performanceId),
      )
    : undefined;
  const isLiked = isInterested ?? cachedDetail?.isInterested ?? false;

  const handleClick = async () => {
    if (!Number.isFinite(performanceId) || performanceId <= 0) {
      return;
    }

    if (isLiked) {
      try {
        await deletePerformanceInterestMutation.mutateAsync(performanceId);
      } catch {
        return;
      }
      return;
    }

    try {
      await addPerformanceInterestMutation.mutateAsync(performanceId);
    } catch (error) {
      if (isAlreadyInterestedPerformanceError(error)) {
        setIsInterestSyncing(true);
        try {
          await invalidatePerformanceInterestQueries(queryClient, performanceId);
        } finally {
          setIsInterestSyncing(false);
        }
      }
      return;
    }
  };

  return (
    <button
      type="button"
      aria-label={
        isLiked
          ? `${concertTitle} 관심 공연 해제`
          : `${concertTitle} 관심 공연 등록`
      }
      aria-pressed={isLiked}
      disabled={
        addPerformanceInterestMutation.isPending ||
        deletePerformanceInterestMutation.isPending ||
        isInterestSyncing
      }
      onClick={() => void handleClick()}
      className={`flex size-6 items-center justify-center ${className}`}
    >
      <img
        src={isLiked ? LikedHeartIcon : HeartIcon}
        alt=""
        className={isLiked ? "h-[17px] w-5" : "size-6"}
      />
    </button>
  );
};

export default ConcertLikeButton;
