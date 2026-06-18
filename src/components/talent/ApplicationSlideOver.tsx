import { Download } from "lucide-react";
import { Link } from "react-router-dom";
import { Avatar } from "../ui/Avatar";
import { Badge } from "../ui/Badge";
import { SlideOver } from "../ui/SlideOver";
import { StatusBadge } from "../ui/Status";
import { useTalentPool } from "../../state/TalentPoolContext";
import type { Application } from "../../types";
import { downloadTextFile } from "../../utils/download";
import { formatDate, resolveApplicationStatus } from "../../utils/date";

export function ApplicationSlideOver({
  application,
  onClose,
  onReview,
}: {
  application: Application;
  onClose: () => void;
  onReview?: () => void;
}) {
  const { getPool, getProfessional } = useTalentPool();
  const professional = getProfessional(application.professionalId);
  const pool = getPool(application.poolId);
  const resolvedStatus = resolveApplicationStatus(application);

  const downloadAssignment = () => {
    const filename = application.submissionAttachment?.name ?? `${professional?.name ?? "applicant"}-assignment.txt`;
    const content =
      application.submissionAttachment?.content ??
      `Assignment submission\n\nPool: ${pool?.name ?? "Unknown"}\nApplicant: ${professional?.name ?? "Unknown"}\n\n${application.submissionDetails}`;
    downloadTextFile(filename, content);
  };

  return (
    <SlideOver
      title={professional?.name ?? "Application"}
      subtitle={pool?.name}
      onClose={onClose}
      footer={
        <div className="flex flex-wrap gap-2">
          {onReview && resolvedStatus === "Pending" && (
            <button className="btn-primary flex-1" onClick={onReview}>
              Review application
            </button>
          )}
          <Link to={`/applications/${application.id}`} className="btn-outline flex-1" onClick={onClose}>
            Full application page
          </Link>
        </div>
      }
    >
      <div className="space-y-5">
        <div className="flex items-center gap-3">
          <Avatar initials={professional?.avatar ?? "NA"} src={professional?.photoUrl} size="lg" />
          <div>
            <p className="font-semibold text-ink-900">{professional?.title}</p>
            <StatusBadge status={resolvedStatus} />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="rounded-xl bg-ink-50 p-3">
            <p className="text-xs text-ink-400">Match</p>
            <p className="font-bold text-ink-900">{application.matchScore}%</p>
          </div>
          <div className="rounded-xl bg-ink-50 p-3">
            <p className="text-xs text-ink-400">Submitted</p>
            <p className="font-bold text-ink-900">{formatDate(application.submittedAt)}</p>
          </div>
        </div>

        <div>
          <p className="text-sm font-bold text-ink-900">Why they applied</p>
          <p className="mt-2 text-sm leading-6 text-ink-600">{application.description}</p>
        </div>

        <div className="rounded-2xl border border-ink-100 p-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm font-bold text-ink-900">Assignment submission</p>
              <p className="mt-1 text-xs text-ink-500">{application.submissionStatus}</p>
            </div>
            <button type="button" className="btn-outline shrink-0 px-3 py-2" onClick={downloadAssignment} aria-label="Download assignment">
              <Download className="h-4 w-4" />
            </button>
          </div>
          <p className="mt-3 text-sm leading-6 text-ink-600">{application.submissionDetails}</p>
          {application.submissionAttachment && (
            <p className="mt-2 text-xs font-semibold text-brand-700">{application.submissionAttachment.name}</p>
          )}
        </div>

        {application.clientQuestions.length > 0 && (
          <div>
            <p className="text-sm font-bold text-ink-900">Client Q&A</p>
            <div className="mt-3 space-y-2">
              {application.clientQuestions.map((item) => (
                <div key={item.question} className="rounded-xl bg-ink-50 p-3">
                  <p className="text-xs font-bold text-ink-800">{item.question}</p>
                  <p className="mt-1 text-sm text-ink-600">{item.answer}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {pool?.entryAssignment && (
          <div className="rounded-2xl bg-brand-50 p-4">
            <p className="text-sm font-bold text-brand-800">Pool entry assignment</p>
            <p className="mt-1 text-sm text-ink-600">{pool.entryAssignment.title}</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {pool.entryAssignment.deliverables.map((d) => <Badge key={d} tone="brand">{d}</Badge>)}
            </div>
          </div>
        )}
      </div>
    </SlideOver>
  );
}
