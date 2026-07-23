import { Fragment } from "react";
import { ToggleSwitch } from "@/components/band/my/ToggleSwitch";

export interface NotificationToggleItem {
  id: string;
  title: string;
  description: string;
}

interface NotificationToggleListProps {
  items: NotificationToggleItem[];
  values: Record<string, boolean>;
  onToggle: (id: string) => void;
}

export const NotificationToggleList = ({
  items,
  values,
  onToggle,
}: NotificationToggleListProps) => (
  <div className="flex flex-col gap-4">
    {items.map((item) => (
      <Fragment key={item.id}>
        <div className="flex items-center justify-between gap-4 px-2">
          <div className="flex min-w-0 flex-col gap-1">
            <span className="text-body6 text-neutral-900">{item.title}</span>
            <span className="text-caption2 text-neutral-600">
              {item.description}
            </span>
          </div>

          <ToggleSwitch
            checked={values[item.id] ?? false}
            onChange={() => onToggle(item.id)}
            label={item.title}
          />
        </div>

        <div className="h-0.5 bg-neutral-300" />
      </Fragment>
    ))}
  </div>
);
