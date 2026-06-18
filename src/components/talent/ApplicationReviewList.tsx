import { CalendarDays, Download, MapPin, Star } from "lucide-react";
import { useState } from "react";
import { ProfileSlideOver } from "../profile/ProfileSlideOver";
import { ApplicationReviewQueue } from "./ApplicationReviewQueue";
import { ApplicationSlideOver } from "./ApplicationSlideOver";
import { Avatar } from "../ui/Avatar";
import { StatusBadge } from "../ui/Status";
import { useTalentPool } from "../../state/TalentPoolContext";
import type { Application } from "../../types";
import { formatDate, resolveApplicationStatus } from "../../utils/date";

export function ApplicationReviewList({
  applications,
  emptyMessage = "No applications found.",
  compact = false,
  poolId,
}: {
  applications: Application[];
  emptyMessage?: string;
  compact?: boolean;
  poolId?: string;
}) {
  const { getPool, getProfessional } = useTalentPool();
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
  const [profilePreviewId, setProfilePreviewId] = useState<string | null>(null);
  const [reviewOpen, setReviewOpen] = useState(false);

  const profilePreview = profilePreviewId ? getProfessional(profilePreviewId) : undefined;
  const pendingCount = applications.filter((application) => resolveApplicationStatus(application) === "Pending").length;

  if (applications.length === 0) {
    return (
      <div className={`rounded-lg border border-dashed border-ink-200 bg-ink-50 text-center text-sm text-ink-500 ${compact ? "mx-4 mb-4 p-6" : "p-8"}`}>
        {emptyMessage}
      </div>
    );
  }

  const openReview = (application: Application) => {
    setSelectedApplication(application);
    setReviewOpen(true);
  };

  if (compact) {
    return (
      <>
        {pendingCount > 0 && (
          <div className="mb-3 flex justify-end px-4">
            <button type="button" className="btn-primary text-xs" onClick={() => setReviewOpen(true)}>
              Review queue ({pendingCount})
            </button>
          </div>
        )}
        <div className="divide-y divide-ink-100">
          {applications.map((application) => {
            const professional = getProfessional(application.professionalId);
            const status = resolveApplicationStatus(application);
            return (
              <button
                key={application.id}
                className="focus-ring flex w-full items-center gap-3 px-4 py-3 text-left transition hover:bg-ink-50"
                onClick={() => setSelectedApplication(application)}
              >
                <Avatar initials={professional?.avatar ?? "NA"} src={professional?.photoUrl} size="sm" />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="truncate text-sm font-bold text-ink-900">{professional?.name ?? "Unknown"}</span>
                    <StatusBadge status={status} />
                  </div>
                  <p className="mt-0.5 text-xs text-ink-500">{application.matchScore}% match · {formatDate(application.submittedAt)}</p>
                </div>
              </button>
            );
          })}
        </div>
        {selectedApplication && !reviewOpen && (
          <ApplicationSlideOver
            application={selectedApplication}
            onClose={() => setSelectedApplication(null)}
            onReview={() => openReview(selectedApplication)}
          />
        )}
        {reviewOpen && (
          <ApplicationReviewQueue applications={applications} poolId={poolId} onClose={() => { setReviewOpen(false); setSelectedApplication(null); }} />
        )}
      </>
    );
  }

  return (
    <>
      {pendingCount > 0 && (
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-ink-500">{pendingCount} application{pendingCount !== 1 ? "s" : ""} pending review</p>
          <button type="button" className="btn-primary" onClick={() => setReviewOpen(true)}>
            Start review queue
          </button>
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        {applications.map((application) => {
          const professional = getProfessional(application.professionalId);
          const pool = getPool(application.poolId);
          const status = resolveApplicationStatus(application);

          return (
            <article
              key={application.id}
              role="button"
              tabIndex={0}
              className="panel cursor-pointer p-5 transition hover:-translate-y-0.5 hover:shadow-panel"
              onClick={() => setSelectedApplication(application)}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  setSelectedApplication(application);
                }
              }}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex min-w-0 items-start gap-3">
                  <Avatar initials={professional?.avatar ?? "NA"} src={professional?.photoUrl} size="lg" />
                  <div className="min-w-0">
                    <h3 className="text-base font-bold text-ink-900">{professional?.name ?? "Unknown applicant"}</h3>
                    <p className="text-sm text-ink-500">{professional?.title ?? pool?.name}</p>
                    <p className="mt-2 flex items-center gap-1 text-sm text-ink-500">
                      <MapPin className="h-3.5 w-3.5" />
                      {professional?.location ?? "Remote"}
                    </p>
                    <p className="mt-1 flex items-center gap-1 text-sm text-ink-500">
                      <CalendarDays className="h-3.5 w-3.5" />
                      Applied {formatDate(application.submittedAt)}
                    </p>
                    {application.matchScore >= 80 && (
                      <p className="mt-2 inline-flex items-center gap-1 text-sm font-semibold text-amber-600">
                        <Star className="h-3.5 w-3.5 fill-current" />
                        Strong match
                      </p>
                    )}
                  </div>
                </div>
                <StatusBadge status={status} />
              </div>

              {application.submissionAttachment && (
                <p className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-brand-700">
                  <Download className="h-3.5 w-3.5" />
                  Assignment file attached
                </p>
              )}

              <div className="mt-5 flex flex-wrap gap-2">
                <button
                  type="button"
                  className="btn-outline"
                  onClick={(event) => {
                    event.stopPropagation();
                    if (professional) setProfilePreviewId(professional.id);
                  }}
                >
                  View profile
                </button>
                {status === "Pending" && (
                  <button
                    type="button"
                    className="btn-primary"
                    onClick={(event) => {
                      event.stopPropagation();
                      openReview(application);
                    }}
                  >
                    Review
                  </button>
                )}
              </div>
            </article>
          );
        })}
      </div>

      {selectedApplication && !reviewOpen && (
        <ApplicationSlideOver
          application={selectedApplication}
          onClose={() => setSelectedApplication(null)}
          onReview={() => openReview(selectedApplication)}
        />
      )}

      {reviewOpen && (
        <ApplicationReviewQueue applications={applications} poolId={poolId} onClose={() => { setReviewOpen(false); setSelectedApplication(null); }} />
      )}

      {profilePreview && <ProfileSlideOver professional={profilePreview} onClose={() => setProfilePreviewId(null)} />}
    </>
  );
}
