import { ArrowLeft, BriefcaseBusiness, Link2, Mail, MapPin, Star } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { InviteToPoolButton } from "../components/talent/InviteToPoolModal";
import { Avatar } from "../components/ui/Avatar";
import { Badge } from "../components/ui/Badge";
import { EmptyState } from "../components/ui/EmptyState";
import { ProgressBar } from "../components/ui/ProgressBar";
import { StatusBadge } from "../components/ui/Status";
import { useTalentPool } from "../state/TalentPoolContext";
import { formatDate } from "../utils/date";

export function ProfessionalProfilePage() {
  const { professionalId } = useParams();
  const { getPoolsForProfessional, getProfessional, getTask, tasks } = useTalentPool();
  const professional = getProfessional(professionalId);

  if (!professional) {
    return <EmptyState icon={Star} title="Professional not found" body="The selected professional profile is not available." />;
  }

  const pools = getPoolsForProfessional(professional.id);
  const activeTasks = professional.activeTaskIds.map((taskId) => getTask(taskId)).filter(Boolean);
  const historicTasks = tasks.filter((task) => task.assignmentHistory.some((history) => history.professionalId === professional.id));

  return (
    <div className="space-y-6">
      <Link to="/members" className="inline-flex items-center gap-2 text-sm font-semibold text-ink-600 hover:text-ink-900">
        <ArrowLeft className="h-4 w-4" />
        Back to Members
      </Link>

      <section className="panel p-5">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex min-w-0 gap-4">
            <Avatar initials={professional.avatar} src={professional.photoUrl} size="lg" />
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl font-bold text-ink-900">{professional.name}</h1>
                <Badge tone={professional.availability === "Available" ? "success" : professional.availability === "Fully Occupied" ? "coral" : "amber"}>
                  {professional.availability}
                </Badge>
              </div>
              <p className="mt-1 text-sm font-semibold text-ink-600">{professional.title}</p>
              <p className="mt-1 flex items-center gap-1.5 text-sm text-ink-500">
                <MapPin className="h-4 w-4 shrink-0" />
                {professional.location} · {professional.timeZone}
              </p>
              <p className="mt-1 flex items-center gap-1.5 text-sm text-brand-700">
                <Mail className="h-4 w-4 shrink-0" />
                {professional.email}
              </p>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-ink-600">{professional.bio}</p>
            </div>
          </div>
          <InviteToPoolButton professional={professional} className="shrink-0" />
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-4">
          <Stat label="Rating" value={professional.rating.toFixed(1)} />
          <Stat label="Active tasks" value={String(activeTasks.length)} />
          <Stat label="Completion" value={`${professional.completionRate}%`} />
          <Stat label="On-time" value={`${professional.onTimeRate}%`} />
        </div>
      </section>

      <section className="panel border-brand-200 bg-brand-50/40 p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <Link2 className="h-5 w-5 text-brand-600" />
              <h2 className="text-lg font-bold text-ink-900">Talent Pool membership</h2>
            </div>
            <p className="mt-1 text-sm text-ink-600">
              {pools.length > 0
                ? `This member is part of ${pools.length} Talent Pool${pools.length !== 1 ? "s" : ""}:`
                : "This member is not part of any Talent Pool yet."}
            </p>
          </div>
          <Badge tone="blue">{pools.length} pool{pools.length !== 1 ? "s" : ""}</Badge>
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {pools.length > 0 ? (
            pools.map((pool) => (
              <Link
                key={pool.id}
                to={`/talent-pools/${pool.id}`}
                className="rounded-lg border border-brand-200 bg-white p-4 transition hover:border-brand-400 hover:shadow-sm"
              >
                <p className="font-bold text-ink-900">{pool.name}</p>
                <p className="mt-1 line-clamp-2 text-xs leading-5 text-ink-500">{pool.description}</p>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  <StatusBadge status={pool.intakeStatus} />
                  {pool.requiredSkills.slice(0, 2).map((skill) => <Badge key={skill}>{skill}</Badge>)}
                </div>
              </Link>
            ))
          ) : (
            <div className="col-span-full rounded-lg border border-dashed border-brand-200 bg-white p-6 text-center text-sm text-ink-500">
              Use <span className="font-semibold text-brand-700">Invite to Talent Pool</span> to add this member to an existing pool.
            </div>
          )}
        </div>
      </section>

      <div className="grid gap-5 lg:grid-cols-2">
        <section className="panel p-5">
          <h2 className="text-lg font-bold text-ink-900">Skills</h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {professional.skills.map((skill) => <Badge key={skill}>{skill}</Badge>)}
          </div>
          <div className="mt-5 rounded-lg border border-ink-200 bg-ink-50 p-4">
            <p className="text-xs font-bold uppercase tracking-[0.12em] text-ink-400">Portfolio</p>
            <p className="mt-1 text-sm font-medium text-brand-700">{professional.portfolio}</p>
            <p className="mt-2 text-xs text-ink-500">Resume: {professional.resumeAvailable ? "Available" : "Not provided"}</p>
          </div>
        </section>

        <section className="panel p-5">
          <h2 className="text-lg font-bold text-ink-900">Credibility profile</h2>
          <div className="mt-4 space-y-4">
            <Score label="Task completion rate" value={professional.completionRate} />
            <Score label="On-time delivery rate" value={professional.onTimeRate} />
            <Score label="Communication score" value={Math.round(professional.communicationScore * 20)} />
          </div>
        </section>
      </div>

      <section className="panel p-5">
        <div className="flex items-center gap-2">
          <BriefcaseBusiness className="h-5 w-5 text-brand-600" />
          <h2 className="text-lg font-bold text-ink-900">Assignment history</h2>
          <Badge tone="neutral">{historicTasks.length}</Badge>
        </div>
        {historicTasks.length > 0 ? (
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {historicTasks.map((task) => (
              <Link
                key={task.id}
                to={`/tasks/${task.id}`}
                className="rounded-lg border border-ink-200 p-4 transition hover:border-brand-300 hover:bg-brand-50"
              >
                <p className="font-semibold text-ink-900">{task.title}</p>
                <p className="mt-1 text-xs text-ink-500">Created {formatDate(task.createdAt)}</p>
                <div className="mt-2">
                  <StatusBadge status={task.status} />
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <p className="mt-4 text-sm text-ink-500">No assignment history recorded yet.</p>
        )}
      </section>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-ink-50 px-4 py-3">
      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-ink-400">{label}</p>
      <p className="mt-1 text-xl font-bold text-ink-900">{value}</p>
    </div>
  );
}

function Score({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <div className="mb-1.5 flex justify-between text-xs font-semibold text-ink-500">
        <span>{label}</span>
        <span>{value}%</span>
      </div>
      <ProgressBar value={value} />
    </div>
  );
}
