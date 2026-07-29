import { useState } from "react";
import type { AxiosError } from "axios";
import { useNavigate } from "react-router-dom";

import BandProfileImage from "@/assets/Img_Band.png";
import { useCreateSessionChatRoomMutation } from "@/hooks/api/session/useSessionChat";
import {
  useDeleteSessionRecruitment,
  useSessionRecruitmentDetailQuery,
} from "@/hooks/api/session/useSessionRecruitment";
import type { SessionRecruitmentPost } from "@/pages/band/session/types";
import type { SessionApiResponse } from "@/types/session/sessionRecruitment";

interface CompletedApplication {
  sessionApplicationId: number;
  applicationTitle: string;
}

interface UseSessionRecruitmentDetailParams {
  post: SessionRecruitmentPost;
  onBack: () => void;
  onDeletePost?: (postId: number) => void;
  onPreviewApplication?: (
    sessionApplicationId: number,
  ) => void;
  onEditApplication?: (
    sessionApplicationId: number,
  ) => void;
  onApplyApplication?: (
    sessionRecruitmentId: number,
    sessionApplicationId: number,
  ) => void | Promise<void>;
}

const toDeadlineLabel = (dDay?: number) => {
  if (dDay === undefined) return "";
  if (dDay < 0) return "마감";
  if (dDay === 0) return "오늘 마감";
  return `D-${dDay}`;
};

const formatDeadlineAt = (deadlineAt?: string) => {
  if (!deadlineAt) return "";

  const [dateValue, timeValueWithSecond] =
    deadlineAt.split("T");
  const timeValue =
    timeValueWithSecond?.slice(0, 5);

  if (!dateValue || !timeValue) {
    return deadlineAt;
  }

  const [year, month, day] = dateValue
    .split("-")
    .map(Number);

  if (!year || !month || !day) {
    return `${dateValue} ${timeValue} 마감`;
  }

  return `${year}.${String(month).padStart(
    2,
    "0",
  )}.${String(day).padStart(
    2,
    "0",
  )}. ${timeValue} 마감`;
};

