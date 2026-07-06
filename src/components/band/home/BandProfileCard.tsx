import OfficialIcon from "@/assets/icons/official-icon.svg";
import DefaultAvatar from "@/assets/images/IMG_my.svg";

interface BandProfileCardProps {
  name: string;
  avatarUrl: string;
  verified: boolean;
  subtitle: string;
  onEditProfile: () => void;
}

export const BandProfileCard = ({
  name,
  avatarUrl,
  verified,
  subtitle,
  onEditProfile,
}: BandProfileCardProps) => {
  return (
    <div className="flex items-center gap-20">
      <div className="flex flex-1 items-center gap-3">
        <img
          src={avatarUrl || DefaultAvatar}
          alt={name}
          className="size-14 shrink-0 rounded-full object-cover"
        />

        <div className="flex min-w-0 flex-1 flex-col gap-1.25">
          <div className="flex items-center gap-2">
            <h2 className="truncate text-label1 text-neutral-900">{name}</h2>
            {verified ? (
              <img src={OfficialIcon} alt="인증됨" className="size-4 shrink-0" />
            ) : null}
          </div>
          <p className="truncate text-caption2 text-neutral-700">{subtitle}</p>
        </div>
      </div>

      <button
        type="button"
        onClick={onEditProfile}
        className="shrink-0 rounded-lg border border-neutral-300 px-2.25 py-1.25 text-caption3 text-neutral-600"
      >
        프로필 편집
      </button>
    </div>
  );
};
