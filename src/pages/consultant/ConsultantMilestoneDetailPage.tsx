import { ArrowLeft, Calendar, CircleDollarSign, FileText, Send } from "lucide-react";
import { FormEvent, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Badge } from "../../components/ui/Badge";
import { EmptyState } from "../../components/ui/EmptyState";
import { PageHeader } from "../../components/ui/PageHeader";
import { StatusBadge } from "../../components/ui/Status";
import { useTalentPool } from "../../state/TalentPoolContext";
import type { MilestoneStatus } from "../../types";
import { formatCurrency, formatDate, formatDateTime } from "../../utils/date";

const MILESTONE_FLOW: MilestoneStatus[] = [
  "Planned",
  "Start Requested",
  "In Progress",
  "Submitted",
  "Under Review",
  "Completed",
];

export function ConsultantMilestoneDetailPage() {
  const { taskId, milestoneId } = useParams();
  const {
    getMilestone,
    getSubmissionForMilestone,
    getTask,
    getWorkspace,
    requestMilestoneStart,
    submitConsultantDeliverable,
  } = useTalentPool();
  const [showSubmitForm, setShowSubmitForm] = useState(false);
  const [summary, setSummary] = useState("");
  const [linkUrl, setLinkUrl] = useState("");
  const [linkLabel, setLinkLabel] = useState("");

  const task = taskId ? getTask(taskId) : undefined;
  const milestone = milestoneId ? getMilestone(milestoneId) : undefined;

  if (!task || !milestone || milestone.taskId !== task.id) {
    return <EmptyState icon={FileText} title="Milestone not found" body="This milestone is not available." />;
  }

  const workspace = getWorkspace(task.workspaceId);
  const submission = getSubmissionForMilestone(milestone.id);
  const flowIndex = MILESTONE_FLOW.indexOf(milestone.status);

  const onSubmitWork = (event: FormEvent) => {
    event.preventDefault();
    submitConsultantDeliverable(
      task.id,
      {
        summary,
        items: linkUrl ? [{ type: "link", label: linkLabel || "Deliverable link", url: linkUrl }] : [],
      },
      milestone.id,
    );
    setShowSubmitForm(false);
    setSummary("");
    setLinkUrl("");
    setLinkLabel("");
  };

  return (
    <div className="space-y-8">
      <Link
        to={`/consultant/tasks/${task.id}`}
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
            <Badge tone="amber">{formatCurrency(milestone.amount)}</Badge>
          </>
        }
      />

      {workspace && <Badge tone="blue">Workspace: {workspace.name}</Badge>}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <MetaCard icon={Calendar} label="Schedule" value={`${formatDate(milestone.startDate)} → ${formatDate(milestone.endDate)}`} />
        <MetaCard icon={Calendar} label="Deadline" value={formatDate(milestone.deadline)} />
        <MetaCard icon={CircleDollarSign} label="Payment" value={formatCurrency(milestone.amount)} />
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
              </Badge>
            ))}
          </div>
        </section>
      )}

      {milestone.reworkNotes && (
        <section className="rounded-lg border border-amber-200 bg-amber-50 p-5">
          <p className="text-sm font-bold text-amber-800">Rework notes from client</p>
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
      </section>

      {submission && (
        <section className="panel p-5">
          <h2 className="text-lg font-bold text-ink-900">Your submission</h2>
          <p className="mt-3 text-sm leading-7 text-ink-600">{submission.summary}</p>
          <p className="mt-2 text-xs text-ink-400">Submitted {formatDateTime(submission.submittedAt)}</p>
        </section>
      )}

      <section className="panel p-5">
        <h2 className="text-lg font-bold text-ink-900">Actions</h2>
        <div className="mt-4 flex flex-wrap gap-2">
          {milestone.status === "Planned" && (
            <button
              onClick={() => requestMilestoneStart(milestone.id)}
              className="focus-ring rounded-lg border border-brand-300 bg-brand-50 px-4 py-2 text-sm font-bold text-brand-700 hover:bg-brand-100"
            >
              Request to start
            </button>
          )}
          {milestone.status === "Start Requested" && <Badge tone="amber">Awaiting client approval</Badge>}
          {(milestone.status === "In Progress" || milestone.status === "Revision Requested") && !showSubmitForm && (
            <button
              onClick={() => setShowSubmitForm(true)}
              className="focus-ring rounded-lg border border-brand-300 bg-brand-50 px-4 py-2 text-sm font-bold text-brand-700 hover:bg-brand-100"
            >
              Submit work
            </button>
          )}
          {milestone.status === "Completed" && <Badge tone="success">Milestone closed</Badge>}
        </div>
      </section>

      {showSubmitForm && (
        <form onSubmit={onSubmitWork} className="panel space-y-4 p-5">
          <h3 className="font-bold text-ink-900">Submit deliverables</h3>
          <label className="block">
            <span className="text-sm font-semibold text-ink-700">Summary</span>
            <textarea
              className="modal-input mt-2 min-h-24"
              required
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              placeholder="Describe what you delivered and how to review it."
            />
          </label>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="text-sm font-semibold text-ink-700">Link label</span>
              <input className="modal-input mt-2" value={linkLabel} onChange={(e) => setLinkLabel(e.target.value)} placeholder="Figma prototype" />
            </label>
            <label className="block">
              <span className="text-sm font-semibold text-ink-700">Link URL</span>
              <input className="modal-input mt-2" value={linkUrl} onChange={(e) => setLinkUrl(e.target.value)} placeholder="https://..." />
            </label>
          </div>
          <div className="flex gap-3">
            <button type="button" onClick={() => setShowSubmitForm(false)} className="rounded-lg border border-ink-200 px-4 py-2 text-sm font-semibold text-ink-700">
              Cancel
            </button>
            <button type="submit" className="focus-ring inline-flex items-center gap-2 rounded-lg bg-brand-700 px-4 py-2 text-sm font-bold text-white">
              <Send className="h-4 w-4" />
              Submit deliverables
            </button>
          </div>
        </form>
      )}
    </div>
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