export const useSessionRecruitmentDetail = ({
  post,
  onBack,
  onDeletePost,
  onPreviewApplication,
  onEditApplication,
  onApplyApplication,
}: UseSessionRecruitmentDetailParams) => {
  const navigate = useNavigate();

  const detailQuery =
    useSessionRecruitmentDetailQuery(post.id);

  const deleteRecruitmentMutation =
    useDeleteSessionRecruitment();

  const createChatRoomMutation =
    useCreateSessionChatRoomMutation();

  const [
    isDeleteModalOpen,
    setIsDeleteModalOpen,
  ] = useState(false);

  const [
    isApplicationModalOpen,
    setIsApplicationModalOpen,
  ] = useState(false);

  const [
    completedApplication,
    setCompletedApplication,
  ] =
    useState<CompletedApplication | null>(null);

  const [
    deleteErrorMessage,
    setDeleteErrorMessage,
  ] = useState("");

  const detail = detailQuery.data;

  const sessionRecruitmentId =
    detail?.sessionRecruitmentId ?? post.id;

  const title =
    detail?.recruitmentTitle ?? post.title;

  const bandName =
    detail?.bandName ?? post.bandName;

  const bandGenre =
    detail?.bandGenre ?? post.genre;

  const bandRegion =
    detail?.bandRegion ?? post.location;

  const content =
    detail?.content ?? post.description;

  const deadlineText = formatDeadlineAt(
    detail?.deadlineAt,
  );

  const dDayText = detail
    ? toDeadlineLabel(detail.dDay)
    : post.deadline;

  const bandProfileImageUrl =
    detail?.bandProfileImageUrl ||
    BandProfileImage;

  const shortLocation =
    bandRegion.split(" ")[0] || bandRegion;

  const canDelete =
    detail?.isMine ?? post.isMine ?? false;

  const infoRows = [
    {
      label: "파트",
      value: detail?.part ?? post.tags[0] ?? "-",
    },
    {
      label: "실력대",
      value:
        detail?.skillLevel ?? post.tags[1] ?? "-",
    },
    {
      label: "장르",
      value: detail?.genre ?? post.genre ?? "-",
    },
    {
      label: "활동 지역",
      value: detail?.region ?? post.location ?? "-",
    },
    {
      label: "연습 일정",
      value: detail?.practiceSchedule ?? "-",
    },
    {
      label: "연습 장소",
      value: detail?.practicePlace ?? "-",
    },
    {
      label: "지원 자격",
      value: detail?.qualification ?? "-",
    },
  ];

  const openDeleteModal = () => {
    setDeleteErrorMessage("");
    setIsDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    if (!deleteRecruitmentMutation.isPending) {
      setIsDeleteModalOpen(false);
    }
  };

  const confirmDelete = async () => {
    if (deleteRecruitmentMutation.isPending) {
      return;
    }

    setDeleteErrorMessage("");

    try {
      await deleteRecruitmentMutation.mutateAsync(
        sessionRecruitmentId,
      );

      setIsDeleteModalOpen(false);
      onDeletePost?.(sessionRecruitmentId);
      onBack();
    } catch (error) {
      const apiMessage = (
        error as AxiosError<
          SessionApiResponse<null>
        >
      ).response?.data?.message;

      setDeleteErrorMessage(
        apiMessage ??
          "세션 모집 공고 삭제에 실패했어요. 잠시 후 다시 시도해주세요.",
      );
    }
  };

  const applyApplication = async (
    sessionApplicationId: number,
    applicationTitle = "기본",
  ) => {
    if (canDelete) {
      setIsApplicationModalOpen(false);
      window.alert("내가 올린 모집 공고에는 지원할 수 없어요.");
      return;
    }

    try {
      await onApplyApplication?.(
        sessionRecruitmentId,
        sessionApplicationId,
      );

      setIsApplicationModalOpen(false);

      setCompletedApplication({
        sessionApplicationId,
        applicationTitle:
          applicationTitle || "기본",
      });
    } catch (error) {
      const apiMessage = (
        error as AxiosError<
          SessionApiResponse<null>
        >
      ).response?.data?.message;

      window.alert(
        apiMessage ??
          "지원에 실패했어요. 잠시 후 다시 시도해주세요.",
      );
    }
  };

  const previewApplication = (
    sessionApplicationId: number,
  ) => {
    setIsApplicationModalOpen(false);
    onPreviewApplication?.(sessionApplicationId);
  };

  const editApplication = (
    sessionApplicationId: number,
  ) => {
    setIsApplicationModalOpen(false);
    onEditApplication?.(sessionApplicationId);
  };

  const sendMessage = async () => {
    try {
      const room =
        await createChatRoomMutation.mutateAsync({
          contextType: "RECRUITMENT",
          sessionRecruitmentId,
        });

      navigate(
        `/band/session/messages/${room.chatRoomId}`,
        {
          state: {
            senderName: room.recipientName,
            profileImageUrl:
              bandProfileImageUrl,
            chatRoomId: room.chatRoomId,
            canSend: true,
          },
        },
      );
    } catch (error) {
      const apiMessage = (
        error as AxiosError<
          SessionApiResponse<null>
        >
      ).response?.data?.message;

      window.alert(
        apiMessage ??
          "쪽지방 생성에 실패했어요. 잠시 후 다시 시도해주세요.",
      );
    }
  };

  const viewCompletedApplication = () => {
    if (completedApplication) {
      onPreviewApplication?.(
        completedApplication.sessionApplicationId,
      );
    }
  };

  return {
    detailQuery,
    deleteRecruitmentMutation,
    completedApplication,

    title,
    bandName,
    bandGenre,
    content,
    deadlineText,
    dDayText,
    bandProfileImageUrl,
    shortLocation,
    infoRows,
    canDelete,

    deleteErrorMessage,
    isDeleteModalOpen,
    isApplicationModalOpen,
    isDetailLoaded:
      !detailQuery.isLoading &&
      !detailQuery.isError,

    openDeleteModal,
    closeDeleteModal,
    confirmDelete,

    openApplicationModal: () => {
      if (canDelete) {
        window.alert("내가 올린 모집 공고에는 지원할 수 없어요.");
        return;
      }

      setIsApplicationModalOpen(true);
    },

    closeApplicationModal: () =>
      setIsApplicationModalOpen(false),

    applyApplication,
    previewApplication,
    editApplication,
    sendMessage,
    viewCompletedApplication,
  };
};
