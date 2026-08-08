import DefaultAvatar from "@/assets/icons/band/user-default-profile.svg";
import { getRenderableProfileImageUrl } from "@/utils/profileImageUrl";

interface ProfileSummaryProps {
  name: string;
  subtitle: string;
  profileImageUrl?: string | null;
}

export const ProfileSummary = ({
  name,
  subtitle,
  profileImageUrl,
}: ProfileSummaryProps) => {
  return (
    <div className="flex items-center gap-3">
      <img
        src={getRenderableProfileImageUrl(profileImageUrl) ?? DefaultAvatar}
        alt=""
        className="size-15.5 shrink-0 rounded-full object-cover"
      />

      <div className="flex min-w-0 flex-col gap-1">
        <h2 className="truncate text-label1 text-neutral-900">{name}</h2>
        <p className="truncate text-caption2 text-neutral-700">{subtitle}</p>
      </div>
    </div>
  );
};
