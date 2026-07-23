import type { KeyboardEvent, MouseEvent } from "react";
import HeartIcon from "@/assets/icons/Heart.svg";
import LikedHeartIcon from "@/assets/icons/Union.svg";
import { useConcertLikeStore } from "@/stores/useConcertLikeStore";

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
  const toggleConcertLike = useConcertLikeStore(
    (state) => state.toggleConcertLike,
  );

  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    toggleConcertLike(concertId);
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
      onClick={handleClick}
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
