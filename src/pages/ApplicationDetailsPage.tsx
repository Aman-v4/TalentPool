import { ArrowLeft, Check, Clock3, FileText, X } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ApplicationDetailContent } from "../components/talent/ApplicationDetailContent";
import { EmptyState } from "../components/ui/EmptyState";
import { PageHeader } from "../components/ui/PageHeader";
import { StatusBadge } from "../components/ui/Status";
import { applicationExpiryDays } from "../data/mockData";
import { useTalentPool } from "../state/TalentPoolContext";
import { daysBetween, resolveApplicationStatus } from "../utils/date";

export function ApplicationDetailsPage() {
  const { applicationId } = useParams();
  const navigate = useNavigate();
  const { applications, approveApplication, getProfessional, rejectApplication } = useTalentPool();
  const application = applications.find((item) => item.id === applicationId);
  const [reason, setReason] = useState(application?.rejectionReason ?? "Skill match is not strong enough for this pool right now.");

  if (!application) {
    return <EmptyState icon={FileText} title="Application not found" body="The selected application is not available in this prototype data set." />;
  }

  const professional = getProfessional(application.professionalId);
  const resolvedStatus = resolveApplicationStatus(application);
  const expiresIn = applicationExpiryDays - daysBetween(application.submittedAt);
  const isPending = resolvedStatus === "Pending";

  return (
    <div className="space-y-8">
      <Link to="/applications" className="inline-flex items-center gap-2 text-sm font-semibold text-ink-600 hover:text-ink-900">
        <ArrowLeft className="h-4 w-4" />
        Back to Applications
      </Link>

      <PageHeader
        eyebrow="Application review"
        title={`${professional?.name ?? "Professional"} application`}
        actions={<StatusBadge status={resolvedStatus} />}
      />

      <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
        <section className="panel p-5">
          <ApplicationDetailContent application={application} />
        </section>

        <aside className="space-y-6">
          <section className="panel p-5">
            <div className="flex items-center gap-2">
              <Clock3 className="h-5 w-5 text-amber-500" />
              <h2 className="text-lg font-bold text-ink-900">Expiry</h2>
            </div>
            <p className="mt-3 text-sm leading-6 text-ink-600">
              {isPending
                ? `${Math.max(0, expiresIn)} days left before this application expires automatically.`
                : "Decision already recorded. History remains preserved."}
            </p>
          </section>

          {isPending && (
            <section className="panel p-5">
              <h2 className="text-lg font-bold text-ink-900">Decision</h2>
              <label className="mt-4 block">
                <span className="text-sm font-semibold text-ink-700">Rejection reason</span>
                <textarea
                  className="focus-ring mt-2 min-h-28 w-full rounded-lg border border-ink-200 bg-white px-3 py-3 text-sm leading-6 text-ink-900"
                  value={reason}
                  onChange={(event) => setReason(event.target.value)}
                />
              </label>
              <div className="mt-4 grid gap-3">
                <button
                  className="focus-ring inline-flex items-center justify-center gap-2 rounded-lg bg-brand-600 px-4 py-3 text-sm font-bold text-white"
                  onClick={() => { approveApplication(application.id); navigate("/applications"); }}
                >
                  <Check className="h-4 w-4" />
                  Accept Application
                </button>
                <button
                  className="focus-ring inline-flex items-center justify-center gap-2 rounded-lg border border-coral-200 bg-coral-50 px-4 py-3 text-sm font-bold text-coral-500"
                  onClick={() => { rejectApplication(application.id, reason); navigate("/applications"); }}
                >
                  <X className="h-4 w-4" />
                  Reject Application
                </button>
              </div>
            </section>
          )}
        </aside>
      </div>
    </div>
  );
}
