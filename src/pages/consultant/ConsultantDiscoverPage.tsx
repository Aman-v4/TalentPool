import { ArrowRight, Compass } from "lucide-react";
import { Link } from "react-router-dom";
import { Badge } from "../../components/ui/Badge";
import { PageHeader } from "../../components/ui/PageHeader";
import { useTalentPool } from "../../state/TalentPoolContext";

export function ConsultantDiscoverPage() {
  const { consultantProfile, getDiscoverablePools, getPoolMatchScore, hasConsultantAppliedToPool } = useTalentPool();
  const pools = getDiscoverablePools();

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Discover"
        title="Talent pools for you"
        actions={<Badge tone="blue">{consultantProfile.skills.length} skills on profile</Badge>}
      />

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
          No open public pools match your profile right now. Check back later or update your skills.
        </div>
      )}
    </div>
  );
}
