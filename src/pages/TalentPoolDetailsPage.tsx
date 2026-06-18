import {
  Briefcase,
  CalendarDays,
  Edit3,
  FolderOpen,
  LockKeyhole,
  MapPin,
  MoreHorizontal,
  Unlock,
  UserPlus,
  Users,
} from "lucide-react";
import { useState } from "react";
import type { ReactNode } from "react";
import { Link, useParams } from "react-router-dom";
import { ApplicationReviewList } from "../components/talent/ApplicationReviewList";
import { InviteProfessionalModal } from "../components/talent/InviteProfessionalModal";
import { ProfileSlideOver } from "../components/profile/ProfileSlideOver";
import { Avatar } from "../components/ui/Avatar";
import { Badge } from "../components/ui/Badge";
import { Breadcrumbs } from "../components/ui/Breadcrumbs";
import { EmptyState } from "../components/ui/EmptyState";
import { PillTabs } from "../components/ui/PillTabs";
import { PoolIcon } from "../components/ui/PoolIcon";
import { StatusBadge } from "../components/ui/Status";
import { useTalentPool } from "../state/TalentPoolContext";
import type { Professional } from "../types";
import { getCredibilityScore } from "../utils/credibility";
import { formatDate } from "../utils/date";

type PoolTab = "related-work" | "members" | "applications";

