import { useEffect, useState } from "react";
import { useBandProfileStore } from "@/stores/useBandProfileStore";
import BandAvatar from "@/assets/images/IMG_my.svg";
import FanAvatar from "@/assets/icons/band/user-default-profile.svg";
import CheckCircleYellowIcon from "@/assets/icons/band/check-circle-yellow.svg";
import CheckApproveIcon from "@/assets/icons/band/check-approve.svg";

interface ModeSwitchSheetProps {
  open: boolean;
  onClose: () => void;
}

const MOCK_OTHER_BANDS = [
  { id: "band-2", name: "밴드명", subtitle: "인디록 · 서울" },
];

const MOCK_FAN_ACCOUNTS = [
  { id: "fan-1", nickname: "닉네임", email: "bethescene12@gmail.com" },
];

interface AccountRowProps {
  avatar: string;
  name: string;
  subtitle: string;
  selected: boolean;
  onSelect: () => void;
}

const AccountRow = ({
  avatar,
  name,
  subtitle,
  selected,
  onSelect,
}: AccountRowProps) => (
  <button
    type="button"
    onClick={onSelect}
    className="flex w-full items-center gap-3 rounded-lg bg-neutral-0 py-3 pr-3.75 pl-3 shadow-[0_0_8px_0_rgba(0,0,0,0.10)]"
  >
    <div className="flex min-w-0 flex-1 items-center gap-6.25">
      <img
        src={avatar}
        alt=""
        className="size-10 shrink-0 rounded-full object-cover"
      />

      <div className="flex min-w-0 flex-1 flex-col items-start gap-0">
        <span className="truncate text-body1 text-neutral-900">{name}</span>
        <span className="truncate text-caption2 text-neutral-600">
          {subtitle}
        </span>
      </div>
    </div>

    {selected ? (
      <img src={CheckCircleYellowIcon} alt="" className="size-6 shrink-0" />
    ) : (
      <img src={CheckApproveIcon} alt="" className="size-6 shrink-0" />
    )}
  </button>
);

export const ModeSwitchSheet = ({ open, onClose }: ModeSwitchSheetProps) => {
  const profile = useBandProfileStore((state) => state.profile);
  const [selectedId, setSelectedId] = useState("band-1");
  const [rendered, setRendered] = useState(open);
  const [isVisible, setIsVisible] = useState(false);

  if (open && !rendered) {
    setRendered(true);
  }

  useEffect(() => {
    if (!rendered) return;

    const frame = requestAnimationFrame(() => setIsVisible(open));
    return () => cancelAnimationFrame(frame);
  }, [open, rendered]);

  const handleTransitionEnd = () => {
    if (!open) setRendered(false);
  };

  if (!rendered) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <div
        className={`absolute inset-0 bg-neutral-900/50 transition-opacity duration-300 ease-out ${
          isVisible ? "opacity-100" : "opacity-0"
        }`}
        onClick={onClose}
      />

      <div
        onTransitionEnd={handleTransitionEnd}
        className={`relative z-10 flex w-full flex-col items-center gap-2 rounded-t-3xl bg-neutral-0 px-3.75 pt-3 pb-8 transition-transform duration-300 ease-out ${
          isVisible ? "translate-y-0" : "translate-y-full"
        }`}
      >
        <div className="pt-2 pb-3">
          <div className="h-1 w-11 shrink-0 rounded bg-[#DEDEDE]" />
        </div>

        <div className="flex w-full flex-col items-center gap-4">
          <h2 className="text-center text-label1 text-neutral-900">
            모드 및 밴드 전환
          </h2>

          <div className="flex w-full flex-col items-center gap-6">
            <div className="flex w-82.5 flex-col gap-4">
              <span className="text-label2 text-secondary-500">밴드 모드</span>

              <div className="flex w-full flex-col gap-3">
                <AccountRow
                  avatar={profile.avatarUrl || BandAvatar}
                  name={profile.name}
                  subtitle={`${profile.genre} · ${profile.regions.join(", ")}`}
                  selected={selectedId === "band-1"}
                  onSelect={() => setSelectedId("band-1")}
                />

                {MOCK_OTHER_BANDS.map((band) => (
                  <AccountRow
                    key={band.id}
                    avatar={BandAvatar}
                    name={band.name}
                    subtitle={band.subtitle}
                    selected={selectedId === band.id}
                    onSelect={() => setSelectedId(band.id)}
                  />
                ))}
              </div>
            </div>

            <div className="h-px w-90.75 shrink-0 bg-neutral-400" />

            <div className="flex w-82.5 flex-col gap-4">
              <span className="text-label2 text-primary-400">팬 모드</span>

              <div className="flex w-full flex-col gap-3">
                {MOCK_FAN_ACCOUNTS.map((fan) => (
                  <AccountRow
                    key={fan.id}
                    avatar={FanAvatar}
                    name={fan.nickname}
                    subtitle={fan.email}
                    selected={selectedId === fan.id}
                    onSelect={() => setSelectedId(fan.id)}
                  />
                ))}
              </div>
            </div>

            <div className="h-px w-90.75 shrink-0 bg-neutral-400" />

            <button
              type="button"
              className="flex w-82.5 items-center justify-start gap-2 text-label2 text-[#71717A]"
            >
              + 새 밴드 만들기
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
