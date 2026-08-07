import BandImage from "@/assets/Img_Band.png";
import { getRenderableProfileImageUrl } from "@/utils/profileImageUrl";
import { cx } from "../utils";

interface ProfileImageProps {
  size?: "sm" | "md" | "lg";
  glow?: boolean;
  src?: string | null;
}

export function ProfileImage({
  size = "md",
  glow = false,
  src,
}: ProfileImageProps) {
  const sizeClass = {
    sm: "size-9",
    md: "size-[62px]",
    lg: "size-[150px]",
  }[size];

  const imageSrc = getRenderableProfileImageUrl(src) ?? BandImage;

  return (
    <img
      src={imageSrc}
      alt=""
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