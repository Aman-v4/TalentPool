const POOL_COLORS = [
  "bg-blue-500",
  "bg-violet-500",
  "bg-emerald-500",
  "bg-orange-500",
  "bg-rose-500",
  "bg-cyan-500",
  "bg-indigo-500",
];

function hashName(name: string) {
  return name.split("").reduce((sum, char) => sum + char.charCodeAt(0), 0);
}

export function getPoolInitials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase() ?? "")
    .join("");
}

export function PoolIcon({ name, size = "md" }: { name: string; size?: "sm" | "md" | "lg" }) {
  const sizes = {
    sm: "h-10 w-10 rounded-2xl text-sm",
    md: "h-14 w-14 rounded-2xl text-lg",
    lg: "h-16 w-16 rounded-3xl text-xl",
  };
  const color = POOL_COLORS[hashName(name) % POOL_COLORS.length];

  return (
    <div className={`${sizes[size]} ${color} flex shrink-0 items-center justify-center font-bold text-white shadow-soft`}>
      {getPoolInitials(name)}
    </div>
  );
}
