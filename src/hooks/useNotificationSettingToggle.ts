import { useMemo, useState } from "react";
import {
  useNotificationSettingsQuery,
  useUpdateNotificationSettingMutation,
} from "@/hooks/api/useNotifications";
import type {
  NotificationSettingsMode,
  NotificationSettingType,
} from "@/types/notification";
import { requestAndRegisterWebPushToken } from "@/utils/webPushNotifications";

interface UseNotificationSettingToggleOptions {
  mode: NotificationSettingsMode;
  defaultValues: Record<string, boolean>;
  settingTypeById: Record<string, NotificationSettingType>;
}

export const useNotificationSettingToggle = ({
  mode,
  defaultValues,
  settingTypeById,
}: UseNotificationSettingToggleOptions) => {
  const settingsQuery = useNotificationSettingsQuery(mode);
  const updateSetting = useUpdateNotificationSettingMutation();
  const [isRegisteringPushToken, setIsRegisteringPushToken] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const hasLoadedSettings = Boolean(settingsQuery.data);
  const values = useMemo(
    () => ({
      ...defaultValues,
      ...(hasLoadedSettings ? settingsQuery.data?.values : {}),
    }),
    [defaultValues, hasLoadedSettings, settingsQuery.data?.values],
  );
  const isDisabled =
    settingsQuery.isLoading ||
    settingsQuery.isError ||
    updateSetting.isPending ||
    isRegisteringPushToken;
  const message =
    statusMessage ??
    (settingsQuery.isLoading ? "알림 설정을 불러오는 중이에요" : null) ??
    (settingsQuery.isError ? "알림 설정을 불러오지 못했어요" : null) ??
    (updateSetting.isError ? "알림 설정을 변경하지 못했어요" : null);

  const toggle = async (id: string, checked: boolean) => {
    const settingType = settingTypeById[id];

    if (!settingType || isDisabled) return;

    setStatusMessage(null);

    if (checked) {
      setIsRegisteringPushToken(true);

      try {
        const token = await requestAndRegisterWebPushToken();

        if (!token) {
          setStatusMessage(
            "브라우저 알림 권한을 허용해야 알림을 받을 수 있어요",
          );
          return;
        }
      } catch {
        setStatusMessage("푸시 알림 토큰을 등록하지 못했어요");
        return;
      } finally {
        setIsRegisteringPushToken(false);
      }
    }

    try {
      await updateSetting.mutateAsync({
        mode,
        settingType,
        enabled: checked,
      });
    } catch {
      setStatusMessage("알림 설정을 변경하지 못했어요");
    }
  };

  return {
    values,
    isDisabled,
    statusMessage: message,
    toggle,
  };
};
