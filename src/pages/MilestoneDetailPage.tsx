import {
  ArrowLeft,
  Calendar,
  Check,
  CircleDollarSign,
  ExternalLink,
  FileText,
  Play,
  Send,
} from "lucide-react";
import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ReviewSubmissionModal } from "../components/workspace/ReviewSubmissionModal";
import { Badge } from "../components/ui/Badge";
import { EmptyState } from "../components/ui/EmptyState";
import { PageHeader } from "../components/ui/PageHeader";
import { StatusBadge } from "../components/ui/Status";
import { useTalentPool } from "../state/TalentPoolContext";
import type { MilestoneStatus } from "../types";
import { formatCurrency, formatDate, formatDateTime } from "../utils/date";

const MILESTONE_FLOW: MilestoneStatus[] = [
  "Planned",
  "Start Requested",
  "In Progress",
  "Submitted",
  "Under Review",
  "Completed",
];

export function MilestoneDetailPage() {
  const { taskId, milestoneId } = useParams();
  const {
    approveMilestoneCompletion,
    approveMilestoneStart,
    clientProfile,
    getMilestone,
    getProfessional,
    getSubmissionForMilestone,
    getTask,
    getWorkspace,
    requestMilestoneRework,
    requestMilestoneStart,
    submitMilestoneWork,
  } = useTalentPool();
  const [showReview, setShowReview] = useState(false);

  const task = taskId ? getTask(taskId) : undefined;
  const milestone = milestoneId ? getMilestone(milestoneId) : undefined;

  if (!task || !milestone || milestone.taskId !== task.id) {
    return <EmptyState icon={FileText} title="Milestone not found" body="The selected milestone is not available." />;
  }

  const workspace = getWorkspace(task.workspaceId);
  const assignee = getProfessional(task.activeAssigneeId);
  const submission = getSubmissionForMilestone(milestone.id);
  const flowIndex = MILESTONE_FLOW.indexOf(milestone.status);
  const isReviewable = ["Submitted", "Under Review"].includes(milestone.status);

  const reviewContext =
    showReview && submission && assignee
      ? {
          submission,
          professional: assignee,
          amount: milestone.amount,
          lineItemDescription: `${milestone.title} — ${milestone.description}`,
        }
      : null;

  return (
    <>
      <div className="space-y-8">
        <Link
          to={`/tasks/${task.id}`}
          className="inline-flex items-center gap-2 text-sm font-semibold text-ink-600 hover:text-ink-900"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to {task.title}
        </Link>

        <PageHeader
          eyebrow="Milestone"
          title={milestone.title}
          actions={
            <>
              <StatusBadge status={milestone.status} />
              <Badge tone={milestone.paymentStatus === "Completed" ? "success" : "neutral"}>{milestone.paymentStatus}</Badge>
            </>
          }
        />

        {workspace && (
          <p className="text-sm text-ink-500">
            Workspace: <Link to={`/workspaces/${workspace.id}`} className="font-semibold text-brand-700 hover:underline">{workspace.name}</Link>
          </p>
        )}

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <MetaCard icon={Calendar} label="Schedule" value={`${formatDate(milestone.startDate)} → ${formatDate(milestone.endDate)}`} />
          <MetaCard icon={CircleDollarSign} label="Payment" value={formatCurrency(milestone.amount)} />
          <MetaCard icon={Calendar} label="Deadline" value={formatDate(milestone.deadline)} />
          <MetaCard icon={FileText} label="Attachments" value={String(milestone.attachments.length)} />
        </div>

        <section className="panel p-5">
          <h2 className="text-lg font-bold text-ink-900">Description</h2>
          <p className="mt-3 text-sm leading-7 text-ink-600">{milestone.description}</p>
        </section>

        {milestone.deliverables.length > 0 && (
          <section className="panel p-5">
            <h2 className="text-lg font-bold text-ink-900">Expected deliverables</h2>
            <ul className="mt-3 space-y-2">
              {milestone.deliverables.map((deliverable) => (
                <li key={deliverable} className="flex items-center gap-2 text-sm text-ink-600">
                  <span className="h-1.5 w-1.5 rounded-full bg-brand-500" />
                  {deliverable}
                </li>
              ))}
            </ul>
          </section>
        )}

        {milestone.attachments.length > 0 && (
          <section className="panel p-5">
            <h2 className="text-lg font-bold text-ink-900">Reference attachments</h2>
            <div className="mt-3 flex flex-wrap gap-2">
              {milestone.attachments.map((attachment) => (
                <Badge key={attachment.id}>
                  <FileText className="mr-1 inline h-3 w-3" />
                  {attachment.name}
                  {attachment.size ? ` · ${attachment.size}` : ""}
                </Badge>
              ))}
            </div>
          </section>
        )}

        {milestone.reworkNotes && (
          <section className="rounded-lg border border-amber-200 bg-amber-50 p-5">
            <p className="text-sm font-bold text-amber-800">Rework notes</p>
            <p className="mt-2 text-sm leading-6 text-amber-900">{milestone.reworkNotes}</p>
          </section>
        )}

        <section className="panel p-5">
          <h2 className="text-lg font-bold text-ink-900">Workflow progress</h2>
          <div className="mt-4 flex flex-wrap gap-1">
            {MILESTONE_FLOW.map((step, index) => (
              <div
                key={step}
                className={`h-2 flex-1 min-w-[48px] rounded-full ${index <= flowIndex ? "bg-brand-500" : "bg-ink-100"}`}
                title={step}
              />
            ))}
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {MILESTONE_FLOW.map((step) => (
              <Badge key={step} tone={step === milestone.status ? "brand" : "neutral"}>{step}</Badge>
            ))}
          </div>
          {milestone.startRequestedAt && (
            <p className="mt-3 text-xs text-ink-500">Start requested {formatDateTime(milestone.startRequestedAt)}</p>
          )}
          {milestone.startApprovedAt && (
            <p className="mt-1 text-xs text-ink-500">Start approved {formatDateTime(milestone.startApprovedAt)}</p>
          )}
          {milestone.submittedAt && (
            <p className="mt-1 text-xs text-ink-500">Submitted {formatDateTime(milestone.submittedAt)}</p>
          )}
          {milestone.completedAt && (
            <p className="mt-1 text-xs text-ink-500">Completed {formatDateTime(milestone.completedAt)}</p>
          )}
        </section>

        {submission && (
          <section className="panel p-5">
            <h2 className="text-lg font-bold text-ink-900">Submitted work</h2>
            <p className="mt-3 text-sm leading-7 text-ink-600">{submission.summary}</p>
            <p className="mt-2 text-xs text-ink-400">Submitted {formatDateTime(submission.submittedAt)}</p>
            {submission.items.length > 0 && (
              <div className="mt-4 space-y-2">
                {submission.items.map((item) => (
                  <div key={item.id} className="flex items-center justify-between gap-3 rounded-lg border border-ink-200 px-4 py-3">
                    <div className="flex min-w-0 items-center gap-2">
                      {item.type === "link" ? <ExternalLink className="h-4 w-4 text-brand-600" /> : <FileText className="h-4 w-4 text-ink-500" />}
                      <span className="truncate text-sm font-semibold text-ink-900">{item.label}</span>
                    </div>
                    {item.type === "link" && item.url && (
                      <a href={item.url} target="_blank" rel="noreferrer" className="text-xs font-semibold text-brand-700 hover:underline">
                        Open
                      </a>
                    )}
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        <section className="panel p-5">
          <h2 className="text-lg font-bold text-ink-900">Actions</h2>
          <div className="mt-4 flex flex-wrap gap-2">
            {milestone.status === "Planned" && (
              <ActionButton icon={Send} label="Simulate: Consultant requests start" onClick={() => requestMilestoneStart(milestone.id)} tone="brand" />
            )}
            {milestone.status === "Start Requested" && (
              <ActionButton icon={Play} label="Approve start & release payment" onClick={() => approveMilestoneStart(milestone.id)} tone="success" />
            )}
            {(milestone.status === "In Progress" || milestone.status === "Revision Requested") && (
              <ActionButton icon={Send} label="Simulate: Consultant submits work" onClick={() => submitMilestoneWork(milestone.id)} tone="brand" />
            )}
            {isReviewable && (
              <ActionButton icon={Check} label="Review submission" onClick={() => setShowReview(true)} tone="amber" />
            )}
            {milestone.status === "Completed" && <Badge tone="success">Milestone closed</Badge>}
          </div>
        </section>
      </div>

      {reviewContext && workspace && (
        <ReviewSubmissionModal
          task={task}
          milestone={milestone}
          submission={reviewContext.submission}
          professional={reviewContext.professional}
          client={clientProfile}
          workspaceName={workspace.name}
          amount={reviewContext.amount}
          lineItemDescription={reviewContext.lineItemDescription}
          onClose={() => setShowReview(false)}
          onRework={(notes) => {
            requestMilestoneRework(milestone.id, notes);
            setShowReview(false);
          }}
          onApprove={() => approveMilestoneCompletion(milestone.id)}
          paymentOnApproval={false}
        />
      )}
    </>
  );
}

function MetaCard({ icon: Icon, label, value }: { icon: typeof Calendar; label: string; value: string }) {
  return (
    <div className="panel p-4">
      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-ink-400">
        <Icon className="h-4 w-4" />
        {label}
      </div>
      <p className="mt-2 text-sm font-bold text-ink-900">{value}</p>
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
    <button onClick={onClick} className={`focus-ring inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-bold ${styles[tone]}`}>
      <Icon className="h-4 w-4" />
      {label}
    </button>
  );
}
