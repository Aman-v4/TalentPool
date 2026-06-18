import { ArrowRight, FolderKanban } from "lucide-react";
import { Link } from "react-router-dom";
import { Badge } from "../../components/ui/Badge";
import { PageHeader } from "../../components/ui/PageHeader";
import { useTalentPool } from "../../state/TalentPoolContext";
import { formatDate } from "../../utils/date";

export function ConsultantMyPoolsPage() {
  const { getActiveMembershipsForPool, getConsultantApplications, getConsultantPools, getPool } = useTalentPool();
  const pools = getConsultantPools();
  const applications = getConsultantApplications().filter((a) => a.status === "Pending");

  return (
    <div className="space-y-8">
      <PageHeader eyebrow="Membership" title="My Talent Pools" />

      {applications.length > 0 && (
        <section className="panel p-5">
          <h2 className="text-lg font-bold text-ink-900">Pending applications</h2>
          <div className="mt-4 space-y-3">
            {applications.map((application) => {
              const pool = getPool(application.poolId);
              return (
                <div key={application.id} className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-amber-200 bg-amber-50/50 p-4">
                  <div>
                    <p className="font-semibold text-ink-900">{pool?.name ?? "Talent pool"}</p>
                    <p className="text-sm text-ink-500">Submitted {formatDate(application.submittedAt)} · {application.matchScore}% match</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge tone="amber">Pending review</Badge>
                    {pool && (
                      <Link to={`/consultant/pools/${pool.id}`} className="text-sm font-semibold text-brand-700 hover:underline">
                        View pool
                      </Link>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      <div className="grid gap-5 lg:grid-cols-2">
        {pools.map((pool) => {
          const members = getActiveMembershipsForPool(pool.id);
          return (
            <Link key={pool.id} to={`/consultant/pools/${pool.id}`} className="panel block p-5 transition hover:-translate-y-0.5 hover:shadow-panel">
              <div className="flex items-start gap-3">
                <div className="rounded-lg bg-brand-50 p-3 text-brand-700">
                  <FolderKanban className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <h2 className="text-lg font-bold text-ink-900">{pool.name}</h2>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Badge tone="success">Active member</Badge>
                    <Badge tone="neutral">{members.length} members</Badge>
                  </div>
                </div>
                <ArrowRight className="h-5 w-5 shrink-0 text-brand-600" />
              </div>
            </Link>
          );
        })}
      </div>

      {pools.length === 0 && (
        <div className="panel px-5 py-12 text-center text-sm text-ink-500">
          You are not enrolled in any talent pools yet. <Link to="/consultant" className="font-semibold text-brand-700 hover:underline">Discover pools</Link> to apply.
        </div>
      )}
    </div>
  );
}
