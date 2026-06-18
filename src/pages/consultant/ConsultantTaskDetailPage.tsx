import { ArrowLeft, BriefcaseBusiness, FileText, Send } from "lucide-react";
import { FormEvent, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Badge } from "../../components/ui/Badge";
import { EmptyState } from "../../components/ui/EmptyState";
import { PageHeader } from "../../components/ui/PageHeader";
import { StatusBadge } from "../../components/ui/Status";
import { useTalentPool } from "../../state/TalentPoolContext";
import type { Milestone } from "../../types";
import { formatCurrency, formatDate } from "../../utils/date";

export function ConsultantTaskDetailPage() {
  const { taskId } = useParams();
  const {
    getMilestonesForTask,
    getPool,
    getSubmissionForMilestone,
    getTask,
    getWorkspace,
    requestMilestoneStart,
    submitConsultantDeliverable,
  } = useTalentPool();
  const task = taskId ? getTask(taskId) : undefined;
  const [activeMilestone, setActiveMilestone] = useState<Milestone | null>(null);
  const [summary, setSummary] = useState("");
  const [linkUrl, setLinkUrl] = useState("");
  const [linkLabel, setLinkLabel] = useState("");

  if (!task) {
    return <EmptyState icon={BriefcaseBusiness} title="Task not found" body="This task is not assigned to you." />;
  }

  const workspace = getWorkspace(task.workspaceId);
  const pool = task.poolId ? getPool(task.poolId) : undefined;
  const milestones = getMilestonesForTask(task.id);

  const onSubmitWork = (event: FormEvent) => {
    event.preventDefault();
    if (!activeMilestone) return;
    submitConsultantDeliverable(
      task.id,
      {
        summary,
        items: linkUrl ? [{ type: "link", label: linkLabel || "Deliverable link", url: linkUrl }] : [],
      },
      activeMilestone.id,
    );
    setActiveMilestone(null);
    setSummary("");
    setLinkUrl("");
    setLinkLabel("");
  };

  return (
    <div className="space-y-8">
      <Link to="/consultant/tasks" className="inline-flex items-center gap-2 text-sm font-semibold text-ink-600 hover:text-ink-900">
        <ArrowLeft className="h-4 w-4" />
        Back to tasks
      </Link>

      <PageHeader eyebrow="Task" title={task.title} actions={<StatusBadge status={task.status} />} />

      {workspace && <Badge tone="blue">Workspace: {workspace.name}</Badge>}
      {pool && <Badge tone="brand">Pool: {pool.name}</Badge>}

      <section className="panel p-5">
        <h2 className="text-lg font-bold text-ink-900">Description</h2>
        <p className="mt-3 text-sm leading-7 text-ink-600">{task.description}</p>
        <p className="mt-3 text-xs text-ink-400">{formatDate(task.startDate)} → {formatDate(task.endDate)}</p>
      </section>

      <section className="panel p-5">
        <h2 className="text-lg font-bold text-ink-900">Milestones</h2>
        <p className="mt-1 text-sm text-ink-500">Request start → client approves & pays → submit work → client reviews.</p>
        <div className="mt-5 space-y-4">
          {milestones.map((milestone) => {
            const submission = getSubmissionForMilestone(milestone.id);
            return (
              <div key={milestone.id} className="rounded-lg border border-ink-200 p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-bold text-ink-900">{milestone.title}</p>
                    <p className="mt-1 text-xs text-ink-400">
                      {formatDate(milestone.startDate)} → {formatDate(milestone.endDate)} · {formatCurrency(milestone.amount)}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <StatusBadge status={milestone.status} />
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap items-center gap-2">
                  <Link
                    to={`/consultant/tasks/${task.id}/milestones/${milestone.id}`}
                    className="focus-ring inline-flex items-center gap-2 rounded-lg border border-ink-200 bg-white px-3 py-1.5 text-xs font-bold text-ink-700 hover:bg-ink-50"
                  >
                    <FileText className="h-3.5 w-3.5" />
                    View details
                  </Link>
                  {milestone.status === "Planned" && (
                    <button onClick={() => requestMilestoneStart(milestone.id)} className="focus-ring rounded-lg border border-brand-300 bg-brand-50 px-3 py-1.5 text-xs font-bold text-brand-700">
                      Request to start
                    </button>
                  )}
                  {milestone.status === "Start Requested" && (
                    <Badge tone="amber">Awaiting client approval</Badge>
                  )}
                  {(milestone.status === "In Progress" || milestone.status === "Revision Requested") && (
                    <button onClick={() => setActiveMilestone(milestone)} className="focus-ring rounded-lg border border-brand-300 bg-brand-50 px-3 py-1.5 text-xs font-bold text-brand-700">
                      Submit work
                    </button>
                  )}
                  {submission && (
                    <Badge tone="success">Submitted {formatDate(submission.submittedAt)}</Badge>
                  )}
                  {milestone.status === "Completed" && <Badge tone="success">Closed</Badge>}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {activeMilestone && (
        <form onSubmit={onSubmitWork} className="panel space-y-4 p-5">
          <h3 className="font-bold text-ink-900">Submit: {activeMilestone.title}</h3>
          <label className="block">
            <span className="text-sm font-semibold text-ink-700">Summary</span>
            <textarea className="modal-input mt-2 min-h-24" required value={summary} onChange={(e) => setSummary(e.target.value)} placeholder="Describe what you delivered and how to review it." />
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
            <button type="button" onClick={() => setActiveMilestone(null)} className="rounded-lg border border-ink-200 px-4 py-2 text-sm font-semibold text-ink-700">Cancel</button>
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
