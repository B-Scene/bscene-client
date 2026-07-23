import BandImage from "@/assets/Img_Band.png";
import { cx } from "../utils";

interface ProfileImageProps {
  size?: "sm" | "md" | "lg";
  glow?: boolean;
  src?: string;
}

export function ProfileImage({
  size = "md",
  glow = false,
  src = BandImage,
}: ProfileImageProps) {
  const sizeClass = {
    sm: "size-9",
    md: "size-[62px]",
    lg: "size-[150px]",
  }[size];

  return (
    <img
      src={src}
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
