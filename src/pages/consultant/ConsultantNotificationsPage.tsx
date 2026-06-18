import { Bell } from "lucide-react";
import { Badge } from "../../components/ui/Badge";
import { PageHeader } from "../../components/ui/PageHeader";
import { useTalentPool } from "../../state/TalentPoolContext";
import type { Notification } from "../../types";
import { formatDateTime } from "../../utils/date";

export function ConsultantNotificationsPage() {
  const { consultantNotifications, markAllNotificationsRead, markNotificationRead } = useTalentPool();
  const unread = consultantNotifications.filter((n) => !n.read).length;
  const sorted = [...consultantNotifications].sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Updates"
        title="Notifications"
        actions={
          unread > 0 ? (
            <button onClick={markAllNotificationsRead} className="focus-ring rounded-lg border border-ink-200 bg-white px-4 py-2 text-sm font-semibold text-ink-700">
              Mark all read
            </button>
          ) : undefined
        }
      />

      <div className="space-y-3">
        {sorted.map((notification) => (
          <NotificationRow key={notification.id} notification={notification} onRead={() => markNotificationRead(notification.id)} />
        ))}
        {sorted.length === 0 && (
          <div className="panel flex flex-col items-center gap-3 py-16 text-center">
            <Bell className="h-10 w-10 text-ink-300" />
            <p className="text-sm text-ink-500">No notifications yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}

function NotificationRow({ notification, onRead }: { notification: Notification; onRead: () => void }) {
  return (
    <button
      onClick={onRead}
      className={`panel w-full p-5 text-left transition hover:shadow-panel ${notification.read ? "opacity-80" : "border-brand-200 bg-brand-50/40"}`}
    >
      <div className="flex flex-wrap items-center gap-2">
        <p className="font-bold text-ink-900">{notification.title}</p>
        <Badge tone="blue">{notification.type}</Badge>
        {!notification.read && <Badge tone="amber">New</Badge>}
      </div>
      <p className="mt-2 text-sm leading-6 text-ink-600">{notification.body}</p>
      <p className="mt-2 text-xs text-ink-400">{formatDateTime(notification.createdAt)}</p>
    </button>
  );
}
