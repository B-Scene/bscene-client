import type { KeyboardEvent, MouseEvent } from "react";
import HeartIcon from "@/assets/icons/Heart.svg";
import LikedHeartIcon from "@/assets/icons/Union.svg";
import { useConcertLikeStore } from "@/stores/useConcertLikeStore";
import {
  useAddPerformanceInterest,
  useDeletePerformanceInterest,
} from "@/hooks/api/fan/useFanHome";
import { isAlreadyInterestedPerformanceError } from "@/api/fan/home";

type ConcertLikeButtonProps = {
  concertId: string;
  concertTitle: string;
  className?: string;
};

const ConcertLikeButton = ({
  concertId,
  concertTitle,
  className = "",
}: ConcertLikeButtonProps) => {
  const isLiked = useConcertLikeStore(
    (state) => state.likedConcertIds[concertId] ?? false,
  );
  const setConcertLiked = useConcertLikeStore((state) => state.setConcertLiked);
  const addPerformanceInterestMutation = useAddPerformanceInterest();
  const deletePerformanceInterestMutation = useDeletePerformanceInterest();

  const handleClick = async (event: MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();

    const performanceId = Number(concertId);

    if (!Number.isFinite(performanceId) || performanceId <= 0) {
      return;
    }

    if (isLiked) {
      try {
        await deletePerformanceInterestMutation.mutateAsync(performanceId);
        setConcertLiked(concertId, false);
      } catch {
        return;
      }
      return;
    }

    try {
      await addPerformanceInterestMutation.mutateAsync(performanceId);
      setConcertLiked(concertId, true);
    } catch (error) {
      if (isAlreadyInterestedPerformanceError(error)) {
        setConcertLiked(concertId, true);
      }
      return;
    }
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    event.stopPropagation();
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
        deletePerformanceInterestMutation.isPending
      }
      onClick={(event) => void handleClick(event)}
      onKeyDown={handleKeyDown}
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
