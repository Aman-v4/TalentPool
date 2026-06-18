import { SlidersHorizontal, X } from "lucide-react";
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Avatar } from "../components/ui/Avatar";
import { Badge } from "../components/ui/Badge";
import { PageHeader } from "../components/ui/PageHeader";
import { ProgressBar } from "../components/ui/ProgressBar";
import { useTalentPool } from "../state/TalentPoolContext";
import type { Availability } from "../types";

const AVAILABILITY_OPTIONS: Array<Availability | "All"> = ["All", "Available", "Partially Available", "Fully Occupied"];
const RATING_OPTIONS = [
  { label: "Any rating", value: 0 },
  { label: "4.0+", value: 4 },
  { label: "4.5+", value: 4.5 },
  { label: "4.8+", value: 4.8 },
];

export function MembersPage() {
  const { getPoolsForProfessional, professionals, talentPools } = useTalentPool();
  const [showFilters, setShowFilters] = useState(false);
  const [poolFilter, setPoolFilter] = useState("All");
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [availabilityFilter, setAvailabilityFilter] = useState<Availability | "All">("All");
  const [minRating, setMinRating] = useState(0);

  const allSkills = useMemo(
    () => [...new Set(professionals.flatMap((professional) => professional.skills))].sort(),
    [professionals]
  );

  const filteredProfessionals = useMemo(() => {
    return professionals.filter((professional) => {
      const pools = getPoolsForProfessional(professional.id);

      if (poolFilter !== "All" && !pools.some((pool) => pool.id === poolFilter)) return false;
      if (availabilityFilter !== "All" && professional.availability !== availabilityFilter) return false;
      if (minRating > 0 && professional.rating < minRating) return false;
      if (selectedSkills.length > 0 && !selectedSkills.every((skill) => professional.skills.includes(skill))) return false;

      return true;
    });
  }, [availabilityFilter, getPoolsForProfessional, minRating, poolFilter, professionals, selectedSkills]);

  const activeFilterCount = [
    poolFilter !== "All",
    selectedSkills.length > 0,
    availabilityFilter !== "All",
    minRating > 0,
  ].filter(Boolean).length;

  const toggleSkill = (skill: string) => {
    setSelectedSkills((current) =>
      current.includes(skill) ? current.filter((item) => item !== skill) : [...current, skill]
    );
  };

  const clearFilters = () => {
    setPoolFilter("All");
    setSelectedSkills([]);
    setAvailabilityFilter("All");
    setMinRating(0);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Directory"
        title="Members"
        actions={
          <button
            onClick={() => setShowFilters((current) => !current)}
            className="focus-ring inline-flex items-center gap-2 rounded-lg border border-ink-200 bg-white px-4 py-2 text-sm font-semibold text-ink-700 shadow-sm"
          >
            <SlidersHorizontal className="h-4 w-4" />
            Filters
            {activeFilterCount > 0 && (
              <span className="rounded-full bg-brand-600 px-2 py-0.5 text-xs font-bold text-white">{activeFilterCount}</span>
            )}
          </button>
        }
      />

      {showFilters && (
        <section className="panel p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-sm font-bold uppercase tracking-widest text-ink-400">Filter members</h2>
            {activeFilterCount > 0 && (
              <button onClick={clearFilters} className="text-sm font-semibold text-brand-700 hover:text-brand-800">
                Clear all
              </button>
            )}
          </div>

          <div className="mt-4 grid gap-4 lg:grid-cols-3">
            <label className="block">
              <span className="text-sm font-semibold text-ink-700">Talent Pool</span>
              <select
                className="modal-input mt-2"
                value={poolFilter}
                onChange={(event) => setPoolFilter(event.target.value)}
              >
                <option value="All">All pools</option>
                {talentPools.filter((pool) => !pool.archived).map((pool) => (
                  <option key={pool.id} value={pool.id}>{pool.name}</option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className="text-sm font-semibold text-ink-700">Availability</span>
              <select
                className="modal-input mt-2"
                value={availabilityFilter}
                onChange={(event) => setAvailabilityFilter(event.target.value as Availability | "All")}
              >
                {AVAILABILITY_OPTIONS.map((option) => (
                  <option key={option} value={option}>{option === "All" ? "Any availability" : option}</option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className="text-sm font-semibold text-ink-700">Minimum rating</span>
              <select
                className="modal-input mt-2"
                value={minRating}
                onChange={(event) => setMinRating(Number(event.target.value))}
              >
                {RATING_OPTIONS.map((option) => (
                  <option key={option.label} value={option.value}>{option.label}</option>
                ))}
              </select>
            </label>
          </div>

          <div className="mt-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-sm font-semibold text-ink-700">Skills</span>
              {selectedSkills.length > 0 && (
                <button
                  onClick={() => setSelectedSkills([])}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-ink-500 hover:text-ink-700"
                >
                  <X className="h-3 w-3" />
                  Clear skills
                </button>
              )}
            </div>
            <div className="mt-2 flex flex-wrap gap-2">
              {allSkills.map((skill) => {
                const active = selectedSkills.includes(skill);
                return (
                  <button
                    key={skill}
                    type="button"
                    onClick={() => toggleSkill(skill)}
                    className={`rounded-lg border px-3 py-1.5 text-xs font-semibold transition ${
                      active
                        ? "border-brand-300 bg-brand-50 text-brand-700"
                        : "border-ink-200 bg-white text-ink-600 hover:border-brand-200 hover:bg-brand-50"
                    }`}
                  >
                    {skill}
                  </button>
                );
              })}
            </div>
            <p className="mt-2 text-xs text-ink-500">Select multiple skills — members must match all selected skills.</p>
          </div>
        </section>
      )}

      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-ink-500">
          Showing <span className="font-semibold text-ink-900">{filteredProfessionals.length}</span> of {professionals.length} members
        </p>
        {activeFilterCount > 0 && <Badge tone="blue">{activeFilterCount} filter{activeFilterCount !== 1 ? "s" : ""} active</Badge>}
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        {filteredProfessionals.length > 0 ? (
          filteredProfessionals.map((professional) => {
            const pools = getPoolsForProfessional(professional.id);

            return (
              <Link
                key={professional.id}
                to={`/professionals/${professional.id}`}
                className="panel block p-4 transition hover:-translate-y-0.5 hover:border-brand-300 hover:shadow-panel"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <Avatar initials={professional.avatar} src={professional.photoUrl} />
                    <div className="min-w-0">
                      <h2 className="font-bold text-ink-900">{professional.name}</h2>
                      <p className="truncate text-sm text-ink-500">{professional.title}</p>
                      <p className="mt-0.5 text-xs text-ink-400">{professional.location}</p>
                    </div>
                  </div>
                  <Badge tone={professional.availability === "Available" ? "success" : professional.availability === "Fully Occupied" ? "coral" : "amber"}>
                    {professional.availability}
                  </Badge>
                </div>

                <div className="mt-3 rounded-lg border border-brand-100 bg-brand-50/60 px-3 py-2">
                  <p className="text-xs font-bold uppercase tracking-[0.12em] text-brand-700">Talent Pool membership</p>
                  <div className="mt-1.5 flex flex-wrap gap-1.5">
                    {pools.length > 0 ? (
                      pools.map((pool) => <Badge key={pool.id} tone="blue">{pool.name}</Badge>)
                    ) : (
                      <span className="text-xs text-ink-500">Not a member of any pool yet</span>
                    )}
                  </div>
                </div>

                <div className="mt-3 flex flex-wrap gap-1.5">
                  {professional.skills.slice(0, 4).map((skill) => <Badge key={skill}>{skill}</Badge>)}
                  {professional.skills.length > 4 && <Badge tone="neutral">+{professional.skills.length - 4}</Badge>}
                </div>

                <div className="mt-3 grid grid-cols-3 gap-2 text-center">
                  <div className="rounded-lg bg-ink-50 px-2 py-2">
                    <p className="text-xs text-ink-400">Rating</p>
                    <p className="text-sm font-bold text-ink-900">{professional.rating.toFixed(1)}</p>
                  </div>
                  <div className="rounded-lg bg-ink-50 px-2 py-2">
                    <p className="text-xs text-ink-400">Pools</p>
                    <p className="text-sm font-bold text-ink-900">{pools.length}</p>
                  </div>
                  <div className="rounded-lg bg-ink-50 px-2 py-2">
                    <p className="text-xs text-ink-400">Tasks</p>
                    <p className="text-sm font-bold text-ink-900">{professional.activeTaskIds.length}</p>
                  </div>
                </div>

                <div className="mt-3">
                  <div className="mb-1 flex justify-between text-xs font-semibold text-ink-500">
                    <span>Completion</span>
                    <span>{professional.completionRate}%</span>
                  </div>
                  <ProgressBar value={professional.completionRate} />
                </div>
              </Link>
            );
          })
        ) : (
          <div className="col-span-full panel p-10 text-center text-sm text-ink-500">
            No members match the selected filters.
          </div>
        )}
      </div>
    </div>
  );
}
