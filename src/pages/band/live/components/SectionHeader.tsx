import IconFrameIcon from "@/assets/icons/Icon Frame.svg";

export function SectionHeader({ title }: { title: string }) {
  return (
    <div className="flex items-center justify-between">
      <h2 className="text-label1 leading-6 text-neutral-900">{title}</h2>
      <button
        type="button"
        className="mr-5 flex items-center gap-1 text-body2 text-neutral-400"
      >
        전체보기
        <img src={IconFrameIcon} alt="" className="size-6" />
      </button>
    </div>
  );
}
