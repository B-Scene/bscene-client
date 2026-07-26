import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useMyProfilesQuery } from "@/hooks/api/user/useMyProfiles";
import { useChangeUserMode } from "@/hooks/api/user/useMode";
import { useSlideUpSheet } from "@/hooks/useSlideUpSheet";
import { Toast } from "@/components/common/Toast/Toast";
import { useModeStore } from "@/stores/useModeStore";
import { getFanAccountDisplay } from "@/utils/authUser";
import { BAND_GENRE_LABELS, BAND_REGION_LABELS } from "@/utils/bandLabels";
import BandAvatar from "@/assets/images/IMG_my.svg";
import FanAvatar from "@/assets/icons/band/user-default-profile.svg";
import CheckCircleYellowIcon from "@/assets/icons/band/check-circle-yellow.svg";
import CheckApproveIcon from "@/assets/icons/band/check-approve.svg";

interface ModeSwitchSheetProps {
  open: boolean;
  onClose: () => void;
}

const LAST_FAN_PATH_KEY = "bscene:last-fan-path";

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
  const setMode = useModeStore((state) => state.setMode);
  const changeUserMode = useChangeUserMode();
  const { data: myProfiles } = useMyProfilesQuery({ type: "all" });

  const storedFanAccount = getFanAccountDisplay();
  const fanProfile = myProfiles?.fanProfile ?? null;
  const hasFanProfile = Boolean(fanProfile);
  const fanAccount = {
    id: fanProfile ? `fan-${fanProfile.fanProfileId}` : storedFanAccount.id,
    profileId: fanProfile?.fanProfileId ?? null,
    avatar: fanProfile?.profileImageUrl || FanAvatar,
    nickname: fanProfile?.nickname || storedFanAccount.nickname,
    email: fanProfile?.email || storedFanAccount.email,
  };

  const bandAccounts = (myProfiles?.bandProfiles ?? []).map((band) => ({
    id: `band-${band.bandId}`,
    bandMemberProfileId: band.bandMemberProfileId,
    avatar: band.profileImageUrl || BandAvatar,
    name: band.bandName,
    subtitle: `${BAND_GENRE_LABELS[band.genre as keyof typeof BAND_GENRE_LABELS] ?? band.genre} · ${BAND_REGION_LABELS[band.region as keyof typeof BAND_REGION_LABELS] ?? band.region}`,
    isActive: band.isActive,
  }));

  const isFanMode = location.pathname.startsWith("/fan");
  const activeBand = bandAccounts.find((band) => band.isActive);
  const initialSelectedId =
    isFanMode && hasFanProfile
      ? fanAccount.id
      : (activeBand?.id ?? bandAccounts[0]?.id ?? fanAccount.id);
  const [selectedId, setSelectedId] = useState(initialSelectedId);
  const [showErrorToast, setShowErrorToast] = useState(false);
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
            onSelect={() => setSelectedId(band.id)}
          />
        ))}
      </div>
    </div>
  );

  const fanModeSection = (
    <div className="flex w-82.5 flex-col gap-4">
      <span className="text-label2 text-primary-400">팬 모드</span>

      <div className="flex w-full flex-col gap-3">
        {hasFanProfile ? (
          <AccountRow
            avatar={fanAccount.avatar}
            name={fanAccount.nickname}
            subtitle={fanAccount.email}
            selected={selectedId === fanAccount.id}
            selectedTone="fan"
            onSelect={() => setSelectedId(fanAccount.id)}
          />
        ) : (
          <div className="flex w-full items-center justify-center rounded-lg bg-neutral-100 py-3 pr-3.75 pl-3 text-caption2 text-neutral-500">
            아직 팬 프로필이 없어요
          </div>
        )}
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
                const proceed = () => {
                  setMode(selectedMode);
                  if (selectedMode === "fan") {
                    onClose();
                    navigate(getLastFanPath());
                    return;
                  }

                  if (isFanMode) {
                    saveLastFanPath(
                      `${location.pathname}${location.search}${location.hash}`,
                    );
                  }
                  onClose();
                  navigate("/band/home");
                };

                if (selectedMode === "fan" && fanAccount.profileId) {
                  changeUserMode.mutate(
                    { profileId: fanAccount.profileId, type: "FAN" },
                    { onSuccess: proceed, onError: () => setShowErrorToast(true) },
                  );
                  return;
                }

                const selectedBand = bandAccounts.find(
                  (band) => band.id === selectedId,
                );

                if (selectedBand) {
                  changeUserMode.mutate(
                    {
                      profileId: selectedBand.bandMemberProfileId,
                      type: "BAND",
                    },
                    { onSuccess: proceed, onError: () => setShowErrorToast(true) },
                  );
                  return;
                }

                proceed();
              }}
              disabled={changeUserMode.isPending}
              className={`flex h-[52px] w-[353px] items-center justify-center rounded-[12px] text-label1 text-neutral-0 ${
                selectedMode === "fan" ? "bg-primary-400" : "bg-secondary-500"
              }`}
            >
              모드 전환
            </button>
          </div>
        </div>
      </div>

      <Toast
        open={showErrorToast}
        message="모드 전환에 실패했어요. 다시 시도해주세요"
        onClose={() => setShowErrorToast(false)}
      />
    </div>
  );
};
