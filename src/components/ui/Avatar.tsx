const AVATAR_COLORS = [
  "bg-teal-500",
  "bg-blue-500",
  "bg-violet-500",
  "bg-orange-500",
  "bg-rose-500",
  "bg-cyan-500",
];

function hashInitials(initials: string) {
  return initials.split("").reduce((sum, char) => sum + char.charCodeAt(0), 0);
}

export function Avatar({ initials, src, size = "md" }: { initials: string; src?: string; size?: "sm" | "md" | "lg" }) {
  const sizes = {
    sm: "h-8 w-8 text-xs",
    md: "h-10 w-10 text-sm",
    lg: "h-12 w-12 text-base",
  };
  const color = AVATAR_COLORS[hashInitials(initials) % AVATAR_COLORS.length];

  return src ? (
    <img className={`${sizes[size]} shrink-0 rounded-full border-2 border-white object-cover shadow-soft`} src={src} alt="" />
  ) : (
    <div className={`${sizes[size]} ${color} flex shrink-0 items-center justify-center rounded-full font-bold text-white shadow-soft`}>
      {initials}
    </div>
  );
}
