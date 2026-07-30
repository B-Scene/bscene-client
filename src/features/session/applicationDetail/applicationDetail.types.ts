export type DetailSectionId =
  | "introduction"
  | "information"
  | "career"
  | "portfolio";

export type SectionRefCallback = (element: HTMLElement | null) => void;

export const APPLICATION_DETAIL_TABS: Array<{
  id: DetailSectionId;
  label: string;
}> = [
  { id: "introduction", label: "소개" },
  { id: "information", label: "정보" },
  { id: "career", label: "경력" },
  { id: "portfolio", label: "포트폴리오" },
];
