import { ChevronLeft } from "lucide-react";
import { Link } from "react-router-dom";

export function Breadcrumbs({
  items,
}: {
  items: Array<{ label: string; href?: string }>;
}) {
  return (
    <nav className="flex items-center gap-1.5 text-sm text-ink-400">
      {items.map((item, index) => (
        <span key={`${item.label}-${index}`} className="flex items-center gap-1.5">
          {index > 0 && <span className="text-ink-300">/</span>}
          {item.href ? (
            <Link to={item.href} className="inline-flex items-center gap-1 font-medium hover:text-ink-700">
              {index === 0 && <ChevronLeft className="h-4 w-4" />}
              {item.label}
            </Link>
          ) : (
            <span className="font-semibold text-ink-700">{item.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}
