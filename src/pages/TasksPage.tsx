import { BriefcaseBusiness, CheckCircle2, Clock3, FileText, Plus, UserCheck } from "lucide-react";
import { Link } from "react-router-dom";
import { Avatar } from "../components/ui/Avatar";
import { Badge } from "../components/ui/Badge";
import { MetricCard } from "../components/ui/MetricCard";
import { PageHeader } from "../components/ui/PageHeader";
import { ProgressBar } from "../components/ui/ProgressBar";
import { StatusBadge } from "../components/ui/Status";
import { useTalentPool } from "../state/TalentPoolContext";
import { formatCurrency, formatDate } from "../utils/date";

export function TasksPage() {
  const { getMilestonesForTask, getProfessional, getTaskProgress, getWorkspace, tasks } = useTalentPool();
  const activeTasks = tasks.filter((task) => ["Assigned", "In Progress", "Submitted", "Under Review", "Revision Requested"].includes(task.status));
  const drafts = tasks.filter((task) => task.status === "Draft");
  const unassigned = tasks.filter((task) => !task.activeAssigneeId && task.status !== "Draft");

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Task operations"
        title="Tasks"
        actions={
          <Link to="/workspaces" className="focus-ring inline-flex items-center gap-2 rounded-lg bg-ink-900 px-4 py-2 text-sm font-semibold text-white shadow-soft">
            <Plus className="h-4 w-4" />
            New Task
          </Link>
        }
      />

      <div className="grid gap-4 sm:grid-cols-4">
        <MetricCard label="Active tasks" value={String(activeTasks.length)} detail="Task-driven workspace access" icon={UserCheck} accent="brand" />
        <MetricCard label="Drafts" value={String(drafts.length)} detail="Continue later from task detail" icon={Clock3} accent="amber" />
        <MetricCard label="Unassigned" value={String(unassigned.length)} detail="Can remain pending" icon={Clock3} accent="amber" />
        <MetricCard label="Completed" value={String(tasks.filter((task) => task.status === "Completed").length)} detail="Reviews required from both parties" icon={CheckCircle2} accent="blue" />
      </div>

      <div className="grid gap-5 xl:grid-cols-2">
        {tasks.map((task) => {
          const assignee = getProfessional(task.activeAssigneeId);
          const workspace = getWorkspace(task.workspaceId);
          const milestones = getMilestonesForTask(task.id);
          const progress = getTaskProgress(task.id);

          return (
            <article key={task.id} className="panel p-5 transition hover:-translate-y-0.5 hover:shadow-panel">
              {workspace && (
                <Link
                  to={`/workspaces/${workspace.id}`}
                  className="mb-4 inline-flex items-center gap-2 rounded-lg border border-brand-200 bg-brand-50 px-3 py-1.5 text-xs font-bold text-brand-700 hover:bg-brand-100"
                >
                  <BriefcaseBusiness className="h-3.5 w-3.5" />
                  Workspace: {workspace.name}
                </Link>
              )}

              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-lg font-bold text-ink-900">{task.title}</h2>
                    <StatusBadge status={task.status} />
                  </div>
                  <p className="mt-2 text-xs text-ink-400">{formatDate(task.startDate)} → {formatDate(task.endDate)}</p>
                </div>
                <StatusBadge status={task.priority} />
              </div>

              <div className="mt-5 flex flex-col gap-4 rounded-lg border border-ink-200 p-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex min-w-0 items-center gap-3">
                  {assignee ? <Avatar initials={assignee.avatar} src={assignee.photoUrl} /> : <div className="h-10 w-10 rounded-full border border-dashed border-ink-300 bg-ink-50" />}
                  <div className="min-w-0">
                    <p className="font-semibold text-ink-900">{assignee?.name ?? "No active assignee"}</p>
                    <p className="truncate text-sm text-ink-500">{assignee?.title ?? "Awaiting professional assignment"}</p>
                  </div>
                </div>
                <Badge tone={assignee ? "brand" : "amber"}>{assignee ? "1 active assignee" : "Pending assignment"}</Badge>
              </div>

              <div className="mt-5">
                <div className="mb-2 flex justify-between text-xs font-semibold text-ink-500">
                  <span>{milestones.length} milestones</span>
                  <span>{progress}% complete</span>
                </div>
                <ProgressBar value={progress} />
              </div>

              <div className="mt-4 flex flex-wrap items-center gap-2">
                {task.budget ? <Badge tone="amber">{formatCurrency(task.budget)}</Badge> : null}
                <Badge>{task.attachmentCount} attachments</Badge>
                <Link
                  to={`/tasks/${task.id}`}
                  className="focus-ring ml-auto inline-flex items-center gap-2 rounded-lg border border-ink-200 bg-white px-3 py-1.5 text-xs font-bold text-ink-700 hover:bg-ink-50"
                >
                  <FileText className="h-3.5 w-3.5" />
                  View details
                </Link>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
