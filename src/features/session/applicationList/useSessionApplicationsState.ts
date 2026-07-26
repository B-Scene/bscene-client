// src/features/session/applicationList/useSessionApplicationsState.ts

import {
  useMemo,
  useState,
} from "react";

import type {
  SessionApplicationDraft,
  SessionApplicationFormMode,
} from "@/features/session/applicationForm/applicationForm.types";

import {
  mapApplicationToDetail,
  mapServerApplications,
} from "@/features/session/applicationList/sessionApplicationList.mapper";

import type {
  ApplicationCardItem,
  SessionApplicationSummary,
} from "@/features/session/applicationList/sessionApplicationList.types";

interface UseSessionApplicationsStateParams {
  summary?: SessionApplicationSummary;

  onServerVisibilityChange: (
    sessionApplicationId: number,
    isPublic: boolean,
  ) => void;

  onServerDelete?: (
    sessionApplicationId: number,
  ) => void;
}

export const useSessionApplicationsState = ({
  summary,
  onServerVisibilityChange,
  onServerDelete,
}: UseSessionApplicationsStateParams) => {
  const [
    isApplicationFormOpen,
    setIsApplicationFormOpen,
  ] = useState(false);

  const [
    applicationFormMode,
    setApplicationFormMode,
  ] =
    useState<SessionApplicationFormMode>(
      "create",
    );

  const [
    editingApplicationId,
    setEditingApplicationId,
  ] = useState<number | null>(null);

  const [
    editingInitialValue,
    setEditingInitialValue,
  ] =
    useState<SessionApplicationDraft | null>(
      null,
    );

  const [
    selectedApplication,
    setSelectedApplication,
  ] =
    useState<ApplicationCardItem | null>(
      null,
    );

  const [
    localApplications,
    setLocalApplications,
  ] = useState<ApplicationCardItem[]>([]);

  const [
    applicationOverrides,
    setApplicationOverrides,
  ] = useState<
    Record<number, ApplicationCardItem>
  >({});

  const serverApplications = useMemo(
    () =>
      mapServerApplications(
        summary,
        applicationOverrides,
      ),
    [applicationOverrides, summary],
  );

  const applications = useMemo(
    () => [
      ...localApplications,
      ...serverApplications,
    ],
    [
      localApplications,
      serverApplications,
    ],
  );

  const selectedApplicationDetail =
    useMemo(() => {
      if (!selectedApplication) {
        return null;
      }

      return mapApplicationToDetail(
        selectedApplication,
        summary,
      );
    }, [selectedApplication, summary]);

  const handleOpenCreatePage = () => {
    setApplicationFormMode("create");
    setEditingApplicationId(null);
    setEditingInitialValue(null);
    setIsApplicationFormOpen(true);
  };

  const handleOpenEditPage = (
    application: ApplicationCardItem,
  ) => {
    setApplicationFormMode("edit");

    setEditingApplicationId(
      application.sessionApplicationId,
    );

    setEditingInitialValue(
      application.draft,
    );

    setIsApplicationFormOpen(true);
  };

  const handleCloseApplicationForm = () => {
    setIsApplicationFormOpen(false);
    setEditingApplicationId(null);
    setEditingInitialValue(null);
  };

  const handleOpenApplicationDetail = (
    application: ApplicationCardItem,
  ) => {
    setSelectedApplication(application);
  };

  const handleCloseApplicationDetail =
    () => {
      setSelectedApplication(null);
    };

  const handleSubmitApplication = (
    draft: SessionApplicationDraft,
  ) => {
    if (
      applicationFormMode === "edit" &&
      editingApplicationId !== null
    ) {
      const currentApplication =
        applications.find(
          (application) =>
            application.sessionApplicationId ===
            editingApplicationId,
        );

      if (!currentApplication) {
        return;
      }

      const updatedApplication: ApplicationCardItem =
        {
          ...currentApplication,

          displayDate: `${getCurrentDate()} 수정`,

          title: draft.applicationType,
          purpose: draft.title,

          draft,
        };

      if (currentApplication.isLocal) {
        setLocalApplications(
          (previousApplications) =>
            previousApplications.map(
              (application) =>
                application.sessionApplicationId ===
                editingApplicationId
                  ? updatedApplication
                  : application,
            ),
        );
      } else {
        setApplicationOverrides(
          (previousOverrides) => ({
            ...previousOverrides,

            [editingApplicationId]:
              updatedApplication,
          }),
        );
      }

      handleCloseApplicationForm();
      return;
    }

    const newApplication: ApplicationCardItem =
      {
        sessionApplicationId:
          Date.now(),

        displayDate: `${getCurrentDate()} 작성`,

        title: draft.applicationType,
        purpose: draft.title,

        isPublic: true,
        isLocal: true,

        draft,
      };

    setLocalApplications(
      (previousApplications) => [
        newApplication,
        ...previousApplications,
      ],
    );

    handleCloseApplicationForm();
  };

  const handleToggleVisibility = (
    application: ApplicationCardItem,
    nextChecked: boolean,
  ) => {
    if (application.isLocal) {
      setLocalApplications(
        (previousApplications) =>
          previousApplications.map(
            (item) =>
              item.sessionApplicationId ===
              application.sessionApplicationId
                ? {
                    ...item,
                    isPublic: nextChecked,
                  }
                : item,
          ),
      );

      return;
    }

    setApplicationOverrides(
      (previousOverrides) => ({
        ...previousOverrides,

        [application.sessionApplicationId]:
          {
            ...application,
            isPublic: nextChecked,
          },
      }),
    );

    onServerVisibilityChange(
      application.sessionApplicationId,
      nextChecked,
    );
  };

  const handleDeleteApplication = (
    application: ApplicationCardItem,
  ) => {
    if (application.isLocal) {
      setLocalApplications(
        (previousApplications) =>
          previousApplications.filter(
            (item) =>
              item.sessionApplicationId !==
              application.sessionApplicationId,
          ),
      );

      if (
        selectedApplication
          ?.sessionApplicationId ===
        application.sessionApplicationId
      ) {
        setSelectedApplication(null);
      }

      return;
    }

    onServerDelete?.(
      application.sessionApplicationId,
    );
  };

  return {
    applications,
    hasApplications:
      applications.length > 0,

    localApplicationCount:
      localApplications.length,

    isApplicationFormOpen,
    applicationFormMode,
    editingInitialValue,

    selectedApplicationDetail,

    handleOpenCreatePage,
    handleOpenEditPage,
    handleCloseApplicationForm,

    handleOpenApplicationDetail,
    handleCloseApplicationDetail,

    handleSubmitApplication,
    handleToggleVisibility,
    handleDeleteApplication,
  };
};

const getCurrentDate = () => {
  const now = new Date();

  const year = now.getFullYear();

  const month = String(
    now.getMonth() + 1,
  ).padStart(2, "0");

  const day = String(
    now.getDate(),
  ).padStart(2, "0");

  return `${year}-${month}-${day}`;
};