export function TalentPoolDetailsPage() {
  const { poolId } = useParams();
  const [activeTab, setActiveTab] = useState<PoolTab>("related-work");
  const [inviteOpen, setInviteOpen] = useState(false);
  const [profilePreview, setProfilePreview] = useState<Professional | null>(null);
  const {
    applications,
    closeTalentPool,
    openTalentPool,
    getActiveMembershipsForPool,
    getProfessional,
    getPool,
    getWorkspace,
    milestones,
    tasks,
  } = useTalentPool();
  const pool = poolId ? getPool(poolId) : undefined;

  if (!pool) {
    return <EmptyState icon={FolderOpen} title="Pool not found" body="The selected Talent Pool is not available in this prototype data set." />;
  }

  const memberships = getActiveMembershipsForPool(pool.id);
  const memberIds = new Set(memberships.map((membership) => membership.professionalId));
  const poolApplications = applications.filter((application) => application.poolId === pool.id);
  const relatedTasks = tasks.filter((task) => task.activeAssigneeId && memberIds.has(task.activeAssigneeId));
  const relatedMilestoneRows = milestones
    .map((milestone) => {
      const parentTask = relatedTasks.find((task) => task.id === milestone.taskId);
      return parentTask ? { milestone, parentTask } : null;
    })
    .filter((row): row is { milestone: typeof milestones[number]; parentTask: typeof tasks[number] } => Boolean(row));

  return (
    <div className="space-y-6">
      <Breadcrumbs items={[{ label: "Talent Pool", href: "/talent-pools" }, { label: pool.name }]} />

      <section className="panel p-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex min-w-0 gap-4">
            <PoolIcon name={pool.name} size="lg" />
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-2xl font-bold text-ink-900 md:text-3xl">{pool.name}</h1>
                <Badge tone={pool.intakeStatus === "Open" ? "success" : "coral"}>
                  <span className="mr-1.5 inline-block h-1.5 w-1.5 rounded-full bg-current" />
                  {pool.intakeStatus === "Open" ? "Active" : pool.intakeStatus}
                </Badge>
                <span className="text-sm text-ink-500">{memberships.length} members</span>
              </div>
              <p className="mt-3 max-w-3xl text-sm leading-7 text-ink-500">{pool.description}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {pool.requiredSkills.map((skill) => <span key={skill} className="tag-pill">{skill}</span>)}
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {pool.intakeStatus === "Closed" ? (
              <button className="btn-outline" onClick={() => openTalentPool(pool.id)}>
                <Unlock className="h-4 w-4" />
                Open for applications
              </button>
            ) : null}
            <Link to={`/talent-pools/${pool.id}/edit`} className="btn-outline">
              <Edit3 className="h-4 w-4" />
              Edit
            </Link>
            <button type="button" className="btn-primary" onClick={() => setInviteOpen(true)}>
              <UserPlus className="h-4 w-4" />
              Invite Professional
            </button>
            {pool.intakeStatus === "Open" && (
              <details className="relative">
                <summary className="focus-ring flex h-10 w-10 cursor-pointer list-none items-center justify-center rounded-full border border-ink-200 bg-white text-ink-600 shadow-soft" aria-label="Pool actions">
                  <MoreHorizontal className="h-5 w-5" />
                </summary>
                <div className="absolute right-0 top-12 z-30 w-64 rounded-2xl border border-ink-100 bg-white p-2 shadow-panel">
                  <button
                    className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm font-semibold text-coral-500 hover:bg-coral-50"
                    onClick={() => closeTalentPool(pool.id)}
                  >
                    <LockKeyhole className="h-4 w-4" />
                    Close pool to new applications
                  </button>
                </div>
              </details>
            )}
          </div>
        </div>
      </section>

      <PillTabs
        tabs={[
          { id: "related-work" as PoolTab, label: "Related Work", icon: <Briefcase className="h-4 w-4" />, count: relatedTasks.length + relatedMilestoneRows.length },
          { id: "members" as PoolTab, label: "Members", icon: <Users className="h-4 w-4" />, count: memberships.length },
          { id: "applications" as PoolTab, label: "Applications", icon: <FolderOpen className="h-4 w-4" />, count: poolApplications.length },
        ]}
        active={activeTab}
        onChange={setActiveTab}
      />

      {activeTab === "related-work" && (
        <section className="panel overflow-hidden p-0">
          <div className="divide-y divide-ink-100">
            {relatedTasks.map((task) => {
              const assignee = getProfessional(task.activeAssigneeId);
              const workspace = getWorkspace(task.workspaceId);
              return (
                <RelatedWorkRow
                  key={`task-${task.id}`}
                  href={`/tasks/${task.id}`}
                  name={task.title}
                  type="Task"
                  workspaceName={workspace?.name ?? "Unknown workspace"}
                  assigneeName={assignee?.name ?? "Unassigned"}
                  status={<StatusBadge status={task.status} />}
                  dueDate={task.deadline}
                />
              );
            })}
            {relatedMilestoneRows.map(({ milestone, parentTask }) => {
              const assignee = getProfessional(parentTask.activeAssigneeId);
              const workspace = getWorkspace(parentTask.workspaceId);
              return (
                <RelatedWorkRow
                  key={`milestone-${milestone.id}`}
                  href={`/tasks/${parentTask.id}`}
                  name={milestone.title}
                  type="Milestone Task"
                  workspaceName={workspace?.name ?? "Unknown workspace"}
                  assigneeName={assignee?.name ?? "Unassigned"}
                  status={<StatusBadge status={milestone.status} />}
                  dueDate={milestone.deadline}
                />
              );
            })}
            {relatedTasks.length + relatedMilestoneRows.length === 0 && (
              <div className="px-6 py-12 text-center text-sm text-ink-500">No related tasks or milestones for this Talent Pool yet.</div>
            )}
          </div>
        </section>
      )}

      {activeTab === "members" && (
        <div className="grid gap-5 md:grid-cols-2">
          {memberships.length === 0 && (
            <div className="panel col-span-full px-5 py-12 text-center text-sm text-ink-500">No active members in this pool yet.</div>
          )}
          {memberships.map((membership) => {
            const professional = getProfessional(membership.professionalId);
            if (!professional) return null;
            const currentTask = relatedTasks.find((task) => task.activeAssigneeId === professional.id);
            const workspace = currentTask ? getWorkspace(currentTask.workspaceId) : undefined;
            const credibility = getCredibilityScore(professional);

            return (
              <article
                key={membership.id}
                role="button"
                tabIndex={0}
                className="panel cursor-pointer p-5 transition hover:-translate-y-0.5 hover:shadow-panel"
                onClick={() => setProfilePreview(professional)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    setProfilePreview(professional);
                  }
                }}
              >
                <div className="flex items-start justify-between gap-3">
                  <Avatar initials={professional.avatar} src={professional.photoUrl} size="lg" />
                  <Badge tone="blue">Credibility {credibility}/100</Badge>
                </div>

                <div className="mt-4">
                  <p className="text-lg font-bold text-ink-900">{professional.name}</p>
                  <p className="text-sm text-ink-500">{professional.title}</p>
                  <p className="mt-2 flex items-center gap-1.5 text-sm text-ink-500">
                    <MapPin className="h-3.5 w-3.5" />
                    {professional.location}
                  </p>
                  <div className="mt-2">
                    <Badge tone={professional.availability === "Available" ? "success" : "amber"}>{professional.availability}</Badge>
                  </div>
                </div>

                {currentTask && (
                  <p className="mt-4 flex items-start gap-2 text-sm text-ink-600">
                    <Briefcase className="mt-0.5 h-4 w-4 shrink-0 text-ink-400" />
                    <span>
                      On task: <span className="font-semibold text-ink-900">{currentTask.title}</span>
                      {workspace ? ` (${workspace.name})` : ""}
                    </span>
                  </p>
                )}

                <div className="mt-5">
                  <span className="btn-outline inline-flex">View profile</span>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {activeTab === "applications" && (
        <section className="panel p-5">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold text-ink-900">Applications</h2>
              <p className="mt-1 text-sm text-ink-500">{poolApplications.length} application{poolApplications.length !== 1 ? "s" : ""} submitted for this pool.</p>
            </div>
            <Badge tone={pool.intakeStatus === "Open" ? "success" : "coral"}>{pool.intakeStatus}</Badge>
          </div>
          <ApplicationReviewList applications={poolApplications} poolId={pool.id} emptyMessage="No applications submitted for this Talent Pool." />
        </section>
      )}

      {inviteOpen && <InviteProfessionalModal pool={pool} onClose={() => setInviteOpen(false)} />}
      {profilePreview && <ProfileSlideOver professional={profilePreview} onClose={() => setProfilePreview(null)} />}
    </div>
  );
}

function RelatedWorkRow({
  href,
  name,
  type,
  workspaceName,
  assigneeName,
  status,
  dueDate,
}: {
  href: string;
  name: string;
  type: string;
  workspaceName: string;
  assigneeName: string;
  status: ReactNode;
  dueDate?: string;
}) {
  return (
    <Link to={href} className="flex flex-wrap items-center gap-4 px-6 py-4 transition hover:bg-ink-50/80">
      <div className="min-w-0 flex-1">
        <p className="font-semibold text-ink-900">{name}</p>
        <p className="text-sm text-ink-500">{workspaceName} · {assigneeName}</p>
      </div>
      <Badge tone={type === "Milestone Task" ? "blue" : "neutral"}>{type}</Badge>
      <div>{status}</div>
      <div className="flex items-center gap-1 text-sm text-ink-500">
        <CalendarDays className="h-4 w-4" />
        {dueDate ? formatDate(dueDate) : "N/A"}
      </div>
    </Link>
  );
}
