import { Filter, Search } from "lucide-react";
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Avatar } from "../components/ui/Avatar";
import { Badge } from "../components/ui/Badge";
import { PageHeader } from "../components/ui/PageHeader";
import { StatusBadge } from "../components/ui/Status";
import { useTalentPool } from "../state/TalentPoolContext";
import type { ApplicationStatus } from "../types";
import { formatDate, resolveApplicationStatus } from "../utils/date";

const STATUS_FILTERS: Array<ApplicationStatus | "All"> = [
  "All",
  "Pending",
  "Approved",
  "Rejected",
  "Withdrawn",
  "Cancelled",
  "Expired",
];

export function ApplicationsPage() {
  const { applications, getPool, getProfessional, talentPools } = useTalentPool();
  const [statusFilter, setStatusFilter] = useState<ApplicationStatus | "All">("All");
  const [poolFilter, setPoolFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  const poolTabs = useMemo(
    () => [
      { id: "all", label: "All pools", count: applications.length },
      ...talentPools
        .filter((pool) => !pool.archived)
        .map((pool) => ({
          id: pool.id,
          label: pool.name,
          count: applications.filter((application) => application.poolId === pool.id).length,
        })),
    ],
    [applications, talentPools],
  );

  const filteredApplications = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return applications.filter((application) => {
      const resolvedStatus = resolveApplicationStatus(application);
      const matchesStatus = statusFilter === "All" || resolvedStatus === statusFilter;
      const matchesPool = poolFilter === "all" || application.poolId === poolFilter;
      if (!matchesStatus || !matchesPool) return false;
      if (!query) return true;

      const professional = getProfessional(application.professionalId);
      const pool = getPool(application.poolId);
      const haystack = [
        professional?.name,
        professional?.title,
        pool?.name,
        application.description,
        application.submissionDetails,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return haystack.includes(query);
    });
  }, [applications, getPool, getProfessional, poolFilter, searchQuery, statusFilter]);

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Membership pipeline"
        title="Applications"
        actions={
          <label className="focus-ring inline-flex items-center gap-2 rounded-lg border border-ink-200 bg-white px-3 py-2 text-sm font-semibold text-ink-700 shadow-sm">
            <Filter className="h-4 w-4 text-ink-400" />
            <select
              className="bg-transparent text-sm font-semibold text-ink-700 outline-none"
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value as ApplicationStatus | "All")}
            >
              {STATUS_FILTERS.map((status) => (
                <option key={status} value={status}>
                  {status === "All" ? "All statuses" : status}
                </option>
              ))}
            </select>
          </label>
        }
      />

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-2 rounded-lg border border-ink-200 bg-white p-2 shadow-sm">
          {poolTabs.map((tab) => (
            <button
              key={tab.id}
              className={`focus-ring rounded-lg px-4 py-2 text-sm font-bold transition ${
                poolFilter === tab.id ? "bg-ink-900 text-white shadow-soft" : "text-ink-600 hover:bg-ink-50 hover:text-ink-900"
              }`}
              onClick={() => setPoolFilter(tab.id)}
            >
              {tab.label}
              <span className={`ml-2 text-xs ${poolFilter === tab.id ? "text-white/80" : "text-ink-400"}`}>{tab.count}</span>
            </button>
          ))}
        </div>
        <label className="focus-ring inline-flex w-full items-center gap-2 rounded-lg border border-ink-200 bg-white px-3 py-2 text-sm font-semibold text-ink-700 shadow-sm sm:w-72">
          <Search className="h-4 w-4 shrink-0 text-ink-400" />
          <input
            className="w-full bg-transparent text-sm font-medium text-ink-700 outline-none placeholder:text-ink-400"
            placeholder="Search applicants..."
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
          />
        </label>
      </div>

      {filteredApplications.length > 0 ? (
        <div className="grid gap-5 lg:grid-cols-2">
          {filteredApplications.map((application) => {
            const professional = getProfessional(application.professionalId);
            const pool = getPool(application.poolId);
            const resolvedStatus = resolveApplicationStatus(application);

            return (
              <Link
                key={application.id}
                to={`/applications/${application.id}`}
                className="panel block p-5 transition hover:-translate-y-0.5 hover:shadow-panel"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <Avatar initials={professional?.avatar ?? "NA"} src={professional?.photoUrl} size="lg" />
                    <div className="min-w-0">
                      <p className="font-bold text-ink-900">{professional?.name}</p>
                      <p className="truncate text-sm text-ink-500">{professional?.title}</p>
                    </div>
                  </div>
                  <StatusBadge status={resolvedStatus} />
                </div>

                <div className="mt-4 flex flex-wrap items-center gap-2">
                  <Badge tone="blue">{pool?.name}</Badge>
                  <Badge tone="neutral">{application.matchScore}% match</Badge>
                </div>

                <p className="mt-3 line-clamp-2 text-sm leading-6 text-ink-600">{application.description}</p>

                <p className="mt-4 text-xs font-medium text-ink-400">Submitted {formatDate(application.submittedAt)}</p>

                {application.rejectionReason && (
                  <div className="mt-3 rounded-lg bg-coral-50 px-3 py-2 text-sm text-coral-500">
                    Rejection reason: {application.rejectionReason}
                  </div>
                )}
              </Link>
            );
          })}
        </div>
      ) : (
        <div className="panel px-5 py-12 text-center text-sm text-ink-500">
          No applications match the selected filters.
        </div>
      )}

      {statusFilter !== "All" && filteredApplications.length > 0 && (
        <div className="flex justify-end">
          <Badge tone="blue">{filteredApplications.length} shown · {statusFilter}</Badge>
        </div>
      )}
    </div>
  );
}
