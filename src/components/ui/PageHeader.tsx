import type { ReactNode } from "react";

export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
      <div className="max-w-3xl">
        {eyebrow && <p className="text-sm font-medium text-ink-500">{eyebrow}</p>}
        <h1 className={`font-bold tracking-tight text-ink-900 ${eyebrow ? "mt-1 text-3xl md:text-4xl" : "text-3xl md:text-4xl"}`}>{title}</h1>
        {description && <p className="mt-2 text-base leading-7 text-ink-500">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-3">{actions}</div>}
    </div>
  );
}
