import { useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { Header } from "@/components/common/Header/Header";
import { useEnterBandInviteLink } from "@/hooks/api/band/useBandMember";
import { notificationKeys } from "@/hooks/api/useNotifications";
import { getApiErrorMessage } from "@/utils/getApiErrorMessage";
import { getStoredAuthUser } from "@/utils/authUser";

const BandInviteLinkPage = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { token = "" } = useParams<{ token: string }>();
  const enterInviteLink = useEnterBandInviteLink();
  const hasRequestedRef = useRef(false);

  useEffect(() => {
    if (!token || hasRequestedRef.current) return;

    if (!getStoredAuthUser()) {
      navigate("/login", { replace: true });
      return;
    }

    hasRequestedRef.current = true;

    enterInviteLink.mutate(token, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: notificationKeys.all });
        navigate("/band/notifications", { replace: true });
      },
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  return (
    <main className="relative flex min-h-dvh flex-col items-center bg-neutral-0">
      <Header title="밴드 초대" />

      <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
        {enterInviteLink.isError ? (
          <>
            <p className="text-caption1 text-neutral-500">
              {getApiErrorMessage(
                enterInviteLink.error,
                "초대 링크를 확인할 수 없어요",
              )}
            </p>
            <button
              type="button"
              onClick={() => navigate("/band/home")}
              className="rounded-lg bg-secondary-500 px-4 py-2 text-caption2 text-neutral-0"
            >
              홈으로 이동
            </button>
          </>
        ) : (
          <p className="text-caption1 text-neutral-500">
            초대를 확인하고 있어요
          </p>
        )}
      </div>
    </main>
  );
};

export default BandInviteLinkPage;
