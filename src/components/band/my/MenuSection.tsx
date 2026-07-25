import ArrowRightIcon from "@/assets/icons/band/arrow-right-my.svg";

export interface MenuRowItem {
  id: string;
  label: string;
  onClick?: () => void;
}

interface MenuSectionProps {
  title: string;
  items: MenuRowItem[];
}

export const MenuSection = ({ title, items }: MenuSectionProps) => (
  <div className="flex flex-col gap-4">
    <h3 className="px-5 text-caption3 text-neutral-600">{title}</h3>

    <div className="flex flex-col gap-5 px-5">
      {items.map((item) => (
        <button
          key={item.id}
          type="button"
          onClick={item.onClick}
          className="flex items-center justify-between text-left text-body2 text-neutral-900"
        >
          {item.label}
          <img src={ArrowRightIcon} alt="" className="shrink-0" />
        </button>
      ))}
    </div>
  </div>
);
