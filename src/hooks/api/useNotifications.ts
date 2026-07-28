import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import {
  NOTIFICATION_SETTING_KEY_BY_TYPE,
  deletePushToken,
  getNotificationSettings,
  getNotifications,
  markNotificationAsRead,
  registerPushToken,
  sendTestNotification,
  updateNotificationSetting,
} from "@/api/notification";
import type {
  DeletePushTokenRequest,
  NotificationSettingsResponse,
  NotificationSettingsMode,
  RegisterPushTokenRequest,
  SendTestNotificationRequest,
} from "@/types/notification";

export const notificationKeys = {
  all: ["notifications"] as const,
  lists: () => [...notificationKeys.all, "list"] as const,
  list: (size: number) => [...notificationKeys.lists(), { size }] as const,
  settings: (mode: NotificationSettingsMode) =>
    [...notificationKeys.all, "settings", mode] as const,
};

export const useNotificationsInfiniteQuery = (size = 20) => {
  return useInfiniteQuery({
    queryKey: notificationKeys.list(size),
    queryFn: ({ pageParam }) =>
      getNotifications({
        cursor: pageParam,
        size,
      }),
    initialPageParam: undefined as number | undefined,
    getNextPageParam: (lastPage) =>
      lastPage.hasNext ? (lastPage.nextCursor ?? undefined) : undefined,
    staleTime: 1000 * 30,
  });
};

export const useMarkNotificationAsReadMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: markNotificationAsRead,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: notificationKeys.lists() }),
  });
};

export const useNotificationSettingsQuery = (
  mode: NotificationSettingsMode,
) => {
  return useQuery({
    queryKey: notificationKeys.settings(mode),
    queryFn: () => getNotificationSettings(mode),
    staleTime: 1000 * 30,
  });
};

export const useUpdateNotificationSettingMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateNotificationSetting,
    onMutate: async ({ mode, settingType, enabled }) => {
      const queryKey = notificationKeys.settings(mode);

      await queryClient.cancelQueries({ queryKey });

      const previousSettings =
        queryClient.getQueryData<NotificationSettingsResponse>(queryKey);

      queryClient.setQueryData<NotificationSettingsResponse>(queryKey, {
        mode,
        values: {
          ...(previousSettings?.values ?? {}),
          [NOTIFICATION_SETTING_KEY_BY_TYPE[settingType]]: enabled,
        },
      });

      return { previousSettings, queryKey };
    },
    onError: (_error, _variables, context) => {
      if (!context) return;

      queryClient.setQueryData(context.queryKey, context.previousSettings);
    },
  });
};

export const useRegisterPushTokenMutation = () => {
  return useMutation({
    mutationFn: (body: RegisterPushTokenRequest) => registerPushToken(body),
  });
};

export const useDeletePushTokenMutation = () => {
  return useMutation({
    mutationFn: (body: DeletePushTokenRequest) => deletePushToken(body),
  });
};

export const useSendTestNotificationMutation = () => {
  return useMutation({
    mutationFn: (body: SendTestNotificationRequest) =>
      sendTestNotification(body),
  });
};
