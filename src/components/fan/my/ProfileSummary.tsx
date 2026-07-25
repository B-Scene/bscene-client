import DefaultAvatar from "@/assets/images/IMG_my.svg";

interface ProfileSummaryProps {
  name: string;
  subtitle: string;
}

export const ProfileSummary = ({ name, subtitle }: ProfileSummaryProps) => {
  return (
    <div className="flex items-center gap-3">
      <img
        src={DefaultAvatar}
        alt=""
        className="size-14 shrink-0 rounded-full object-cover"
      />

      <div className="flex min-w-0 flex-col gap-1">
        <h2 className="truncate text-label1 text-neutral-900">{name}</h2>
        <p className="truncate text-caption2 text-neutral-700">{subtitle}</p>
      </div>
    </div>
  );
};
