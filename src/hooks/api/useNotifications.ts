import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
  type InfiniteData,
} from "@tanstack/react-query";
import {
  deletePushToken,
  getNotifications,
  getNotificationSettings,
  getNotificationSettingKey,
  markNotificationAsRead,
  registerPushToken,
  sendTestNotification,
  updateNotificationSetting,
} from "@/api/notification";
import type {
  NotificationSettingsResponse,
  NotificationSettingsMode,
  NotificationsPageResponse,
  UpdateNotificationSettingParams,
} from "@/types/notification";

export const notificationKeys = {
  all: ["notifications"] as const,
  list: (size: number) => [...notificationKeys.all, "list", size] as const,
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

export const useNotificationSettingsQuery = (
  mode: NotificationSettingsMode,
) => {
  return useQuery({
    queryKey: notificationKeys.settings(mode),
    queryFn: () => getNotificationSettings({ mode }),
    staleTime: 1000 * 60,
  });
};

export const useRegisterPushTokenMutation = () => {
  return useMutation({
    mutationFn: registerPushToken,
  });
};

export const useDeletePushTokenMutation = () => {
  return useMutation({
    mutationFn: deletePushToken,
  });
};

export const useSendTestNotificationMutation = () => {
  return useMutation({
    mutationFn: sendTestNotification,
  });
};

export const useUpdateNotificationSettingMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ settingType, enabled }: UpdateNotificationSettingParams) =>
      updateNotificationSetting({ settingType, enabled }),
    onMutate: async ({ mode, settingType, enabled }) => {
      const queryKey = notificationKeys.settings(mode);

      await queryClient.cancelQueries({ queryKey });

      const previousSettings =
        queryClient.getQueryData<NotificationSettingsResponse>(queryKey);
      const settingKey = getNotificationSettingKey(settingType);

      queryClient.setQueryData<NotificationSettingsResponse>(
        queryKey,
        (currentSettings) => ({
          mode: currentSettings?.mode ?? mode,
          values: {
            ...currentSettings?.values,
            [settingKey]: enabled,
          },
        }),
      );

      return { previousSettings, queryKey };
    },
    onError: (_error, _variables, context) => {
      if (context?.previousSettings) {
        queryClient.setQueryData(context.queryKey, context.previousSettings);
      }
    },
  });
};

export const useMarkNotificationAsReadMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: markNotificationAsRead,
    onMutate: async (notificationId) => {
      await queryClient.cancelQueries({ queryKey: notificationKeys.all });

      queryClient.setQueriesData<InfiniteData<NotificationsPageResponse>>(
        { queryKey: notificationKeys.all },
        (currentData) => {
          if (!currentData) return currentData;

          const readAt = new Date().toISOString();

          return {
            ...currentData,
            pages: currentData.pages.map((page) => ({
              ...page,
              items: page.items.map((notification) =>
                notification.notificationId === notificationId
                  ? {
                      ...notification,
                      isRead: true,
                      readAt: notification.readAt ?? readAt,
                    }
                  : notification,
              ),
            })),
          };
        },
      );
    },
    onSettled: () =>
      queryClient.invalidateQueries({ queryKey: notificationKeys.all }),
  });
};
