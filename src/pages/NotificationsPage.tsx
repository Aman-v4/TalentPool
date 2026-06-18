import {
  Bell,
  BriefcaseBusiness,
  CheckCheck,
  CircleDollarSign,
  FileText,
  Megaphone,
  Star,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Badge } from "../components/ui/Badge";
import { PageHeader } from "../components/ui/PageHeader";
import { useTalentPool } from "../state/TalentPoolContext";
import type { Notification } from "../types";
import { formatDateTime } from "../utils/date";

const TYPE_META: Record<Notification["type"], { icon: LucideIcon; tone: "brand" | "blue" | "amber" | "success" | "coral" | "neutral" }> = {
  Application: { icon: FileText, tone: "brand" },
  Task: { icon: BriefcaseBusiness, tone: "blue" },
  Milestone: { icon: Star, tone: "amber" },
  Payment: { icon: CircleDollarSign, tone: "success" },
  Review: { icon: Star, tone: "amber" },
  Announcement: { icon: Megaphone, tone: "neutral" },
};

export function NotificationsPage() {
  const { markAllNotificationsRead, markNotificationRead, notifications } = useTalentPool();
  const unread = notifications.filter((notification) => !notification.read).length;
  const sorted = [...notifications].sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Activity feed"
        title="Notifications"
        actions={
          unread > 0 ? (
            <button
              onClick={markAllNotificationsRead}
              className="focus-ring inline-flex items-center gap-2 rounded-lg border border-ink-200 bg-white px-4 py-2 text-sm font-semibold text-ink-700 shadow-sm hover:bg-ink-50"
            >
              <CheckCheck className="h-4 w-4" />
              Mark all read
            </button>
          ) : undefined
        }
      />

      <div className="flex flex-wrap items-center gap-3">
        <Badge tone={unread > 0 ? "amber" : "success"}>{unread} unread</Badge>
        <Badge tone="neutral">{notifications.length} total</Badge>
      </div>

      <div className="space-y-3">
        {sorted.map((notification) => {
          const meta = TYPE_META[notification.type];
          const Icon = meta.icon;

          return (
            <button
              key={notification.id}
              onClick={() => markNotificationRead(notification.id)}
              className={`panel w-full p-5 text-left transition hover:shadow-panel ${
                notification.read ? "opacity-80" : "border-brand-200 bg-brand-50/40"
              }`}
            >
              <div className="flex items-start gap-4">
                <div className={`rounded-lg p-3 ${notification.read ? "bg-ink-50 text-ink-500" : "bg-white text-brand-700 shadow-sm"}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-bold text-ink-900">{notification.title}</p>
                    <Badge tone={meta.tone}>{notification.type}</Badge>
                    {!notification.read && <Badge tone="amber">New</Badge>}
                  </div>
                  <p className="mt-2 text-sm leading-6 text-ink-600">{notification.body}</p>
                  <p className="mt-3 text-xs font-medium text-ink-400">{formatDateTime(notification.createdAt)}</p>
                </div>
              </div>
            </button>
          );
        })}

        {sorted.length === 0 && (
          <div className="panel flex flex-col items-center gap-3 px-5 py-16 text-center">
            <Bell className="h-10 w-10 text-ink-300" />
            <p className="text-sm font-semibold text-ink-700">No notifications yet</p>
            <p className="text-sm text-ink-500">Application updates, task submissions, and payment events will appear here.</p>
          </div>
        )}
      </div>
    </div>
  );
}
