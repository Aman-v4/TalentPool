import { X } from "lucide-react";
import type { ReactNode } from "react";

export function SlideOver({
  title,
  subtitle,
  children,
  footer,
  onClose,
  width = "max-w-md",
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
  footer?: ReactNode;
  onClose: () => void;
  width?: string;
}) {
  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <button className="absolute inset-0 bg-ink-900/40" onClick={onClose} aria-label="Close panel" />
      <aside className={`relative flex h-full w-full ${width} flex-col bg-white shadow-panel`}>
        <div className="flex items-start justify-between border-b border-ink-100 px-6 py-5">
          <div>
            <h2 className="text-lg font-bold text-ink-900">{title}</h2>
            {subtitle && <p className="mt-1 text-sm text-ink-500">{subtitle}</p>}
          </div>
          <button onClick={onClose} className="focus-ring rounded-full p-2 text-ink-400 hover:bg-ink-50 hover:text-ink-900">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-6 py-5">{children}</div>
        {footer && <div className="border-t border-ink-100 px-6 py-4">{footer}</div>}
      </aside>
    </div>
  );
}
