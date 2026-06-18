import { ArrowRight, Compass, Mail, Send } from "lucide-react";
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Badge } from "../../components/ui/Badge";
import { PageHeader } from "../../components/ui/PageHeader";
import { PillTabs } from "../../components/ui/PillTabs";
import { StatusBadge } from "../../components/ui/Status";
import { useTalentPool } from "../../state/TalentPoolContext";
import { formatDate, resolveApplicationStatus } from "../../utils/date";

type DiscoverTab = "new" | "pending" | "invites" | "sent";

export function ConsultantDiscoverPage() {
  const {
    consultantProfile,
    getConsultantApplications,
    getConsultantInvitations,
    getDiscoverablePools,
    getPool,
    getPoolMatchScore,
    hasConsultantAppliedToPool,
  } = useTalentPool();
  const [activeTab, setActiveTab] = useState<DiscoverTab>("new");

  const pools = getDiscoverablePools();
  const applications = getConsultantApplications();
  const invitations = getConsultantInvitations();

  const pendingApplications = applications.filter((application) => resolveApplicationStatus(application) === "Pending");
  const pendingInvites = invitations.filter((invitation) => invitation.status === "Pending");

  const tabs = useMemo(
    () => [
      { id: "new" as DiscoverTab, label: "New", count: pools.length },
      { id: "pending" as DiscoverTab, label: "Pending", count: pendingApplications.length },
      { id: "invites" as DiscoverTab, label: "Invites", count: pendingInvites.length },
      { id: "sent" as DiscoverTab, label: "Sent", count: applications.length },
    ],
    [applications.length, pendingApplications.length, pendingInvites.length, pools.length],
  );

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Discover"
        title="Talent pools for you"
        actions={<Badge tone="blue">{consultantProfile.skills.length} skills on profile</Badge>}
      />

      <PillTabs tabs={tabs} active={activeTab} onChange={setActiveTab} />

      {activeTab === "new" && (
        <>
          <div className="rounded-lg border border-brand-200 bg-brand-50 px-5 py-4">
            <div className="flex items-center gap-2 text-sm font-bold text-brand-800">
              <Compass className="h-4 w-4" />
              Matched to your skills: {consultantProfile.skills.slice(0, 5).join(", ")}{consultantProfile.skills.length > 5 ? "…" : ""}
            </div>
          </div>

          <div className="grid gap-5 lg:grid-cols-2">
            {pools.map((pool) => {
              const matchScore = getPoolMatchScore(pool.id);
              const applied = hasConsultantAppliedToPool(pool.id);
              return (
                <Link key={pool.id} to={`/consultant/pools/${pool.id}`} className="panel block p-5 transition hover:-translate-y-0.5 hover:shadow-panel">
                  <div className="flex items-start justify-between gap-3">
                    <h2 className="text-xl font-bold text-ink-900">{pool.name}</h2>
                    <Badge tone={matchScore >= 70 ? "success" : matchScore >= 40 ? "amber" : "neutral"}>{matchScore}% match</Badge>
                  </div>
                  <p className="mt-2 line-clamp-2 text-sm leading-6 text-ink-500">{pool.description}</p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {pool.requiredSkills.map((skill) => (
                      <Badge key={skill} tone={consultantProfile.skills.includes(skill) ? "brand" : "neutral"}>{skill}</Badge>
                    ))}
                  </div>
                  <div className="mt-5 flex items-center justify-between">
                    {applied ? <Badge tone="amber">Application pending</Badge> : <Badge tone="success">Open for applications</Badge>}
                    <span className="inline-flex items-center gap-1 text-sm font-semibold text-brand-700">
                      View & apply <ArrowRight className="h-4 w-4" />
                    </span>
                  </div>
                  {pool.entryAssignment && (
                    <p className="mt-3 text-xs text-ink-500">Entry assignment required: {pool.entryAssignment.title}</p>
                  )}
                </Link>
              );
            })}
          </div>

          {pools.length === 0 && (
            <div className="panel px-5 py-12 text-center text-sm text-ink-500">
              No open public pools match your profile right now.
            </div>
          )}
        </>
      )}

      {activeTab === "pending" && (
        <div className="space-y-4">
          {pendingApplications.map((application) => {
            const pool = getPool(application.poolId);
            return (
              <Link key={application.id} to={`/consultant/pools/${application.poolId}`} className="panel block p-5 transition hover:shadow-panel">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="font-bold text-ink-900">{pool?.name ?? "Talent pool"}</p>
                    <p className="mt-1 text-sm text-ink-500">Submitted {formatDate(application.submittedAt)} · {application.matchScore}% match</p>
                  </div>
                  <StatusBadge status={resolveApplicationStatus(application)} />
                </div>
              </Link>
            );
          })}
          {pendingApplications.length === 0 && (
            <div className="panel px-5 py-12 text-center text-sm text-ink-500">No pending applications.</div>
          )}
        </div>
      )}

      {activeTab === "invites" && (
        <div className="space-y-4">
          {pendingInvites.map((invitation) => {
            const pool = getPool(invitation.poolId);
            return (
              <Link key={invitation.id} to={`/consultant/pools/${invitation.poolId}`} className="panel block p-5 transition hover:shadow-panel">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="rounded-lg bg-brand-50 p-2 text-brand-700">
                      <Mail className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-bold text-ink-900">{pool?.name ?? "Talent pool"}</p>
                      <p className="mt-1 text-sm text-ink-500">Invited {formatDate(invitation.sentAt)}</p>
                    </div>
                  </div>
                  <Badge tone="blue">Pool invite</Badge>
                </div>
              </Link>
            );
          })}
          {pendingInvites.length === 0 && (
            <div className="panel px-5 py-12 text-center text-sm text-ink-500">No pending invitations.</div>
          )}
        </div>
      )}

      {activeTab === "sent" && (
        <div className="space-y-4">
          {applications.map((application) => {
            const pool = getPool(application.poolId);
            return (
              <Link key={application.id} to={`/consultant/pools/${application.poolId}`} className="panel block p-5 transition hover:shadow-panel">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="rounded-lg bg-ink-50 p-2 text-ink-600">
                      <Send className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-bold text-ink-900">{pool?.name ?? "Talent pool"}</p>
                      <p className="mt-1 text-sm text-ink-500">Sent {formatDate(application.submittedAt)} · {application.source}</p>
                    </div>
                  </div>
                  <StatusBadge status={resolveApplicationStatus(application)} />
                </div>
              </Link>
            );
          })}
          {applications.length === 0 && (
            <div className="panel px-5 py-12 text-center text-sm text-ink-500">You have not sent any applications yet.</div>
          )}
        </div>
      )}
    </div>
  );
}
