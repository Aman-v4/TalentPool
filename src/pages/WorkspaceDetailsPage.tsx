import {
  Archive,
  BriefcaseBusiness,
  Calendar,
  Check,
  ChevronRight,
  CircleDollarSign,
  Clock3,
  Info,
  Link2,
  MessageSquareText,
  Plus,
  Users,
} from "lucide-react";
import { useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ReviewSubmissionModal } from "../components/workspace/ReviewSubmissionModal";
import { Avatar } from "../components/ui/Avatar";
import { Badge } from "../components/ui/Badge";
import { Breadcrumbs } from "../components/ui/Breadcrumbs";
import { EmptyState } from "../components/ui/EmptyState";
import { MetricCard } from "../components/ui/MetricCard";
import { PillTabs } from "../components/ui/PillTabs";
import { ProgressBar } from "../components/ui/ProgressBar";
import { StatusBadge } from "../components/ui/Status";
import { useTalentPool } from "../state/TalentPoolContext";
import type { Milestone, Task, TaskStatus } from "../types";
import { formatCurrency, formatDate, formatDateTime } from "../utils/date";

type ReviewTarget =
  | { type: "task"; task: Task }
  | { type: "milestone"; task: Task; milestone: Milestone };

type WorkspaceTab = "overview" | "team" | "tasks" | "activity" | "payments";

const WORKSPACE_TABS: Array<{ id: WorkspaceTab; label: string }> = [
  { id: "overview", label: "Overview" },
  { id: "team", label: "Team" },
  { id: "tasks", label: "Tasks" },
  { id: "activity", label: "Recent Activity" },
  { id: "payments", label: "Payments" },
];

const TASK_STATUS_ORDER: TaskStatus[] = [
  "Draft", "Pending", "Assigned", "In Progress", "Submitted", "Under Review", "Revision Requested", "Approved", "Completed", "Cancelled",
];

