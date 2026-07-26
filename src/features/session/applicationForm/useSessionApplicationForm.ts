// src/features/session/applicationForm/useSessionApplicationForm.ts

import {
  type FormEvent,
  useEffect,
  useMemo,
  useState,
} from "react";

import { createInitialApplicationForm } from "@/features/session/applicationForm/applicationForm.constants";
import type {
  SessionApplicationDraft,
  SessionApplicationExperience,
  SessionApplicationFormMode,
} from "@/features/session/applicationForm/applicationForm.types";
import {
  cloneApplicationDraft,
  normalizeApplicationDraft,
} from "@/features/session/applicationForm/applicationForm.utils";

interface UseSessionApplicationFormParams {
  open: boolean;
  mode: SessionApplicationFormMode;
  initialValue?: SessionApplicationDraft | null;
  onClose: () => void;
  onSubmit: (application: SessionApplicationDraft) => void;
}

export const useSessionApplicationForm = ({
  open,
  mode,
  initialValue,
  onClose,
  onSubmit,
}: UseSessionApplicationFormParams) => {
  const [form, setForm] = useState<SessionApplicationDraft>(
    () =>
      initialValue
        ? cloneApplicationDraft(initialValue)
        : createInitialApplicationForm(),
  );

  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);

  const isEditMode = mode === "edit";

  const headerTitle = isEditMode ? "지원서 수정" : "지원서 작성";
  const submitButtonLabel = isEditMode ? "지원서 저장" : "지원서 등록";

  useEffect(() => {
    if (!open) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  useEffect(() => {
    if (!open) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsCancelModalOpen(true);
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  const isFormValid = useMemo(() => {
    const areExperiencesValid = form.experiences.every(
      (experience) =>
        experience.title.trim() && experience.period.trim(),
    );

    return Boolean(
      form.applicationType.trim() &&
        form.title.trim() &&
        form.shortIntroduction.trim() &&
        form.introduction.trim() &&
        form.part &&
        form.skillLevel &&
        form.genre &&
        form.region &&
        form.activities.length > 0 &&
        areExperiencesValid,
    );
  }, [form]);

  const updateField = <Key extends keyof SessionApplicationDraft>(
    key: Key,
    value: SessionApplicationDraft[Key],
  ) => {
    setForm((previousForm) => ({
      ...previousForm,
      [key]: value,
    }));
  };

  const handleActivityToggle = (activity: string) => {
    setForm((previousForm) => {
      const isSelected = previousForm.activities.includes(activity);

      return {
        ...previousForm,
        activities: isSelected
          ? previousForm.activities.filter((item) => item !== activity)
          : [...previousForm.activities, activity],
      };
    });
  };

  const handleAddExperience = () => {
    const newExperience: SessionApplicationExperience = {
      id: Date.now(),
      title: "",
      period: "",
      description: "",
    };

    setForm((previousForm) => ({
      ...previousForm,
      experiences: [...previousForm.experiences, newExperience],
    }));
  };

  const handleUpdateExperience = (
    experienceId: number,
    key: keyof Omit<SessionApplicationExperience, "id">,
    value: string,
  ) => {
    setForm((previousForm) => ({
      ...previousForm,
      experiences: previousForm.experiences.map((experience) =>
        experience.id === experienceId
          ? {
              ...experience,
              [key]: value,
            }
          : experience,
      ),
    }));
  };

  const handleDeleteExperience = (experienceId: number) => {
    setForm((previousForm) => ({
      ...previousForm,
      experiences: previousForm.experiences.filter(
        (experience) => experience.id !== experienceId,
      ),
    }));
  };

  const handleAddPortfolio = () => {
    setForm((previousForm) => ({
      ...previousForm,
      portfolioLinks: [...previousForm.portfolioLinks, ""],
    }));
  };

  const handleUpdatePortfolio = (index: number, value: string) => {
    setForm((previousForm) => ({
      ...previousForm,
      portfolioLinks: previousForm.portfolioLinks.map((link, linkIndex) =>
        linkIndex === index ? value : link,
      ),
    }));
  };

  const handleDeletePortfolio = (index: number) => {
    setForm((previousForm) => {
      if (previousForm.portfolioLinks.length === 1) {
        return {
          ...previousForm,
          portfolioLinks: [""],
        };
      }

      return {
        ...previousForm,
        portfolioLinks: previousForm.portfolioLinks.filter(
          (_, linkIndex) => linkIndex !== index,
        ),
      };
    });
  };

  const handleRequestClose = () => {
    setIsCancelModalOpen(true);
  };

  const handleCancelModalClose = () => {
    setIsCancelModalOpen(false);
  };

  const handleConfirmClose = () => {
    setIsCancelModalOpen(false);
    onClose();
  };

  const handleSaveModalClose = () => {
    setIsSaveModalOpen(false);
  };

  const submitApplication = () => {
    onSubmit(normalizeApplicationDraft(form));
    setIsSaveModalOpen(false);
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!isFormValid) {
      return;
    }

    if (isEditMode) {
      setIsSaveModalOpen(true);
      return;
    }

    submitApplication();
  };

  return {
    form,
    isFormValid,
    isEditMode,
    headerTitle,
    submitButtonLabel,
    isCancelModalOpen,
    isSaveModalOpen,
    updateField,
    handleActivityToggle,
    handleAddExperience,
    handleUpdateExperience,
    handleDeleteExperience,
    handleAddPortfolio,
    handleUpdatePortfolio,
    handleDeletePortfolio,
    handleRequestClose,
    handleCancelModalClose,
    handleConfirmClose,
    handleSaveModalClose,
    handleSubmit,
    submitApplication,
  };
};

export type SessionApplicationFormController = ReturnType<
  typeof useSessionApplicationForm
>;
