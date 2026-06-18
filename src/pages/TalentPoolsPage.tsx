import { Archive, ChevronRight, Filter, Mail, Megaphone, MoreHorizontal, Plus, Search, Users } from "lucide-react";
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ApplicationReviewList } from "../components/talent/ApplicationReviewList";
import { ProfileSlideOver } from "../components/profile/ProfileSlideOver";
import { Avatar } from "../components/ui/Avatar";
import { Badge } from "../components/ui/Badge";
import { MetricCard } from "../components/ui/MetricCard";
import { PageHeader } from "../components/ui/PageHeader";
import { PillTabs } from "../components/ui/PillTabs";
import { PoolIcon } from "../components/ui/PoolIcon";
import { useTalentPool } from "../state/TalentPoolContext";
import type { Professional } from "../types";
import { getCredibilityScore } from "../utils/credibility";
import { resolveApplicationStatus } from "../utils/date";

type TalentPoolTab = "active-pools" | "members" | "applications";
type PoolFilter = "active" | "archived" | "all";

const tabs: Array<{ id: TalentPoolTab; label: string }> = [
  { id: "active-pools", label: "Active Pools" },
  { id: "members", label: "Members" },
  { id: "applications", label: "Applications" },
];

export function TalentPoolsPage() {
  const { applications, getActiveMembershipsForPool, getPoolsForProfessional, invitations, professionals, talentPools } = useTalentPool();
  const [activeTab, setActiveTab] = useState<TalentPoolTab>("active-pools");
  const [poolFilter, setPoolFilter] = useState<PoolFilter>("active");
  const [search, setSearch] = useState("");
  const [applicationPoolFilter, setApplicationPoolFilter] = useState("all");
  const [profilePreview, setProfilePreview] = useState<Professional | null>(null);

  const activePools = talentPools.filter((pool) => !pool.archived);
  const archivedPools = talentPools.filter((pool) => pool.archived);
  const displayedPools = useMemo(() => {
    let source = talentPools;
    if (poolFilter === "active") source = activePools;
    if (poolFilter === "archived") source = archivedPools;
    const query = search.trim().toLowerCase();
    if (!query) return source;
    return source.filter((pool) => pool.name.toLowerCase().includes(query) || pool.description.toLowerCase().includes(query));
  }, [activePools, archivedPools, poolFilter, search, talentPools]);

  const totalMembers = talentPools.reduce((sum, pool) => sum + getActiveMembershipsForPool(pool.id).length, 0);
  const pendingApplications = applications.filter((application) => resolveApplicationStatus(application) === "Pending");
  const pendingInvitations = invitations.filter((invitation) => invitation.status === "Pending");

  const filteredPendingApplications = useMemo(() => {
    if (applicationPoolFilter === "all") return pendingApplications;
    return pendingApplications.filter((application) => application.poolId === applicationPoolFilter);
  }, [applicationPoolFilter, pendingApplications]);

  const applicationPoolTabs = useMemo(
    () => [
      { id: "all", label: "All pools", count: pendingApplications.length },
      ...activePools.map((pool) => ({
        id: pool.id,
        label: pool.name,
        count: pendingApplications.filter((application) => application.poolId === pool.id).length,
      })).filter((tab) => tab.count > 0),
    ],
    [activePools, pendingApplications],
  );

  return (
    <div className="space-y-8">
      <PageHeader
        title="Talent Pool"
        description="Build and manage your reusable network of trusted professionals."
        actions={
          <Link to="/talent-pools/new" className="btn-primary">
            <Plus className="h-4 w-4" />
            Create Talent Pool
          </Link>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Active Pools" value={String(activePools.length)} detail={`${archivedPools.length} archived`} icon={Archive} accent="brand" />
        <MetricCard label="Total Members" value={String(totalMembers)} detail="Across all talent pools" icon={Users} accent="blue" />
        <MetricCard label="Pending Applications" value={String(pendingApplications.length)} detail="Awaiting your review" icon={Megaphone} accent="amber" />
        <MetricCard label="Pending Invitations" value={String(pendingInvitations.length)} detail="Sent to professionals" icon={Mail} accent="coral" />
      </div>

      <PillTabs tabs={tabs} active={activeTab} onChange={setActiveTab} />

      {activeTab === "active-pools" && (
        <>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <label className="focus-ring inline-flex items-center gap-2 rounded-lg border border-ink-200 bg-white px-3 py-2 text-sm font-semibold text-ink-700 shadow-sm">
              <Filter className="h-4 w-4 text-ink-400" />
              <select
                className="bg-transparent text-sm font-semibold text-ink-700 outline-none"
                value={poolFilter}
                onChange={(event) => setPoolFilter(event.target.value as PoolFilter)}
              >
                <option value="active">Active pools ({activePools.length})</option>
                <option value="archived">Archived pools ({archivedPools.length})</option>
                <option value="all">All pools ({talentPools.length})</option>
              </select>
            </label>
            <div className="search-pill max-w-xs">
              <Search className="h-4 w-4 shrink-0" />
              <input
                className="w-full bg-transparent text-sm text-ink-900 outline-none placeholder:text-ink-400"
                placeholder="Search pools..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {displayedPools.map((pool) => {
              const members = getActiveMembershipsForPool(pool.id);
              const visibleSkills = pool.requiredSkills.slice(0, 3);
              const extraSkills = pool.requiredSkills.length - visibleSkills.length;
              const poolPending = pendingApplications.filter((application) => application.poolId === pool.id).length;

              return (
                <Link key={pool.id} to={`/talent-pools/${pool.id}`} className="panel block p-5 transition hover:-translate-y-0.5 hover:shadow-panel">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex min-w-0 items-start gap-3">
                      <PoolIcon name={pool.name} size="sm" />
                      <div className="min-w-0">
                        <h2 className="text-lg font-bold text-ink-900">{pool.name}</h2>
                        <p className="mt-2 line-clamp-2 text-sm leading-6 text-ink-500">{pool.description}</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      className="rounded-full p-1.5 text-ink-400 hover:bg-ink-50"
                      aria-label="Pool options"
                      onClick={(event) => event.preventDefault()}
                    >
                      <MoreHorizontal className="h-5 w-5" />
                    </button>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2">
                    {visibleSkills.map((skill) => <span key={skill} className="tag-pill">{skill}</span>)}
                    {extraSkills > 0 && <span className="tag-pill">+{extraSkills} more</span>}
                  </div>

                  <div className="mt-5 flex items-center justify-between border-t border-ink-100 pt-4">
                    <div className="flex flex-wrap gap-2 text-sm text-ink-500">
                      <span>{members.length} members</span>
                      {poolPending > 0 && <Badge tone="amber">{poolPending} pending</Badge>}
                    </div>
                    <span className="inline-flex items-center gap-1 text-sm font-semibold text-brand-600">
                      View pool
                      <ChevronRight className="h-4 w-4" />
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        </>
      )}

      {activeTab === "members" && (
        <div className="grid gap-5 md:grid-cols-2">
          {professionals.map((professional) => {
            const pools = getPoolsForProfessional(professional.id);
            const credibility = getCredibilityScore(professional);
            return (
              <button
                key={professional.id}
                type="button"
                className="panel block w-full p-5 text-left transition hover:shadow-panel"
                onClick={() => setProfilePreview(professional)}
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="flex min-w-0 items-center gap-4">
                    <Avatar initials={professional.avatar} src={professional.photoUrl} size="lg" />
                    <div className="min-w-0">
                      <h2 className="text-lg font-bold text-ink-900">{professional.name}</h2>
                      <p className="text-sm text-ink-500">{professional.title}</p>
                      <p className="mt-1 text-xs text-ink-400">{professional.location} · {professional.timeZone}</p>
                    </div>
                  </div>
                  <Badge tone={professional.availability === "Available" ? "success" : professional.availability === "Fully Occupied" ? "coral" : "amber"}>
                    {professional.availability}
                  </Badge>
                </div>
                <div className="mt-4 flex flex-wrap items-center gap-2">
                  <Badge tone="blue">Credibility {credibility}/100</Badge>
                  {pools.map((pool) => <Badge key={pool.id} tone="neutral">{pool.name}</Badge>)}
                </div>
              </button>
            );
          })}
        </div>
      )}

      {activeTab === "applications" && (
        <section className="panel p-5">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold text-ink-900">Pending Applications</h2>
              <p className="mt-1 text-sm text-ink-500">Centralized view of all pending applications across all Talent Pools.</p>
            </div>
            <Badge tone="amber">{pendingApplications.length} pending</Badge>
          </div>

          <div className="mb-5 flex flex-wrap gap-2">
            {applicationPoolTabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                className={`rounded-lg px-4 py-2 text-sm font-bold transition ${applicationPoolFilter === tab.id ? "bg-ink-900 text-white" : "bg-ink-50 text-ink-600 hover:bg-ink-100"}`}
                onClick={() => setApplicationPoolFilter(tab.id)}
              >
                {tab.label}
                <span className="ml-2 text-xs opacity-80">{tab.count}</span>
              </button>
            ))}
          </div>

          <ApplicationReviewList
            applications={filteredPendingApplications}
            poolId={applicationPoolFilter === "all" ? undefined : applicationPoolFilter}
            emptyMessage="No pending applications across Talent Pools."
          />
        </section>
      )}

      {profilePreview && <ProfileSlideOver professional={profilePreview} onClose={() => setProfilePreview(null)} />}
    </div>
  );
}
