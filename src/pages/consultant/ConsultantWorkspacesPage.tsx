import { BriefcaseBusiness } from "lucide-react";
import { Link } from "react-router-dom";
import { Badge } from "../../components/ui/Badge";
import { PageHeader } from "../../components/ui/PageHeader";
import { useTalentPool } from "../../state/TalentPoolContext";
import { formatDate } from "../../utils/date";

export function ConsultantWorkspacesPage() {
  const { getConsultantTasks, getConsultantWorkspaces } = useTalentPool();
  const workspaces = getConsultantWorkspaces();

  return (
    <div className="space-y-8">
      <PageHeader eyebrow="Workspaces" title="Enrolled workspaces" />

      <p className="text-sm text-ink-500">Workspaces where you have been assigned a task through talent pool membership.</p>

      <div className="grid gap-5 lg:grid-cols-2">
        {workspaces.map((workspace) => {
          const tasks = getConsultantTasks().filter((task) => task.workspaceId === workspace.id);
          return (
            <Link key={workspace.id} to={`/consultant/workspaces/${workspace.id}`} className="panel block p-5 transition hover:-translate-y-0.5 hover:shadow-panel">
              <div className="flex items-start gap-3">
                <div className="rounded-lg bg-brand-50 p-3 text-brand-700">
                  <BriefcaseBusiness className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-ink-900">{workspace.name}</h2>
                  <p className="mt-1 line-clamp-2 text-sm text-ink-500">{workspace.objective}</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Badge tone="blue">{tasks.length} assigned task{tasks.length !== 1 ? "s" : ""}</Badge>
                    <Badge tone="neutral">Due {formatDate(workspace.dueAt)}</Badge>
                  </div>
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {workspaces.length === 0 && (
        <div className="panel px-5 py-12 text-center text-sm text-ink-500">
          No workspace access yet. Workspace access is granted when a client assigns you a task.
        </div>
      )}
    </div>
  );
}
