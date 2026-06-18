import { CalendarDays, MapPin, Star, X } from "lucide-react";
import { useState } from "react";
import { ApplicationDetailContent } from "./ApplicationDetailContent";
import { Avatar } from "../ui/Avatar";
import { StatusBadge } from "../ui/Status";
import { useTalentPool } from "../../state/TalentPoolContext";
import type { Application } from "../../types";
import { formatDate, resolveApplicationStatus } from "../../utils/date";

export function ApplicationReviewList({
  applications,
  emptyMessage = "No applications found.",
  compact = false,
}: {
  applications: Application[];
  emptyMessage?: string;
  compact?: boolean;
}) {
  const { getPool, getProfessional } = useTalentPool();
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);

  if (applications.length === 0) {
    return (
      <div className={`rounded-lg border border-dashed border-ink-200 bg-ink-50 text-center text-sm text-ink-500 ${compact ? "mx-4 mb-4 p-6" : "p-8"}`}>
        {emptyMessage}
      </div>
    );
  }

  if (compact) {
    return (
      <>
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
                    <span className="text-sm font-bold text-ink-900 truncate">{professional?.name ?? "Unknown"}</span>
                    <StatusBadge status={status} />
                  </div>
                  <p className="mt-0.5 text-xs text-ink-500">{application.matchScore}% match · {formatDate(application.submittedAt)}</p>
                </div>
              </button>
            );
          })}
        </div>
        {selectedApplication && (
          <ApplicationModal application={selectedApplication} onClose={() => setSelectedApplication(null)} />
        )}
      </>
    );
  }

  return (
    <>
      <div className="grid gap-4 md:grid-cols-2">
        {applications.map((application) => {
          const professional = getProfessional(application.professionalId);
          const pool = getPool(application.poolId);
          const status = resolveApplicationStatus(application);

          return (
            <article key={application.id} className="panel p-5">
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
                        New
                      </p>
                    )}
                  </div>
                </div>
                <StatusBadge status={status} />
              </div>
              <button
                type="button"
                onClick={() => setSelectedApplication(application)}
                className="btn-outline mt-5"
              >
                View Profile
              </button>
            </article>
          );
        })}
      </div>

      {selectedApplication && (
        <ApplicationModal application={selectedApplication} onClose={() => setSelectedApplication(null)} />
      )}
    </>
  );
}

function ApplicationModal({ application, onClose }: { application: Application; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 py-6">
      <button className="absolute inset-0 bg-ink-900/45" onClick={onClose} aria-label="Close application modal backdrop" />
      <section className="relative max-h-[92vh] w-full max-w-4xl overflow-y-auto rounded-3xl bg-white p-5 shadow-panel sm:p-6">
        <div className="mb-4 flex justify-end">
          <button className="focus-ring rounded-lg p-2 text-ink-500 hover:bg-ink-50 hover:text-ink-900" onClick={onClose} aria-label="Close application modal">
            <X className="h-5 w-5" />
          </button>
        </div>
        <ApplicationDetailContent application={application} />
        <div className="mt-6 flex flex-wrap justify-end gap-3">
          <button className="focus-ring rounded-lg border border-ink-200 bg-white px-4 py-2 text-sm font-bold text-ink-700">Review</button>
          <button className="focus-ring rounded-lg border border-coral-200 bg-coral-50 px-4 py-2 text-sm font-bold text-coral-500">Reject</button>
          <button className="focus-ring rounded-lg bg-brand-600 px-4 py-2 text-sm font-bold text-white">Approve</button>
        </div>
      </section>
    </div>
  );
}

