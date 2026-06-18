import { ArrowRight, BriefcaseBusiness, CircleDollarSign, Link2, Plus } from "lucide-react";
import { Link } from "react-router-dom";
import { Badge } from "../components/ui/Badge";
import { MetricCard } from "../components/ui/MetricCard";
import { PageHeader } from "../components/ui/PageHeader";
import { ProgressBar } from "../components/ui/ProgressBar";
import { StatusBadge } from "../components/ui/Status";
import { useTalentPool } from "../state/TalentPoolContext";
import { formatCurrency, formatDate } from "../utils/date";

export function WorkspacesPage() {
  const { getAssociatedPoolsForWorkspace, milestones, tasks, workspaces } = useTalentPool();
  const totalBudget = workspaces.reduce((sum, workspace) => sum + workspace.budget, 0);
  const activeWorkspaces = workspaces.filter((workspace) => workspace.status === "Active").length;
  const linkedPoolCount = new Set(
    workspaces.flatMap((workspace) => getAssociatedPoolsForWorkspace(workspace.id).map((pool) => pool.id))
  ).size;

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Execution layer"
        title="Workspaces"
        actions={
          <Link
            to="/workspaces/new"
            className="focus-ring inline-flex items-center gap-2 rounded-lg bg-ink-900 px-4 py-2 text-sm font-semibold text-white shadow-soft"
          >
            <Plus className="h-4 w-4" />
            New Workspace
          </Link>
        }
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <MetricCard label="Active workspaces" value={String(activeWorkspaces)} detail={`${workspaces.length} total execution spaces`} icon={BriefcaseBusiness} accent="brand" />
        <MetricCard label="Derived pool links" value={String(linkedPoolCount)} detail="No manual workspace-pool link action" icon={Link2} accent="blue" />
        <MetricCard label="Total budget" value={formatCurrency(totalBudget)} detail="Spending visible by workspace and task" icon={CircleDollarSign} accent="amber" />
      </div>

      <div className="grid gap-5 xl:grid-cols-2">
        {workspaces.map((workspace) => {
          const workspaceTasks = tasks.filter((task) => task.workspaceId === workspace.id);
          const workspaceMilestones = milestones.filter((milestone) =>
            workspaceTasks.some((task) => task.id === milestone.taskId)
          );
          const paidAmount = workspaceMilestones
            .filter((milestone) => milestone.paymentStatus === "Completed")
            .reduce((sum, milestone) => sum + milestone.amount, 0);
          const completedTasks = workspaceTasks.filter((task) =>
            ["Completed", "Approved"].includes(task.status)
          ).length;
          const progress = Math.round((completedTasks / Math.max(1, workspaceTasks.length)) * 100);
          const pendingReviews = workspaceTasks.filter((task) =>
            ["Submitted", "Under Review"].includes(task.status)
          ).length;

          return (
            <Link
              key={workspace.id}
              to={`/workspaces/${workspace.id}`}
              className="panel block p-5 transition hover:-translate-y-0.5 hover:border-brand-300 hover:shadow-panel"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-xl font-bold text-ink-900">{workspace.name}</h2>
                    <StatusBadge status={workspace.status} />
                  </div>
                  <p className="mt-2 line-clamp-2 text-sm leading-6 text-ink-500">{workspace.description}</p>
                </div>
                <ArrowRight className="h-5 w-5 shrink-0 text-ink-300" />
              </div>

              <div className="mt-5 grid grid-cols-3 gap-3">
                <div className="rounded-lg bg-ink-50 p-3">
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-ink-400">Tasks</p>
                  <p className="mt-1 text-lg font-bold text-ink-900">{workspaceTasks.length}</p>
                </div>
                <div className="rounded-lg bg-ink-50 p-3">
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-ink-400">Budget</p>
                  <p className="mt-1 text-lg font-bold text-ink-900">{formatCurrency(workspace.budget)}</p>
                </div>
                <div className="rounded-lg bg-ink-50 p-3">
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-ink-400">Paid</p>
                  <p className="mt-1 text-lg font-bold text-ink-900">{formatCurrency(paidAmount)}</p>
                </div>
              </div>

              <div className="mt-5">
                <div className="mb-2 flex justify-between text-xs font-semibold text-ink-500">
                  <span>{progress}% complete</span>
                  <span>Due {formatDate(workspace.dueAt)}</span>
                </div>
                <ProgressBar value={progress} />
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                {pendingReviews > 0 && <Badge tone="amber">{pendingReviews} pending review{pendingReviews !== 1 ? "s" : ""}</Badge>}
                <Badge tone="neutral">{workspaceTasks.length} task{workspaceTasks.length !== 1 ? "s" : ""}</Badge>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
