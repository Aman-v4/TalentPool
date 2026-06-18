import { Link2 } from "lucide-react";
import { Link } from "react-router-dom";
import { Avatar } from "../ui/Avatar";
import { Badge } from "../ui/Badge";
import { StatusBadge } from "../ui/Status";
import { useTalentPool } from "../../state/TalentPoolContext";
import type { Application } from "../../types";
import { formatDate, resolveApplicationStatus } from "../../utils/date";

export function ApplicationDetailContent({ application }: { application: Application }) {
  const { getPool, getProfessional } = useTalentPool();
  const professional = getProfessional(application.professionalId);
  const pool = getPool(application.poolId);
  const resolvedStatus = resolveApplicationStatus(application);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex min-w-0 gap-4">
          <Avatar initials={professional?.avatar ?? "NA"} src={professional?.photoUrl} size="lg" />
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-brand-600">Application Details</p>
            <h2 className="mt-1 text-2xl font-bold text-ink-900">{professional?.name ?? "Unknown applicant"}</h2>
            <p className="mt-1 text-sm font-semibold text-ink-600">{professional?.title}</p>
            {professional && (
              <Link className="mt-2 inline-block text-sm font-semibold text-brand-700" to={`/professionals/${professional.id}`}>
                Open professional profile
              </Link>
            )}
          </div>
        </div>
        <Badge tone="blue">{application.matchScore}% skill match</Badge>
      </div>

      <section className="rounded-lg border border-brand-200 bg-brand-50 p-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.14em] text-brand-700">
              <Link2 className="h-4 w-4" />
              Applied to Talent Pool
            </div>
            {pool ? (
              <>
                <Link to={`/talent-pools/${pool.id}`} className="mt-2 block text-lg font-bold text-ink-900 hover:text-brand-700">
                  {pool.name}
                </Link>
                <p className="mt-1 text-sm leading-6 text-ink-600">{pool.description}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {pool.category && <Badge tone="blue">{pool.category}</Badge>}
                  {pool.requiredSkills.slice(0, 4).map((skill) => <Badge key={skill}>{skill}</Badge>)}
                </div>
              </>
            ) : (
              <p className="mt-2 text-sm font-bold text-ink-900">Unknown Talent Pool</p>
            )}
          </div>
          <StatusBadge status={pool?.intakeStatus ?? "Open"} />
        </div>
      </section>

      <div className="grid gap-4 sm:grid-cols-4">
        <Info label="Skill Match" value={`${application.matchScore}%`} />
        <Info label="Applied" value={formatDate(application.submittedAt)} />
        <Info label="Source" value={application.source} />
        <div className="rounded-lg bg-ink-50 p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-ink-400">Status</p>
          <div className="mt-2">
            <StatusBadge status={resolvedStatus} />
          </div>
        </div>
      </div>

      <div className="rounded-lg border border-ink-200 p-4">
        <h3 className="font-bold text-ink-900">Applicant description</h3>
        <p className="mt-2 text-sm leading-7 text-ink-600">{application.description}</p>
      </div>

      <div className="rounded-lg border border-ink-200 p-4">
        <h3 className="font-bold text-ink-900">Assignment submission details</h3>
        {pool?.entryAssignment && (
          <div className="mt-3 rounded-lg bg-brand-50 p-4">
            <p className="text-sm font-bold text-brand-700">Pool entry assignment: {pool.entryAssignment.title}</p>
            <p className="mt-1 text-sm leading-6 text-ink-600">{pool.entryAssignment.brief}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {pool.entryAssignment.deliverables.map((deliverable) => (
                <Badge key={deliverable} tone="brand">{deliverable}</Badge>
              ))}
            </div>
          </div>
        )}
        <p className="mt-3 text-sm font-semibold text-ink-800">{application.submissionStatus}</p>
        <p className="mt-1 text-sm leading-7 text-ink-600">{application.submissionDetails}</p>
      </div>

      <div className="rounded-lg border border-ink-200 p-4">
        <h3 className="font-bold text-ink-900">Client questions and applicant answers</h3>
        <div className="mt-4 space-y-3">
          {application.clientQuestions.length > 0 ? (
            application.clientQuestions.map((item) => (
              <div key={item.question} className="rounded-lg bg-ink-50 p-4">
                <p className="text-sm font-bold text-ink-900">{item.question}</p>
                <p className="mt-2 text-sm leading-6 text-ink-600">{item.answer}</p>
              </div>
            ))
          ) : (
            <p className="text-sm text-ink-500">No client questions were answered for this application.</p>
          )}
        </div>
      </div>

      {application.rejectionReason && (
        <div className="rounded-lg border border-coral-200 bg-coral-50 p-4">
          <p className="text-sm font-bold text-coral-700">Rejection reason</p>
          <p className="mt-2 text-sm leading-6 text-coral-600">{application.rejectionReason}</p>
        </div>
      )}
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-ink-50 p-4">
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-ink-400">{label}</p>
      <p className="mt-2 text-sm font-bold text-ink-900">{value}</p>
    </div>
  );
}
