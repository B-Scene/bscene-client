// src/features/session/applicationList/useSessionApplicationsState.ts

import { useMemo, useState } from "react";

import { createInitialApplicationForm } from "@/features/session/applicationForm/applicationForm.constants";
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

  onVisibilityBlocked?: () => void;

  onServerDelete?: (sessionApplicationId: number) => void | Promise<void>;
}

const shouldCreateDefaultApplication = ({
  summary,
  localApplicationCount,
}: {
  summary?: SessionApplicationSummary;
  localApplicationCount: number;
}) => {
  const serverApplicationCount =
    summary?.applicationCount ?? summary?.applications?.length ?? 0;

  return (
    !summary?.hasDefaultApplication &&
    serverApplicationCount + localApplicationCount === 0
  );
};

export const useSessionApplicationsState = ({
  summary,
  onServerVisibilityChange,
  onVisibilityBlocked,
  onServerDelete,
}: UseSessionApplicationsStateParams) => {
  const [isApplicationFormOpen, setIsApplicationFormOpen] = useState(false);

  const [applicationFormMode, setApplicationFormMode] =
    useState<SessionApplicationFormMode>("create");

  const [editingApplicationId, setEditingApplicationId] = useState<
    number | null
  >(null);

  const [editingInitialValue, setEditingInitialValue] =
    useState<SessionApplicationDraft | null>(null);

  const [selectedApplication, setSelectedApplication] =
    useState<ApplicationCardItem | null>(null);

  const [localApplications, setLocalApplications] = useState<
    ApplicationCardItem[]
  >([]);

  const [applicationOverrides, setApplicationOverrides] = useState<
    Record<number, ApplicationCardItem>
  >({});

  const serverApplications = useMemo(
    () => mapServerApplications(summary, applicationOverrides),
    [applicationOverrides, summary],
  );

  const applications = useMemo(
    () => [...localApplications, ...serverApplications],
    [localApplications, serverApplications],
  );

  const selectedApplicationDetail = useMemo(() => {
    if (!selectedApplication) {
      return null;
    }

    return mapApplicationToDetail(selectedApplication, summary);
  }, [selectedApplication, summary]);

  const handleOpenCreatePage = () => {
    const defaultInitialValue = shouldCreateDefaultApplication({
      summary,
      localApplicationCount: localApplications.length,
    })
      ? {
          ...createInitialApplicationForm(),
          applicationType: "기본",
        }
      : null;

    setApplicationFormMode("create");
    setEditingApplicationId(null);
    setEditingInitialValue(defaultInitialValue);
    setIsApplicationFormOpen(true);
  };

  const handleOpenEditPage = (
    application: ApplicationCardItem,
    detailDraft?: SessionApplicationDraft,
  ) => {
    setApplicationFormMode("edit");

    setEditingApplicationId(application.sessionApplicationId);

    setEditingInitialValue(detailDraft ?? application.draft);

    setIsApplicationFormOpen(true);
  };

  const handleCloseApplicationForm = () => {
    setIsApplicationFormOpen(false);
    setEditingApplicationId(null);
    setEditingInitialValue(null);
  };

  const handleOpenApplicationDetail = (
    application: ApplicationCardItem,
    detailDraft?: SessionApplicationDraft,
  ) => {
    setSelectedApplication(
      detailDraft
        ? {
            ...application,
            draft: detailDraft,
          }
        : application,
    );
  };

  const handleCloseApplicationDetail = () => {
    setSelectedApplication(null);
  };

  const handleToggleVisibility = (
    application: ApplicationCardItem,
    nextChecked: boolean,
  ) => {
    if (!application.isDefault) {
      onVisibilityBlocked?.();
      return;
    }

    if (application.isLocal) {
      setLocalApplications((previousApplications) =>
        previousApplications.map((item) =>
          item.sessionApplicationId === application.sessionApplicationId
            ? {
                ...item,
                isPublic: nextChecked,
              }
            : item,
        ),
      );

      return;
    }

    setApplicationOverrides((previousOverrides) => ({
      ...previousOverrides,

      [application.sessionApplicationId]: {
        ...application,
        isPublic: nextChecked,
      },
    }));

    onServerVisibilityChange(application.sessionApplicationId, nextChecked);
  };

  const handleDeleteApplication = (application: ApplicationCardItem) => {
    if (application.isLocal) {
      setLocalApplications((previousApplications) =>
        previousApplications.filter(
          (item) =>
            item.sessionApplicationId !== application.sessionApplicationId,
        ),
      );

      if (
        selectedApplication?.sessionApplicationId ===
        application.sessionApplicationId
      ) {
        setSelectedApplication(null);
      }

      return;
    }

    onServerDelete?.(application.sessionApplicationId);
  };

  return {
    applications,
    hasApplications: applications.length > 0,

    localApplicationCount: localApplications.length,

    isApplicationFormOpen,
    applicationFormMode,
    editingApplicationId,
    editingInitialValue,

    selectedApplicationDetail,

    handleOpenCreatePage,
    handleOpenEditPage,
    handleCloseApplicationForm,

    handleOpenApplicationDetail,
    handleCloseApplicationDetail,

    handleToggleVisibility,
    handleDeleteApplication,
  };
};