export function WorkspaceDetailsPage() {
  const { workspaceId } = useParams();
  const {
    approveMilestoneCompletion,
    clientProfile,
    getAssociatedPoolsForWorkspace,
    getInvestedAmountForWorkspace,
    getMilestone,
    getMilestonesForTask,
    getProfessional,
    getSubmissionForMilestone,
    getSubmissionForTask,
    getWorkspace,
    milestones,
    paymentRecords,
    releasePaymentForTask,
    requestMilestoneRework,
    requestTaskRework,
    taskMessages,
    tasks,
  } = useTalentPool();

  const workspace = workspaceId ? getWorkspace(workspaceId) : undefined;
  const [activeTab, setActiveTab] = useState<WorkspaceTab>("overview");
  const [reviewTarget, setReviewTarget] = useState<ReviewTarget | null>(null);

  const workspaceTasks = workspace ? tasks.filter((task) => task.workspaceId === workspace.id) : [];
  const teamMembers = useMemo(() => {
    const ids = new Set(workspaceTasks.map((task) => task.activeAssigneeId).filter(Boolean) as string[]);
    return [...ids].map((id) => getProfessional(id)).filter(Boolean);
  }, [getProfessional, workspaceTasks]);

  if (!workspace) {
    return <EmptyState icon={BriefcaseBusiness} title="Workspace not found" body="The selected workspace is not available in this prototype data set." />;
  }

  const associatedPools = getAssociatedPoolsForWorkspace(workspace.id);
  const workspaceMilestones = milestones.filter((milestone) => workspaceTasks.some((task) => task.id === milestone.taskId));
  const paidAmount = getInvestedAmountForWorkspace(workspace.id);
  const workspacePayments = paymentRecords.filter((record) => record.workspaceId === workspace.id);
  const completedTasks = workspaceTasks.filter((task) => ["Completed", "Approved"].includes(task.status)).length;
  const progress = Math.round((completedTasks / Math.max(1, workspaceTasks.length)) * 100);
  const pendingReviews = workspaceTasks.filter((task) => ["Submitted", "Under Review"].includes(task.status)).length;
  const upcomingMilestonePay = workspaceMilestones
    .filter((milestone) => milestone.paymentStatus !== "Completed")
    .reduce((sum, milestone) => sum + milestone.amount, 0);

  const statusBreakdown = TASK_STATUS_ORDER.map((status) => ({
    status,
    count: workspaceTasks.filter((task) => task.status === status).length,
  })).filter((item) => item.count > 0);

  const workspaceMessages = taskMessages
    .filter((message) => workspaceTasks.some((task) => task.id === message.taskId))
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  const reviewContext = reviewTarget
    ? (() => {
        const task = reviewTarget.task;
        const milestone = reviewTarget.type === "milestone" ? reviewTarget.milestone : undefined;
        const submission = milestone ? getSubmissionForMilestone(milestone.id) : getSubmissionForTask(task.id);
        const professional = getProfessional(task.activeAssigneeId);
        if (!submission || !professional) return null;
        const amount = milestone?.amount ?? task.budget ?? 0;
        return {
          task,
          milestone,
          submission,
          professional,
          amount,
          lineItemDescription: milestone ? `${milestone.title} — ${milestone.description}` : `${task.title} — approved deliverables`,
        };
      })()
    : null;

  return (
    <div className="space-y-6">
      <Breadcrumbs items={[{ label: "Workspaces", href: "/workspaces" }, { label: workspace.name }]} />

      <section className="panel p-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex min-w-0 gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-3xl bg-ink-900 text-white shadow-soft">
              <BriefcaseBusiness className="h-6 w-6" />
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-2xl font-bold text-ink-900 md:text-3xl">{workspace.name}</h1>
                <StatusBadge status={workspace.status} />
              </div>
              <p className="mt-1 text-sm text-ink-500">Created {formatDate(workspace.createdAt)}</p>
              <p className="mt-3 max-w-3xl text-sm leading-7 text-ink-500">{workspace.description}</p>
            </div>
          </div>
          <Link to={`/workspaces/${workspace.id}/tasks/new`} className="btn-primary shrink-0">
            <Plus className="h-4 w-4" />
            Create Task
          </Link>
        </div>
        <div className="mt-5 flex items-start gap-3 rounded-2xl bg-blue-50 px-4 py-3 text-sm leading-6 text-ink-700">
          <Info className="mt-0.5 h-4 w-4 shrink-0 text-blue-600" />
          <p><span className="font-bold text-ink-900">Objective:</span> {workspace.objective}</p>
        </div>
      </section>

      {pendingReviews > 0 && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-5 py-4">
          <p className="text-sm font-bold text-amber-800">{pendingReviews} submission{pendingReviews !== 1 ? "s" : ""} awaiting your review</p>
          <button
            onClick={() => setActiveTab("tasks")}
            className="mt-1 text-sm font-semibold text-amber-700 hover:underline"
          >
            Go to Tasks tab to review
          </button>
        </div>
      )}

      <PillTabs
        tabs={WORKSPACE_TABS.map((tab) => ({
          id: tab.id,
          label: tab.label,
          count: tab.id === "tasks" ? workspaceTasks.length : undefined,
        }))}
        active={activeTab}
        onChange={setActiveTab}
      />

      {activeTab === "overview" && (
        <section className="panel p-5">
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <MetricCard label="Tasks" value={String(workspaceTasks.length)} detail={`${completedTasks} completed`} icon={BriefcaseBusiness} accent="brand" />
            <MetricCard label="Amount invested" value={formatCurrency(paidAmount)} detail="Completed payments" icon={CircleDollarSign} accent="amber" />
            <MetricCard label="Team" value={String(teamMembers.length)} detail="Active assignees" icon={Users} accent="blue" />
            <MetricCard label="Pending reviews" value={String(pendingReviews)} detail={`${formatCurrency(upcomingMilestonePay)} upcoming`} icon={Clock3} accent="coral" />
          </div>
          <h2 className="mt-6 text-lg font-bold text-ink-900">Overview</h2>
          <p className="mt-2 text-sm leading-6 text-ink-600">{workspace.description}</p>
          <div className="mt-5 grid gap-4 lg:grid-cols-2">
            <div className="rounded-lg border border-ink-200 p-4">
              <p className="text-sm font-bold text-ink-900">Objective</p>
              <p className="mt-2 text-sm leading-6 text-ink-600">{workspace.objective}</p>
            </div>
            <div className="rounded-lg border border-ink-200 bg-ink-50 p-4">
              <div className="grid gap-3 sm:grid-cols-2">
                <Meta icon={Calendar} label="Created" value={formatDate(workspace.createdAt)} />
                <Meta icon={Calendar} label="Due" value={formatDate(workspace.dueAt)} />
                {workspace.category && <Meta icon={BriefcaseBusiness} label="Category" value={workspace.category} />}
                <Meta icon={CircleDollarSign} label="Remaining" value={formatCurrency(Math.max(0, workspace.budget - paidAmount))} />
              </div>
            </div>
          </div>
          <div className="mt-5">
            <div className="mb-2 flex justify-between text-xs font-semibold text-ink-500">
              <span>Overall progress</span>
              <span>{progress}%</span>
            </div>
            <ProgressBar value={progress} />
          </div>

          {statusBreakdown.length > 0 && (
            <div className="mt-6">
              <p className="text-sm font-bold text-ink-900">Task status breakdown</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {statusBreakdown.map(({ status, count }) => (
                  <div key={status} className="flex items-center gap-2 rounded-lg border border-ink-200 bg-ink-50 px-3 py-2">
                    <StatusBadge status={status} />
                    <span className="text-sm font-bold text-ink-900">{count}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="mt-6 rounded-lg border border-ink-200 p-4">
            <div className="flex items-center gap-2">
              <Link2 className="h-5 w-5 text-brand-600" />
              <h3 className="font-bold text-ink-900">Associated Talent Pools</h3>
            </div>
            <p className="mt-2 text-sm leading-6 text-ink-500">Derived from active assignees on tasks in this workspace.</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {associatedPools.length > 0 ? (
                associatedPools.map((pool) => (
                  <Link key={pool.id} to={`/talent-pools/${pool.id}`} className="rounded-lg border border-brand-200 bg-brand-50 px-3 py-2 text-sm font-semibold text-brand-700 hover:bg-brand-100">
                    {pool.name}
                  </Link>
                ))
              ) : (
                <Badge>None yet</Badge>
              )}
            </div>
          </div>

          <div className="mt-5 rounded-lg border border-coral-200 bg-coral-50/50 p-4">
            <div className="flex items-center gap-2 text-sm font-semibold text-coral-600">
              <Archive className="h-4 w-4" />
              Archive rule
            </div>
            <p className="mt-2 text-sm leading-6 text-ink-600">Open tasks and active milestones must be closed or cancelled before a workspace can be archived.</p>
          </div>
        </section>
      )}

      {activeTab === "team" && (
        <section className="panel p-5">
          <h2 className="text-lg font-bold text-ink-900">Team</h2>
          <p className="mt-1 text-sm text-ink-500">Professionals with active task access derived from assignments.</p>
          {teamMembers.length > 0 ? (
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {teamMembers.map((member) => {
                if (!member) return null;
                const memberTasks = workspaceTasks.filter((task) => task.activeAssigneeId === member.id);
                return (
                  <Link key={member.id} to={`/professionals/${member.id}`} className="flex items-center gap-3 rounded-lg border border-ink-200 p-4 transition hover:border-brand-300 hover:bg-brand-50">
                    <Avatar initials={member.avatar} src={member.photoUrl} />
                    <div className="min-w-0">
                      <p className="font-bold text-ink-900">{member.name}</p>
                      <p className="text-sm text-ink-500">{member.title}</p>
                      <p className="mt-1 text-xs text-ink-400">{memberTasks.length} task{memberTasks.length !== 1 ? "s" : ""} · {member.availability}</p>
                    </div>
                  </Link>
                );
              })}
            </div>
          ) : (
            <p className="mt-6 text-sm text-ink-500">No team members yet. Assign professionals to tasks to grant workspace access.</p>
          )}
        </section>
      )}

      {activeTab === "tasks" && (
        <section className="panel overflow-hidden p-0">
          <div className="divide-y divide-ink-100">
            {workspaceTasks.map((task) => {
              const assignee = getProfessional(task.activeAssigneeId);
              const taskMilestones = getMilestonesForTask(task.id);
              const isReviewable = ["Submitted", "Under Review"].includes(task.status);

              return (
                <div key={task.id} className="px-5 py-4">
                  <Link to={`/tasks/${task.id}`} className="flex flex-wrap items-center gap-4 transition hover:opacity-90">
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-ink-900">{task.title}</p>
                      <div className="mt-2 flex flex-wrap items-center gap-2">
                        <Badge tone={task.priority === "High" || task.priority === "Urgent" ? "coral" : "amber"}>{task.priority}</Badge>
                        <span className="inline-flex items-center gap-1 text-xs text-ink-500">
                          <Clock3 className="h-3.5 w-3.5" />
                          Due {formatDate(task.deadline)}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {assignee && <Avatar initials={assignee.avatar} src={assignee.photoUrl} size="sm" />}
                      <span className="hidden text-sm text-ink-600 sm:inline">{assignee?.name ?? "Unassigned"}</span>
                    </div>
                    <StatusBadge status={task.status} />
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-ink-100 text-ink-500">
                      <ChevronRight className="h-4 w-4" />
                    </div>
                  </Link>

                  {isReviewable && (
                    <button
                      onClick={() => setReviewTarget({ type: "task", task })}
                      className="focus-ring mt-3 inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-3 py-1.5 text-xs font-bold text-amber-700"
                    >
                      <Check className="h-3.5 w-3.5" />
                      Review Submission
                    </button>
                  )}
                  {taskMilestones
                    .filter((milestone) => ["Submitted", "Under Review"].includes(milestone.status))
                    .map((milestone) => (
                      <button
                        key={milestone.id}
                        onClick={() => setReviewTarget({ type: "milestone", task, milestone })}
                        className="focus-ring mt-2 inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-3 py-1.5 text-xs font-bold text-amber-700"
                      >
                        <Check className="h-3.5 w-3.5" />
                        Review: {milestone.title}
                      </button>
                    ))}
                </div>
              );
            })}
            {workspaceTasks.length === 0 && (
              <Link
                to={`/workspaces/${workspace.id}/tasks/new`}
                className="block px-5 py-12 text-center text-sm text-ink-500 hover:bg-ink-50/50"
              >
                No tasks yet. Click <span className="font-semibold text-brand-600">Create Task</span> to add the first one.
              </Link>
            )}
          </div>
        </section>
      )}

      {activeTab === "activity" && (
        <section className="panel p-5">
          <div className="flex items-center gap-2">
            <MessageSquareText className="h-5 w-5 text-sky-700" />
            <h2 className="text-lg font-bold text-ink-900">Recent activity</h2>
          </div>
          {workspaceMessages.length > 0 ? (
            <div className="mt-4 space-y-3">
              {workspaceMessages.map((message) => (
                <div key={message.id} className="rounded-lg border border-ink-200 p-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="text-sm font-semibold text-ink-900">{message.authorName}</p>
                    <Badge>{message.authorRole}</Badge>
                  </div>
                  <p className="mt-1 text-sm leading-6 text-ink-600">{message.body}</p>
                  <p className="mt-2 text-xs text-ink-400">{formatDateTime(message.createdAt)}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="mt-6 text-sm text-ink-500">No recent messages on tasks in this workspace.</p>
          )}
        </section>
      )}

      {activeTab === "payments" && (
        <section className="panel p-5">
          <div className="flex items-center gap-2">
            <CircleDollarSign className="h-5 w-5 text-amber-500" />
            <h2 className="text-lg font-bold text-ink-900">Payments</h2>
          </div>
          <div className="mt-5 grid gap-4 sm:grid-cols-3">
            <div className="rounded-lg border border-ink-200 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-ink-400">Budget</p>
              <p className="mt-1 text-xl font-bold text-ink-900">{formatCurrency(workspace.budget)}</p>
            </div>
            <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-emerald-700">Paid</p>
              <p className="mt-1 text-xl font-bold text-emerald-700">{formatCurrency(paidAmount)}</p>
            </div>
            <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-amber-700">Upcoming</p>
              <p className="mt-1 text-xl font-bold text-amber-700">{formatCurrency(upcomingMilestonePay)}</p>
            </div>
          </div>

          {workspacePayments.length > 0 ? (
            <div className="mt-6 space-y-3">
              {workspacePayments.map((record) => (
                <div key={record.id} className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-ink-200 p-4">
                  <div className="min-w-0">
                    <p className="font-semibold text-ink-900">{record.taskTitle}</p>
                    {record.milestoneTitle && <p className="text-sm text-ink-500">{record.milestoneTitle}</p>}
                    <p className="mt-1 text-xs text-ink-400">{record.invoiceNumber}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-ink-900">{formatCurrency(record.amount)}</span>
                    <Badge tone={record.status === "Completed" ? "success" : "amber"}>{record.status}</Badge>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="mt-6 text-sm text-ink-500">No payment records for this workspace yet.</p>
          )}

          <Link to="/payments" className="focus-ring mt-6 inline-flex items-center justify-center rounded-lg border border-ink-200 bg-white px-4 py-2 text-sm font-semibold text-ink-700 hover:bg-ink-50">
            View all payments
          </Link>
        </section>
      )}

      {reviewContext && (
        <ReviewSubmissionModal
          task={reviewContext.task}
          milestone={reviewContext.milestone}
          submission={reviewContext.submission}
          professional={reviewContext.professional}
          client={clientProfile}
          workspaceName={workspace.name}
          amount={reviewContext.amount}
          lineItemDescription={reviewContext.lineItemDescription}
          onClose={() => setReviewTarget(null)}
          onRework={(notes) => {
            if (reviewTarget?.type === "milestone") requestMilestoneRework(reviewTarget.milestone.id, notes);
            else if (reviewTarget?.type === "task") requestTaskRework(reviewTarget.task.id, notes);
            setReviewTarget(null);
          }}
          onApprove={() => {
            if (reviewTarget?.type === "milestone") approveMilestoneCompletion(reviewTarget.milestone.id);
            else if (reviewTarget?.type === "task") releasePaymentForTask(reviewTarget.task.id);
          }}
          paymentOnApproval={reviewTarget?.type === "task"}
        />
      )}
    </div>
  );
}

function Meta({ icon: Icon, label, value }: { icon: typeof Calendar; label: string; value: string }) {
  return (
    <div>
      <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.12em] text-ink-400">
        <Icon className="h-3.5 w-3.5" />
        {label}
      </div>
      <p className="mt-1 text-sm font-bold text-ink-900">{value}</p>
    </div>
  );
}
