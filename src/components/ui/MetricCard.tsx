import type { LucideIcon } from "lucide-react";

export function MetricCard({
  label,
  value,
  detail,
  icon: Icon,
  accent = "brand",
}: {
  label: string;
  value: string;
  detail: string;
  icon: LucideIcon;
  accent?: "brand" | "coral" | "amber" | "blue";
}) {
  const accentClasses = {
    brand: "bg-blue-50 text-blue-600",
    coral: "bg-rose-50 text-rose-500",
    amber: "bg-amber-50 text-amber-600",
    blue: "bg-violet-50 text-violet-600",
  };

  return (
    <section className="panel p-5">
      <div className={`inline-flex rounded-2xl p-2.5 ${accentClasses[accent]}`}>
        <Icon className="h-5 w-5" />
      </div>
      <p className="mt-4 text-sm font-medium text-ink-500">{label}</p>
      <p className="mt-1 text-3xl font-bold tracking-tight text-ink-900">{value}</p>
      <p className="mt-2 text-sm text-ink-400">{detail}</p>
    </section>
  );
}
