import { Send, UserPlus, X } from "lucide-react";
import { useMemo, useState } from "react";
import { ProfileSlideOver } from "../profile/ProfileSlideOver";
import { Avatar } from "../ui/Avatar";
import { Badge } from "../ui/Badge";
import { useTalentPool } from "../../state/TalentPoolContext";
import type { Professional, TalentPool } from "../../types";
import { getCredibilityScore } from "../../utils/credibility";

export function InviteProfessionalModal({
  pool,
  onClose,
}: {
  pool: TalentPool;
  onClose: () => void;
}) {
  const { getActiveMembershipsForPool, invitations, professionals, sendInvitation } = useTalentPool();
  const [search, setSearch] = useState("");
  const [profilePreview, setProfilePreview] = useState<Professional | null>(null);
  const [sentIds, setSentIds] = useState<Set<string>>(new Set());

  const memberIds = new Set(getActiveMembershipsForPool(pool.id).map((membership) => membership.professionalId));
  const pendingInviteIds = new Set(
    invitations.filter((invitation) => invitation.poolId === pool.id && invitation.status === "Pending").map((invitation) => invitation.professionalId),
  );

  const recommendations = useMemo(() => {
    const query = search.trim().toLowerCase();
    return professionals
      .filter((professional) => !memberIds.has(professional.id))
      .map((professional) => ({ professional, score: calculateMatchScore(pool, professional) }))
      .filter(({ professional }) => {
        if (!query) return true;
        return [professional.name, professional.title, ...professional.skills].join(" ").toLowerCase().includes(query);
      })
      .sort((a, b) => b.score - a.score);
  }, [memberIds, pool, professionals, search]);

  const handleInvite = (professionalId: string) => {
    sendInvitation(pool.id, professionalId);
    setSentIds((current) => new Set(current).add(professionalId));
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center px-4 py-6">
        <button className="absolute inset-0 bg-ink-900/45" onClick={onClose} aria-label="Close invite modal" />
        <section className="relative flex max-h-[92vh] w-full max-w-3xl flex-col overflow-hidden rounded-3xl bg-white shadow-panel">
          <div className="flex items-start justify-between gap-3 border-b border-ink-100 px-6 py-5">
            <div>
              <div className="flex items-center gap-2 text-brand-700">
                <UserPlus className="h-5 w-5" />
                <p className="text-sm font-bold uppercase tracking-widest">Invite professional</p>
              </div>
              <h2 className="mt-1 text-xl font-bold text-ink-900">{pool.name}</h2>
              <p className="mt-1 text-sm text-ink-500">Send invitations to professionals who match this pool&apos;s required skills.</p>
            </div>
            <button className="focus-ring rounded-lg p-2 text-ink-500 hover:bg-ink-50" onClick={onClose}>
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="border-b border-ink-100 px-6 py-3">
            <input
              className="modal-input"
              placeholder="Search by name, title, or skill..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>

          <div className="flex-1 overflow-y-auto px-6 py-4">
            <div className="grid gap-4 md:grid-cols-2">
              {recommendations.map(({ professional, score }) => {
                const invited = sentIds.has(professional.id) || pendingInviteIds.has(professional.id);
                const credibility = getCredibilityScore(professional);
                return (
                  <article key={professional.id} className="rounded-3xl border border-ink-100 bg-ink-50/50 p-4">
                    <button type="button" className="flex w-full items-start justify-between gap-3 text-left" onClick={() => setProfilePreview(professional)}>
                      <div className="flex min-w-0 items-center gap-3">
                        <Avatar initials={professional.avatar} src={professional.photoUrl} />
                        <div className="min-w-0">
                          <p className="font-bold text-ink-900">{professional.name}</p>
                          <p className="truncate text-sm text-ink-500">{professional.title}</p>
                        </div>
                      </div>
                      <Badge tone={score >= 80 ? "success" : score >= 60 ? "amber" : "neutral"}>{score}%</Badge>
                    </button>
                    <p className="mt-3 text-xs font-semibold text-ink-500">Credibility {credibility}/100</p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {professional.skills.slice(0, 3).map((skill) => <span key={skill} className="tag-pill">{skill}</span>)}
                    </div>
                    <button
                      type="button"
                      className="btn-primary mt-4 w-full disabled:cursor-not-allowed disabled:bg-ink-200"
                      disabled={pool.intakeStatus === "Closed" || invited}
                      onClick={() => handleInvite(professional.id)}
                    >
                      <Send className="h-4 w-4" />
                      {invited ? "Invitation sent" : pool.intakeStatus === "Closed" ? "Pool closed" : "Send invite"}
                    </button>
                  </article>
                );
              })}
            </div>
            {recommendations.length === 0 && (
              <p className="py-8 text-center text-sm text-ink-500">No matching professionals found.</p>
            )}
          </div>
        </section>
      </div>

      {profilePreview && <ProfileSlideOver professional={profilePreview} onClose={() => setProfilePreview(null)} />}
    </>
  );
}

function calculateMatchScore(pool: TalentPool, professional: Professional) {
  const required = pool.requiredSkills.map((skill) => skill.toLowerCase());
  const skills = professional.skills.map((skill) => skill.toLowerCase());
  const overlap = required.filter((skill) => skills.includes(skill)).length;
  const skillScore = required.length ? Math.round((overlap / required.length) * 75) : 40;
  const credibility = Math.round(Math.min(25, professional.rating * 5));
  return Math.min(99, skillScore + credibility);
}
