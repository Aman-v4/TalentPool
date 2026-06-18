import { ArrowLeft, BriefcaseBusiness, CheckCircle2, Clock3, FileText } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { Badge } from "../../components/ui/Badge";
import { EmptyState } from "../../components/ui/EmptyState";
import { MetricCard } from "../../components/ui/MetricCard";
import { PageHeader } from "../../components/ui/PageHeader";
import { StatusBadge } from "../../components/ui/Status";
import { useTalentPool } from "../../state/TalentPoolContext";
import { formatDate } from "../../utils/date";

export function ConsultantWorkspaceDetailPage() {
  const { workspaceId } = useParams();
  const { getConsultantTasks, getConsultantWorkspaceMetrics, getWorkspace } = useTalentPool();
  const workspace = workspaceId ? getWorkspace(workspaceId) : undefined;
  const tasks = getConsultantTasks().filter((task) => task.workspaceId === workspaceId);
  const metrics = workspaceId ? getConsultantWorkspaceMetrics(workspaceId) : { openTasks: 0, closedTasks: 0, inReview: 0 };

  if (!workspace) {
    return <EmptyState icon={BriefcaseBusiness} title="Workspace not found" body="You do not have access to this workspace." />;
  }

  return (
    <div className="space-y-8">
      <Link to="/consultant/workspaces" className="inline-flex items-center gap-2 text-sm font-semibold text-ink-600 hover:text-ink-900">
        <ArrowLeft className="h-4 w-4" />
        Back to workspaces
      </Link>

      <PageHeader eyebrow="Workspace" title={workspace.name} actions={<StatusBadge status={workspace.status} />} />

      <div className="grid gap-4 sm:grid-cols-3">
        <MetricCard label="Open tasks" value={String(metrics.openTasks)} detail="Active work items" icon={Clock3} accent="amber" />
        <MetricCard label="Closed tasks" value={String(metrics.closedTasks)} detail="Completed or approved" icon={CheckCircle2} accent="blue" />
        <MetricCard label="In review" value={String(metrics.inReview)} detail="Awaiting client feedback" icon={BriefcaseBusiness} accent="brand" />
      </div>

      <section className="panel p-5">
        <p className="text-sm leading-7 text-ink-600">{workspace.description}</p>
        <p className="mt-3 text-sm font-semibold text-ink-800">Objective: {workspace.objective}</p>
        <div className="mt-3"><Badge tone="neutral">Due {formatDate(workspace.dueAt)}</Badge></div>
      </section>

      <section className="panel p-5">
        <h2 className="text-lg font-bold text-ink-900">Your tasks</h2>
        <div className="mt-4 space-y-3">
          {tasks.map((task) => (
            <Link key={task.id} to={`/consultant/tasks/${task.id}`} className="block rounded-lg border border-ink-200 p-4 transition hover:bg-ink-50">
              <div className="flex items-center justify-between gap-3">
                <p className="font-semibold text-ink-900">{task.title}</p>
                <StatusBadge status={task.status} />
              </div>
              <p className="mt-2 text-xs text-ink-400">{formatDate(task.startDate)} → {formatDate(task.endDate)}</p>
              <span className="mt-3 inline-flex items-center gap-2 text-xs font-bold text-brand-700">
                <FileText className="h-3.5 w-3.5" />
                View details
              </span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
