import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useSlideUpSheet } from "@/hooks/useSlideUpSheet";
import { useBandProfileStore } from "@/stores/useBandProfileStore";
import { useModeStore } from "@/stores/useModeStore";
import BandAvatar from "@/assets/images/IMG_my.svg";
import FanAvatar from "@/assets/icons/band/user-default-profile.svg";
import CheckCircleYellowIcon from "@/assets/icons/band/check-circle-yellow.svg";
import CheckApproveIcon from "@/assets/icons/band/check-approve.svg";

interface ModeSwitchSheetProps {
  open: boolean;
  onClose: () => void;
}

const LAST_FAN_PATH_KEY = "bscene:last-fan-path";

const MOCK_FAN_ACCOUNTS = [
  { id: "fan-1", nickname: "닉네임", email: "bethescene12@gmail.com" },
];

const MOCK_BAND_ACCOUNTS = [
  { id: "band-mock-1", name: "WAVY", subtitle: "인디록 · 서울" },
  { id: "band-mock-2", name: "밴드명", subtitle: "인디록 · 서울" },
];

interface AccountRowProps {
  avatar: string;
  name: string;
  subtitle: string;
  selected: boolean;
  selectedTone?: "fan" | "band";
  onSelect: () => void;
}

const saveLastFanPath = (path: string) => {
  window.sessionStorage.setItem(LAST_FAN_PATH_KEY, path);
};

const getLastFanPath = () => {
  const path = window.sessionStorage.getItem(LAST_FAN_PATH_KEY);

  if (path?.startsWith("/fan")) {
    return path;
  }

  return "/fan/home";
};

const AccountRow = ({
  avatar,
  name,
  subtitle,
  selected,
  selectedTone = "band",
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
      selectedTone === "fan" ? (
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          className="size-6 shrink-0"
          aria-hidden="true"
        >
          <path
            d="M12 2C17.5228 2 22 6.47715 22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2ZM15.707 9.29297C15.3165 8.90253 14.6835 8.90253 14.293 9.29297L11 12.5859L9.70703 11.293C9.31652 10.9025 8.68348 10.9025 8.29297 11.293C7.90246 11.6835 7.90251 12.3165 8.29297 12.707L10.293 14.707C10.6835 15.0976 11.3165 15.0976 11.707 14.707L15.707 10.707C16.0975 10.3165 16.0975 9.68347 15.707 9.29297Z"
            fill="#F04579"
          />
        </svg>
      ) : (
        <img src={CheckCircleYellowIcon} alt="" className="size-6 shrink-0" />
      )
    ) : (
      <img src={CheckApproveIcon} alt="" className="size-6 shrink-0" />
    )}
  </button>
);

export const ModeSwitchSheet = ({ open, onClose }: ModeSwitchSheetProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const bands = useBandProfileStore((state) => state.bands);
  const activeBandId = useBandProfileStore((state) => state.activeBandId);
  const setActiveBandId = useBandProfileStore((state) => state.setActiveBandId);
  const setMode = useModeStore((state) => state.setMode);

  const registeredBands = bands.filter((band) => band.name.trim());
  const bandAccounts =
    registeredBands.length > 0
      ? registeredBands.map((band) => ({
          id: band.id,
          avatar: band.avatarUrl || BandAvatar,
          name: band.name,
          subtitle: `${band.genre} · ${band.regions.join(", ")}`,
          storeBandId: band.id,
        }))
      : MOCK_BAND_ACCOUNTS.map((band) => ({
          ...band,
          avatar: BandAvatar,
          storeBandId: null,
        }));
  const isFanMode = location.pathname.startsWith("/fan");
  const initialSelectedId = isFanMode
    ? MOCK_FAN_ACCOUNTS[0].id
    : bandAccounts.some((band) => band.id === activeBandId)
      ? activeBandId
      : bandAccounts[0]?.id ?? activeBandId;
  const [selectedId, setSelectedId] = useState(initialSelectedId);
  const { rendered, isVisible, handleTransitionEnd } = useSlideUpSheet(
    open,
    () => setSelectedId(initialSelectedId),
  );
  const selectedMode = selectedId.startsWith("fan") ? "fan" : "band";
  const bandModeSection = (
    <div className="flex w-82.5 flex-col gap-4">
      <span className="text-label2 text-secondary-500">밴드 모드</span>

      <div className="flex w-full flex-col gap-3">
        {bandAccounts.map((band) => (
          <AccountRow
            key={band.id}
            avatar={band.avatar}
            name={band.name}
            subtitle={band.subtitle}
            selected={selectedId === band.id}
            onSelect={() => {
              setSelectedId(band.id);
              if (band.storeBandId) {
                setActiveBandId(band.storeBandId);
              }
            }}
          />
        ))}
      </div>
    </div>
  );
  const fanModeSection = (
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
            selectedTone="fan"
            onSelect={() => setSelectedId(fan.id)}
          />
        ))}
      </div>
    </div>
  );

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
            모드 전환
          </h2>

          <div className="flex w-full flex-col items-center gap-6">
            {isFanMode ? fanModeSection : bandModeSection}

            <div className="h-px w-90.75 shrink-0 bg-neutral-400" />

            {isFanMode ? bandModeSection : fanModeSection}

            {!isFanMode ? (
              <div className="h-px w-90.75 shrink-0 bg-neutral-400" />
            ) : null}

            {!isFanMode ? (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  navigate("/band/profile/new");
                }}
                className="flex w-82.5 items-center justify-start gap-2 text-label2 text-[#71717A]"
              >
                + 새 밴드 만들기
              </button>
            ) : null}

            <button
              type="button"
              onClick={() => {
                if (selectedMode === "fan") {
                  setMode("fan");
                  onClose();
                  navigate(getLastFanPath());
                  return;
                }

                const selectedBand = bandAccounts.find(
                  (band) => band.id === selectedId,
                );

                if (selectedBand?.storeBandId) {
                  setActiveBandId(selectedBand.storeBandId);
                }

                setMode("band");
                if (isFanMode) {
                  saveLastFanPath(
                    `${location.pathname}${location.search}${location.hash}`,
                  );
                }
                onClose();
                navigate("/band/home");
              }}
              className={`flex h-[52px] w-[353px] items-center justify-center rounded-[12px] text-label1 text-neutral-0 ${
                selectedMode === "fan" ? "bg-primary-400" : "bg-secondary-500"
              }`}
            >
              모드 전환
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
