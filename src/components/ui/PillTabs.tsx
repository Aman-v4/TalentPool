import type { ReactNode } from "react";

export function PillTabs<T extends string>({
  tabs,
  active,
  onChange,
}: {
  tabs: Array<{ id: T; label: string; icon?: ReactNode; count?: number }>;
  active: T;
  onChange: (id: T) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          type="button"
          onClick={() => onChange(tab.id)}
          className={`pill-tab ${active === tab.id ? "pill-tab-active" : ""}`}
        >
          {tab.icon}
          <span>{tab.label}</span>
          {tab.count !== undefined && (
            <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${active === tab.id ? "bg-white/20 text-white" : "bg-ink-200 text-ink-600"}`}>
              {tab.count}
            </span>
          )}
        </button>
      ))}
    </div>
  );
}
