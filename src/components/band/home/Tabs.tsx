export interface TabItem {
  id: string;
  label: string;
}

interface TabsProps {
  tabs: TabItem[];
  activeTabId: string;
  onChange: (tabId: string) => void;
}

export const Tabs = ({ tabs, activeTabId, onChange }: TabsProps) => {
  return (
    <div className="relative -mx-5">
      <div className="absolute inset-x-0 bottom-0 h-0.5 bg-neutral-200" />

      <div className="relative flex px-5">
        {tabs.map((tab) => {
          const isActive = tab.id === activeTabId;

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onChange(tab.id)}
              className={`flex flex-1 flex-col items-center gap-2 text-body1 ${
                isActive ? 'text-neutral-900' : 'text-neutral-400'
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`h-0.5 w-28.5 ${isActive ? 'bg-secondary-500' : 'bg-transparent'}`}
              />
            </button>
          );
        })}
      </div>
    </div>
  );
};
