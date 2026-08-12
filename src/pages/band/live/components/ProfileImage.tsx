import BandImage from "@/assets/icons/band/band-default-profile.svg";
import { getRenderableProfileImageUrl } from "@/utils/profileImageUrl";
import { cx } from "../utils";

interface ProfileImageProps {
  size?: "sm" | "md" | "lg";
  glow?: boolean;
  src?: string | null;

  /**
   * true면 src가 없을 때 기본 밴드 이미지로 대체합니다.
   * false면 src가 없을 때도 외부 프로필 이미지로 대체하지 않고 기본 이미지만 사용합니다.
   */
  fallbackToDefault?: boolean;
}

export function ProfileImage({
  size = "md",
  glow = false,
  src,
  fallbackToDefault = true,
}: ProfileImageProps) {
  const sizeClass = {
    sm: "size-9",
    md: "size-[62px]",
    lg: "size-[150px]",
  }[size];

  const renderableSrc = getRenderableProfileImageUrl(src);
  const imageSrc = renderableSrc ?? (fallbackToDefault ? BandImage : BandImage);

  return (
    <img
      src={imageSrc}
      alt=""
      onError={(event) => {
        event.currentTarget.onerror = null;
        event.currentTarget.src = BandImage;
      }}
      className={cx(
        sizeClass,
        "rounded-full object-cover",
        glow && "shadow-[0_0_10px_#fbb10e]",
        size === "lg" &&
          "border-2 border-neutral-0 shadow-[0_0_28px_rgba(251,177,14,0.55)]",
      )}
    />
  );
}