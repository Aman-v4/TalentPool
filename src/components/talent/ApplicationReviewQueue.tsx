import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { Avatar } from "../ui/Avatar";
import { Badge } from "../ui/Badge";
import { StatusBadge } from "../ui/Status";
import { useTalentPool } from "../../state/TalentPoolContext";
import type { Application } from "../../types";
import { downloadTextFile } from "../../utils/download";
import { formatDate, resolveApplicationStatus } from "../../utils/date";

export function ApplicationReviewQueue({
  applications,
  poolId,
  onClose,
}: {
  applications: Application[];
  poolId?: string;
  onClose: () => void;
}) {
  const { approveApplication, getPool, getProfessional, rejectApplication } = useTalentPool();
  const [rejectReason, setRejectReason] = useState("");
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [cursor, setCursor] = useState(0);

  const queue = useMemo(
    () =>
      applications.filter(
        (application) =>
          resolveApplicationStatus(application) === "Pending" &&
          (!poolId || application.poolId === poolId),
      ),
    [applications, poolId],
  );

  const current = queue[cursor];
  const professional = current ? getProfessional(current.professionalId) : undefined;
  const pool = current ? getPool(current.poolId) : undefined;

  useEffect(() => {
    if (cursor >= queue.length) {
      setCursor(Math.max(0, queue.length - 1));
    }
  }, [cursor, queue.length]);

  if (queue.length === 0) {
    return (
      <ReviewShell onClose={onClose} title="Review complete">
        <div className="py-12 text-center text-sm text-ink-500">No pending applications left in this queue.</div>
      </ReviewShell>
    );
  }

  if (!current) return null;

  const advance = () => {
    setShowRejectForm(false);
    setRejectReason("");
    if (cursor >= queue.length - 1) {
      onClose();
    }
  };

  const handleApprove = () => {
    approveApplication(current.id);
    advance();
  };

  const handleReject = () => {
    if (!rejectReason.trim()) return;
    rejectApplication(current.id, rejectReason.trim());
    advance();
  };

  const downloadAssignment = () => {
    const filename = current.submissionAttachment?.name ?? `${professional?.name ?? "applicant"}-assignment.txt`;
    const content =
      current.submissionAttachment?.content ??
      `Assignment submission\n\nPool: ${pool?.name ?? "Unknown"}\nApplicant: ${professional?.name ?? "Unknown"}\n\n${current.submissionDetails}`;
    downloadTextFile(filename, content);
  };

  return (
    <ReviewShell
      onClose={onClose}
      title={`Reviewing application ${cursor + 1} of ${queue.length}`}
      subtitle={pool ? `${pool.name} · ${queue.length} pending for this pool` : `${queue.length} pending total`}
    >
      <div className="mb-4 flex items-center justify-between gap-3">
        <Badge tone="amber">{queue.length} pending review</Badge>
        <div className="flex gap-2">
          <button
            type="button"
            className="btn-outline px-3 py-2 disabled:opacity-40"
            disabled={cursor === 0}
            onClick={() => setCursor((value) => value - 1)}
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            className="btn-outline px-3 py-2 disabled:opacity-40"
            disabled={cursor >= queue.length - 1}
            onClick={() => setCursor((value) => value + 1)}
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="space-y-5">
        <div className="flex items-start gap-4">
          <Avatar initials={professional?.avatar ?? "NA"} src={professional?.photoUrl} size="lg" />
          <div>
            <h3 className="text-xl font-bold text-ink-900">{professional?.name}</h3>
            <p className="text-sm text-ink-500">{professional?.title}</p>
            <div className="mt-2 flex flex-wrap gap-2">
              <Badge tone="blue">{current.matchScore}% match</Badge>
              <StatusBadge status={resolveApplicationStatus(current)} />
            </div>
          </div>
        </div>

        <div>
          <p className="text-sm font-bold text-ink-900">Application summary</p>
          <p className="mt-2 text-sm leading-6 text-ink-600">{current.description}</p>
        </div>

        <div className="rounded-2xl border border-ink-100 p-4">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-bold text-ink-900">Assignment submission</p>
            <button type="button" className="text-sm font-semibold text-brand-700 hover:underline" onClick={downloadAssignment}>
              Download
            </button>
          </div>
          <p className="mt-2 text-xs text-ink-500">{current.submissionStatus} · {formatDate(current.submittedAt)}</p>
          <p className="mt-2 text-sm leading-6 text-ink-600">{current.submissionDetails}</p>
        </div>

        {current.clientQuestions.length > 0 && (
          <div className="space-y-2">
            {current.clientQuestions.map((item) => (
              <div key={item.question} className="rounded-xl bg-ink-50 p-3">
                <p className="text-xs font-bold text-ink-800">{item.question}</p>
                <p className="mt-1 text-sm text-ink-600">{item.answer}</p>
              </div>
            ))}
          </div>
        )}

        {showRejectForm ? (
          <div className="rounded-2xl border border-coral-200 bg-coral-50 p-4">
            <label className="block text-sm font-bold text-coral-800">Rejection reason</label>
            <textarea
              className="modal-input mt-2 min-h-24"
              value={rejectReason}
              onChange={(event) => setRejectReason(event.target.value)}
              placeholder="Explain why this application is not a fit..."
            />
            <div className="mt-3 flex gap-2">
              <button type="button" className="btn-outline" onClick={() => setShowRejectForm(false)}>Cancel</button>
              <button type="button" className="rounded-lg bg-coral-500 px-4 py-2 text-sm font-bold text-white" onClick={handleReject} disabled={!rejectReason.trim()}>
                Confirm reject
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-wrap justify-end gap-3 border-t border-ink-100 pt-4">
            <button type="button" className="rounded-lg border border-coral-200 bg-coral-50 px-4 py-2 text-sm font-bold text-coral-600" onClick={() => setShowRejectForm(true)}>
              Reject
            </button>
            <button type="button" className="btn-primary" onClick={handleApprove}>
              Approve & next
            </button>
          </div>
        )}
      </div>
    </ReviewShell>
  );
}

function ReviewShell({
  title,
  subtitle,
  children,
  onClose,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 py-6">
      <button className="absolute inset-0 bg-ink-900/45" onClick={onClose} aria-label="Close review queue" />
      <section className="relative max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-3xl bg-white p-5 shadow-panel sm:p-6">
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-brand-600">Application review</p>
            <h2 className="mt-1 text-xl font-bold text-ink-900">{title}</h2>
            {subtitle && <p className="mt-1 text-sm text-ink-500">{subtitle}</p>}
          </div>
          <button className="focus-ring rounded-lg p-2 text-ink-500 hover:bg-ink-50" onClick={onClose} aria-label="Close">
            <X className="h-5 w-5" />
          </button>
        </div>
        {children}
      </section>
    </div>
  );
}
