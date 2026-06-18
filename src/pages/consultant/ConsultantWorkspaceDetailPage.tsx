import { ArrowLeft, BriefcaseBusiness, FileText } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { Badge } from "../../components/ui/Badge";
import { EmptyState } from "../../components/ui/EmptyState";
import { PageHeader } from "../../components/ui/PageHeader";
import { StatusBadge } from "../../components/ui/Status";
import { useTalentPool } from "../../state/TalentPoolContext";
import { formatDate } from "../../utils/date";

export function ConsultantWorkspaceDetailPage() {
  const { workspaceId } = useParams();
  const { getConsultantTasks, getWorkspace } = useTalentPool();
  const workspace = workspaceId ? getWorkspace(workspaceId) : undefined;
  const tasks = getConsultantTasks().filter((task) => task.workspaceId === workspaceId);

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

      <section className="panel p-5">
        <p className="text-sm leading-7 text-ink-600">{workspace.description}</p>
        <p className="mt-3 text-sm font-semibold text-ink-800">Objective: {workspace.objective}</p>
        <div className="mt-3"><Badge tone="neutral">Due {formatDate(workspace.dueAt)}</Badge></div>
      </section>

      <section className="panel p-5">
        <h2 className="text-lg font-bold text-ink-900">Your tasks</h2>
        <div className="mt-4 space-y-3">
          {tasks.map((task) => (
            <div key={task.id} className="rounded-lg border border-ink-200 p-4">
              <div className="flex items-center justify-between gap-3">
                <p className="font-semibold text-ink-900">{task.title}</p>
                <StatusBadge status={task.status} />
              </div>
              <p className="mt-2 text-xs text-ink-400">{formatDate(task.startDate)} → {formatDate(task.endDate)}</p>
              <Link
                to={`/consultant/tasks/${task.id}`}
                className="focus-ring mt-3 inline-flex items-center gap-2 rounded-lg border border-ink-200 bg-white px-3 py-1.5 text-xs font-bold text-ink-700 hover:bg-ink-50"
              >
                <FileText className="h-3.5 w-3.5" />
                View details
              </Link>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
