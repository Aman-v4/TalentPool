import {
  Calendar,
  Check,
  FileCheck2,
  FileText,
  MessageSquareText,
  Play,
  Send,
  Star,
  UserRoundCheck,
} from "lucide-react";
import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ReviewSubmissionModal } from "../components/workspace/ReviewSubmissionModal";
import { ProfileSlideOver } from "../components/profile/ProfileSlideOver";
import { Avatar } from "../components/ui/Avatar";
import { Badge } from "../components/ui/Badge";
import { Breadcrumbs } from "../components/ui/Breadcrumbs";
import { EmptyState } from "../components/ui/EmptyState";
import { ProgressBar } from "../components/ui/ProgressBar";
import { StatusBadge } from "../components/ui/Status";
import { useTalentPool } from "../state/TalentPoolContext";
import type { Milestone, MilestoneStatus } from "../types";
import { formatCurrency, formatDate, formatDateTime } from "../utils/date";

const MILESTONE_FLOW: MilestoneStatus[] = [
  "Planned",
  "Start Requested",
  "In Progress",
  "Submitted",
  "Under Review",
  "Completed",
];

export function TaskDetailsPage() {
  const { taskId } = useParams();
  const {
    approveMilestoneCompletion,
    approveMilestoneStart,
    clientProfile,
    getMilestonesForTask,
    getPool,
    getProfessional,
    getSubmissionForMilestone,
    getSubmissionForTask,
    getTask,
    getTaskProgress,
    getWorkspace,
    releasePaymentForTask,
    requestMilestoneRework,
    requestMilestoneStart,
    requestTaskRework,
    reviews,
    submitMilestoneWork,
    taskMessages,
  } = useTalentPool();
  const task = taskId ? getTask(taskId) : undefined;
  const [reviewMilestone, setReviewMilestone] = useState<Milestone | null>(null);
  const [reviewTaskSubmission, setReviewTaskSubmission] = useState(false);
  const [profilePreviewOpen, setProfilePreviewOpen] = useState(false);

  if (!task) {
    return <EmptyState icon={FileCheck2} title="Task not found" body="The selected task is not available in this prototype data set." />;
  }

  const assignee = getProfessional(task.activeAssigneeId);
  const workspace = getWorkspace(task.workspaceId);
  const pool = task.poolId ? getPool(task.poolId) : undefined;
  const milestones = getMilestonesForTask(task.id);
  const messages = taskMessages.filter((message) => message.taskId === task.id);
  const taskReviews = reviews.filter((review) => review.taskId === task.id);
  const progress = getTaskProgress(task.id);
  const isDraft = task.status === "Draft";
  const isTaskReviewable = ["Submitted", "Under Review"].includes(task.status);
  const totalAmount = task.budget ?? milestones.reduce((sum, milestone) => sum + milestone.amount, 0);

  const milestoneReviewContext = reviewMilestone
    ? (() => {
        const submission = getSubmissionForMilestone(reviewMilestone.id);
        const professional = getProfessional(task.activeAssigneeId);
        if (!submission || !professional) return null;
        return {
          milestone: reviewMilestone,
          submission,
          professional,
          amount: reviewMilestone.amount,
          lineItemDescription: `${reviewMilestone.title} — ${reviewMilestone.description}`,
        };
      })()
    : null;

  const taskReviewContext = reviewTaskSubmission
    ? (() => {
        const submission = getSubmissionForTask(task.id);
        const professional = getProfessional(task.activeAssigneeId);
        if (!submission || !professional) return null;
        return {
          submission,
          professional,
          amount: task.budget ?? 0,
          lineItemDescription: `${task.title} — approved deliverables`,
        };
      })()
    : null;

  return (
    <>
      <div className="space-y-6">
        <Breadcrumbs
          items={[
            { label: workspace?.name ?? "Workspaces", href: workspace ? `/workspaces/${workspace.id}` : "/workspaces" },
            { label: task.title },
          ]}
        />

        {isDraft && workspace && (
          <div className="rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4">
            <p className="text-sm font-bold text-amber-800">This task is saved as a draft</p>
            <Link
              to={`/workspaces/${workspace.id}/tasks/${task.id}/edit`}
              className="mt-1 inline-block text-sm font-semibold text-amber-700 hover:underline"
            >
              Continue editing
            </Link>
          </div>
        )}

        <section className="panel p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="min-w-0">
              <h1 className="text-2xl font-bold text-ink-900 md:text-3xl">{task.title}</h1>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <StatusBadge status={task.status} />
                {!isDraft && <Badge tone={task.priority === "High" || task.priority === "Urgent" ? "coral" : "amber"}>{task.priority} priority</Badge>}
                <span className="inline-flex items-center gap-1 text-sm text-ink-500">
                  <Calendar className="h-4 w-4" />
                  Due {formatDate(task.deadline)}
                </span>
              </div>
              <p className="mt-4 max-w-3xl text-sm leading-7 text-ink-500">{task.description}</p>
            </div>
            {isTaskReviewable && (
              <button
                onClick={() => setReviewTaskSubmission(true)}
                className="btn-outline shrink-0 border-amber-200 bg-amber-50 text-amber-700"
              >
                <Check className="h-4 w-4" />
                Review Submission
              </button>
            )}
          </div>
        </section>

        <div className="grid gap-6 xl:grid-cols-[1fr_320px]">
          <div className="space-y-6">
            <section className="panel p-5">
              <h2 className="text-lg font-bold text-ink-900">Status lifecycle</h2>
              <div className="mt-4 flex flex-wrap items-center gap-2 text-sm text-ink-500">
                {["Pending", "Assigned", "In Progress", "Submitted", "Under Review", "Approved", "Completed"].map((step, index, arr) => (
                  <span key={step} className="flex items-center gap-2">
                    <span className={task.status === step || (step === "In Progress" && task.status === "In Progress") ? "font-bold text-brand-600" : ""}>{step}</span>
                    {index < arr.length - 1 && <span>→</span>}
                  </span>
                ))}
              </div>
              <div className="mt-5">
                <div className="mb-2 flex justify-between text-xs font-semibold text-ink-500">
                  <span>Milestone completion</span>
                  <span>{progress}%</span>
                </div>
                <ProgressBar value={progress} />
              </div>
            </section>

            <section className="panel p-5">
              <h2 className="text-lg font-bold text-ink-900">Assignment history</h2>
              <div className="mt-4 space-y-3">
                {task.assignmentHistory.map((history) => {
                  const professional = getProfessional(history.professionalId);
                  return (
                    <div key={history.id} className="flex items-start gap-3 rounded-2xl border border-ink-100 bg-ink-50/60 p-4">
                      <UserRoundCheck className="mt-0.5 h-4 w-4 text-brand-600" />
                      <div>
                        <p className="font-semibold text-ink-900">{professional?.name ?? "Unassigned placeholder"} was assigned</p>
                        <p className="mt-1 text-sm text-ink-500">{formatDate(history.assignedAt)}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

            <section className="panel p-5">
              <div className="flex items-center gap-2">
                <FileCheck2 className="h-5 w-5 text-brand-600" />
                <h2 className="text-lg font-bold text-ink-900">Milestones</h2>
              </div>
              <p className="mt-1 text-sm text-ink-500">
                Consultant requests start → you approve and release payment → consultant submits work → you review and close the milestone.
              </p>
              <div className="mt-5 space-y-4">
                {milestones.map((milestone) => (
                  <MilestoneCard
                    key={milestone.id}
                    taskId={task.id}
                    milestone={milestone}
                    onRequestStart={() => requestMilestoneStart(milestone.id)}
                    onApproveStart={() => approveMilestoneStart(milestone.id)}
                    onSubmitWork={() => submitMilestoneWork(milestone.id)}
                    onReview={() => setReviewMilestone(milestone)}
                  />
                ))}
                {milestones.length === 0 && (
                  <p className="rounded-lg bg-ink-50 p-4 text-sm text-ink-500">This task has no milestones.</p>
                )}
              </div>
            </section>

            <section className="panel p-5">
              <div className="flex items-center gap-2">
                <MessageSquareText className="h-5 w-5 text-sky-700" />
                <h2 className="text-lg font-bold text-ink-900">Task communication</h2>
              </div>
              <div className="mt-5 space-y-3">
                {messages.map((message) => (
                  <div key={message.id} className="rounded-lg border border-ink-200 p-4">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <p className="font-semibold text-ink-900">{message.authorName}</p>
                      <Badge>{message.authorRole}</Badge>
                    </div>
                    <p className="mt-2 text-sm leading-6 text-ink-600">{message.body}</p>
                    <p className="mt-3 text-xs font-semibold text-ink-400">{formatDateTime(message.createdAt)}</p>
                  </div>
                ))}
              </div>
            </section>
          </div>

          <aside className="space-y-5">
            <section className="panel p-5">
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-ink-400">Assigned professional</p>
              {assignee ? (
                <div className="mt-4 rounded-2xl border border-ink-100 bg-ink-50/60 p-4">
                  <div className="flex items-center gap-3">
                    <Avatar initials={assignee.avatar} src={assignee.photoUrl} size="lg" />
                    <div>
                      <p className="font-bold text-ink-900">{assignee.name}</p>
                      <p className="text-sm text-ink-500">{assignee.title}</p>
                    </div>
                  </div>
                  <button type="button" className="btn-outline mt-4 w-full" onClick={() => setProfilePreviewOpen(true)}>
                    View Profile
                  </button>
                </div>
              ) : (
                <p className="mt-4 text-sm text-ink-500">No freelancer assigned yet.</p>
              )}
            </section>

            <section className="panel p-5">
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-ink-400">Task details</p>
              <dl className="mt-4 space-y-3 text-sm">
                <div className="flex justify-between gap-4">
                  <dt className="text-ink-500">Workspace</dt>
                  <dd className="font-semibold text-ink-900">{workspace?.name ?? "—"}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-ink-500">Priority</dt>
                  <dd className="font-semibold text-ink-900">{task.priority}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-ink-500">Deadline</dt>
                  <dd className="font-semibold text-ink-900">{formatDate(task.deadline)}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-ink-500">Schedule</dt>
                  <dd className="text-right font-semibold text-ink-900">{formatDate(task.startDate)} → {formatDate(task.endDate)}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-ink-500">Total amount</dt>
                  <dd className="font-semibold text-ink-900">{formatCurrency(totalAmount)}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-ink-500">Talent pool</dt>
                  <dd className="font-semibold text-ink-900">{pool?.name ?? "Not assigned"}</dd>
                </div>
              </dl>
            </section>

            <section className="panel p-5">
              <div className="flex items-center gap-2">
                <Star className="h-5 w-5 text-amber-500" />
                <h2 className="text-lg font-bold text-ink-900">Reviews</h2>
              </div>
              <div className="mt-5 space-y-3">
                {taskReviews.length > 0 ? (
                  taskReviews.map((review) => (
                    <div key={review.id} className="rounded-lg border border-ink-200 p-4">
                      <div className="flex justify-between gap-3">
                        <Badge>{review.reviewerType}</Badge>
                        <span className="text-sm font-bold text-ink-900">{review.rating.toFixed(1)}</span>
                      </div>
                      <p className="mt-3 text-sm leading-6 text-ink-600">{review.summary}</p>
                    </div>
                  ))
                ) : (
                  <p className="rounded-lg bg-ink-50 p-4 text-sm leading-6 text-ink-600">Two-way reviews become mandatory when the task is completed.</p>
                )}
              </div>
            </section>
          </aside>
        </div>
      </div>

      {milestoneReviewContext && workspace && (
        <ReviewSubmissionModal
          task={task}
          milestone={milestoneReviewContext.milestone}
          submission={milestoneReviewContext.submission}
          professional={milestoneReviewContext.professional}
          client={clientProfile}
          workspaceName={workspace.name}
          amount={milestoneReviewContext.amount}
          lineItemDescription={milestoneReviewContext.lineItemDescription}
          onClose={() => setReviewMilestone(null)}
          onRework={(notes) => {
            requestMilestoneRework(milestoneReviewContext.milestone.id, notes);
            setReviewMilestone(null);
          }}
          onApprove={() => approveMilestoneCompletion(milestoneReviewContext.milestone.id)}
          paymentOnApproval={false}
        />
      )}

      {taskReviewContext && workspace && (
        <ReviewSubmissionModal
          task={task}
          submission={taskReviewContext.submission}
          professional={taskReviewContext.professional}
          client={clientProfile}
          workspaceName={workspace.name}
          amount={taskReviewContext.amount}
          lineItemDescription={taskReviewContext.lineItemDescription}
          onClose={() => setReviewTaskSubmission(false)}
          onRework={(notes) => {
            requestTaskRework(task.id, notes);
            setReviewTaskSubmission(false);
          }}
          onApprove={() => releasePaymentForTask(task.id)}
          paymentOnApproval
        />
      )}

      {profilePreviewOpen && assignee && (
        <ProfileSlideOver professional={assignee} onClose={() => setProfilePreviewOpen(false)} />
      )}
    </>
  );
}

function MilestoneCard({
  taskId,
  milestone,
  onRequestStart,
  onApproveStart,
  onSubmitWork,
  onReview,
}: {
  taskId: string;
  milestone: Milestone;
  onRequestStart: () => void;
  onApproveStart: () => void;
  onSubmitWork: () => void;
  onReview: () => void;
}) {
  const isReviewable = ["Submitted", "Under Review"].includes(milestone.status);
  const flowIndex = MILESTONE_FLOW.indexOf(milestone.status);

  return (
    <div className={`rounded-2xl border p-4 ${isReviewable ? "border-amber-200 bg-amber-50/40" : "border-ink-100"}`}>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <p className="font-bold text-ink-900">{milestone.title}</p>
          <p className="mt-1 text-xs text-ink-400">{formatDate(milestone.startDate)} → {formatDate(milestone.endDate)} · {formatCurrency(milestone.amount)}</p>
          {milestone.reworkNotes && (
            <div className="mt-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2">
              <p className="text-xs font-semibold text-amber-700">Rework notes</p>
              <p className="mt-1 line-clamp-2 text-xs leading-5 text-amber-800">{milestone.reworkNotes}</p>
            </div>
          )}
        </div>
        <div className="flex flex-shrink-0 flex-wrap gap-2">
          <StatusBadge status={milestone.status} />
          <Badge tone={milestone.paymentStatus === "Completed" ? "success" : "neutral"}>{milestone.paymentStatus}</Badge>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-1">
        {MILESTONE_FLOW.map((step, index) => (
          <div
            key={step}
            className={`h-1.5 flex-1 rounded-full ${index <= flowIndex ? "bg-brand-500" : "bg-ink-100"}`}
            title={step}
          />
        ))}
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <Link
          to={`/tasks/${taskId}/milestones/${milestone.id}`}
          className="focus-ring inline-flex items-center gap-2 rounded-full border border-ink-200 bg-white px-3 py-1.5 text-xs font-bold text-ink-700 hover:bg-ink-50"
        >
          <FileText className="h-3.5 w-3.5" />
          View details
        </Link>
        {milestone.status === "Planned" && (
          <ActionButton icon={Send} label="Simulate: Consultant requests start" onClick={onRequestStart} tone="brand" />
        )}
        {milestone.status === "Start Requested" && (
          <ActionButton icon={Play} label="Approve start & release payment" onClick={onApproveStart} tone="success" />
        )}
        {(milestone.status === "In Progress" || milestone.status === "Revision Requested") && (
          <ActionButton icon={Send} label="Simulate: Consultant submits work" onClick={onSubmitWork} tone="brand" />
        )}
        {isReviewable && (
          <ActionButton icon={Check} label="Review submission" onClick={onReview} tone="amber" />
        )}
        {milestone.status === "Completed" && (
          <Badge tone="success">Milestone closed</Badge>
        )}
      </div>
    </div>
  );
}

function ActionButton({
  icon: Icon,
  label,
  onClick,
  tone,
}: {
  icon: typeof Check;
  label: string;
  onClick: () => void;
  tone: "brand" | "success" | "amber";
}) {
  const styles = {
    brand: "border-brand-300 bg-brand-50 text-brand-700 hover:bg-brand-100",
    success: "border-emerald-300 bg-emerald-50 text-emerald-700 hover:bg-emerald-100",
    amber: "border-amber-300 bg-amber-50 text-amber-700 hover:bg-amber-100",
  };
  return (
    <button onClick={onClick} className={`focus-ring inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-bold ${styles[tone]}`}>
      <Icon className="h-3.5 w-3.5" />
      {label}
    </button>
  );
}
