import { PlusIcon } from "./SessionIcons";

interface FloatingCreateButtonProps {
  onClick: () => void;
}

export const FloatingCreateButton = ({ onClick }: FloatingCreateButtonProps) => {
  return (
    <button
      type="button"
      aria-label="세션 모집 공고 등록"
      onClick={onClick}
      className="fixed right-6 bottom-[calc(var(--bottom-nav-height)+30px)] z-20 flex size-[62px] items-center justify-center rounded-full bg-secondary-500 text-neutral-0 shadow-[0_8px_20px_rgba(251,177,14,0.35)]"
    >
      <PlusIcon className="size-9" />
    </button>
  );
};
