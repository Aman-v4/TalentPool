import { FileText } from "lucide-react";
import { Link } from "react-router-dom";
import { Badge } from "../../components/ui/Badge";
import { PageHeader } from "../../components/ui/PageHeader";
import { ProgressBar } from "../../components/ui/ProgressBar";
import { StatusBadge } from "../../components/ui/Status";
import { useTalentPool } from "../../state/TalentPoolContext";
import { formatDate } from "../../utils/date";

export function ConsultantTasksPage() {
  const { getConsultantTasks, getMilestonesForTask, getTaskProgress, getWorkspace } = useTalentPool();
  const tasks = getConsultantTasks();

  return (
    <div className="space-y-8">
      <PageHeader eyebrow="Delivery" title="My tasks" />

      <div className="grid gap-5 lg:grid-cols-2">
        {tasks.map((task) => {
          const workspace = getWorkspace(task.workspaceId);
          const milestones = getMilestonesForTask(task.id);
          const progress = getTaskProgress(task.id);
          return (
            <article key={task.id} className="panel p-5">
              {workspace && <Badge tone="blue">Workspace: {workspace.name}</Badge>}
              <div className="mt-3 flex items-start justify-between gap-3">
                <h2 className="text-lg font-bold text-ink-900">{task.title}</h2>
                <StatusBadge status={task.status} />
              </div>
              <div className="mt-4">
                <div className="mb-1 flex justify-between text-xs font-semibold text-ink-500">
                  <span>{milestones.length} milestones</span>
                  <span>{progress}%</span>
                </div>
                <ProgressBar value={progress} />
              </div>
              <p className="mt-3 text-xs text-ink-400">{formatDate(task.startDate)} → {formatDate(task.endDate)}</p>
              <Link
                to={`/consultant/tasks/${task.id}`}
                className="focus-ring mt-4 inline-flex items-center gap-2 rounded-lg border border-ink-200 bg-white px-3 py-1.5 text-xs font-bold text-ink-700 hover:bg-ink-50"
              >
                <FileText className="h-3.5 w-3.5" />
                View details
              </Link>
            </article>
          );
        })}
      </div>

      {tasks.length === 0 && (
        <div className="panel px-5 py-12 text-center text-sm text-ink-500">No tasks assigned yet.</div>
      )}
    </div>
  );
}
