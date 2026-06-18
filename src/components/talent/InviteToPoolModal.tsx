import { Link2, Send, UserPlus, X } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { Badge } from "../ui/Badge";
import { StatusBadge } from "../ui/Status";
import { useTalentPool } from "../../state/TalentPoolContext";
import type { Professional, TalentPool } from "../../types";

export function InviteToPoolModal({
  professional,
  onClose,
}: {
  professional: Professional;
  onClose: () => void;
}) {
  const { getPoolsForProfessional, invitations, sendInvitation, talentPools } = useTalentPool();
  const memberPoolIds = new Set(getPoolsForProfessional(professional.id).map((pool) => pool.id));
  const pendingInvitePoolIds = new Set(
    invitations
      .filter((inv) => inv.professionalId === professional.id && inv.status === "Pending")
      .map((inv) => inv.poolId)
  );

  const [sentPoolIds, setSentPoolIds] = useState<Set<string>>(new Set());

  const invitePools = talentPools.filter((pool) => !pool.archived);

  const handleInvite = (pool: TalentPool) => {
    sendInvitation(pool.id, professional.id);
    setSentPoolIds((current) => new Set([...current, pool.id]));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 py-8">
      <button className="absolute inset-0 bg-ink-900/45" onClick={onClose} aria-label="Close" />
      <section className="relative max-h-[85vh] w-full max-w-2xl overflow-y-auto rounded-xl bg-white shadow-panel">
        <div className="flex items-center justify-between border-b border-ink-100 px-6 py-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-brand-600">Invite to Talent Pool</p>
            <h2 className="mt-0.5 text-lg font-bold text-ink-900">{professional.name}</h2>
          </div>
          <button onClick={onClose} className="focus-ring rounded-lg p-2 text-ink-400 hover:bg-ink-100 hover:text-ink-900">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-3 p-6">
          {invitePools.length > 0 ? (
            invitePools.map((pool) => {
              const isMember = memberPoolIds.has(pool.id);
              const isPending = pendingInvitePoolIds.has(pool.id) || sentPoolIds.has(pool.id);
              const isClosed = pool.intakeStatus === "Closed";

              return (
                <div key={pool.id} className="rounded-lg border border-ink-200 p-4">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                      <Link to={`/talent-pools/${pool.id}`} className="font-bold text-ink-900 hover:text-brand-700">
                        {pool.name}
                      </Link>
                      <p className="mt-1 line-clamp-2 text-sm leading-6 text-ink-500">{pool.description}</p>
                      <div className="mt-2 flex flex-wrap gap-2">
                        <StatusBadge status={pool.intakeStatus} />
                        <Badge tone={pool.visibility === "Invite Only" ? "amber" : "neutral"}>{pool.visibility}</Badge>
                        {pool.requiredSkills.slice(0, 3).map((skill) => <Badge key={skill}>{skill}</Badge>)}
                      </div>
                    </div>
                    <div className="shrink-0">
                      {isMember ? (
                        <span className="inline-flex items-center gap-1.5 rounded-lg bg-brand-50 px-3 py-2 text-xs font-bold text-brand-700">
                          <Link2 className="h-3.5 w-3.5" />
                          Already a member
                        </span>
                      ) : isPending ? (
                        <span className="inline-flex rounded-lg bg-ink-100 px-3 py-2 text-xs font-bold text-ink-600">Invitation sent</span>
                      ) : (
                        <button
                          disabled={isClosed}
                          onClick={() => handleInvite(pool)}
                          className="focus-ring inline-flex items-center gap-2 rounded-lg bg-ink-900 px-4 py-2 text-sm font-bold text-white disabled:cursor-not-allowed disabled:bg-ink-200"
                        >
                          <Send className="h-4 w-4" />
                          {isClosed ? "Pool closed" : "Send invite"}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <p className="rounded-lg bg-ink-50 p-6 text-center text-sm text-ink-500">No talent pools available to invite to.</p>
          )}
        </div>
      </section>
    </div>
  );
}

export function InviteToPoolButton({
  professional,
  className = "",
}: {
  professional: Professional;
  className?: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className={`focus-ring inline-flex items-center gap-2 rounded-lg bg-ink-900 px-4 py-2 text-sm font-semibold text-white shadow-soft ${className}`}
      >
        <UserPlus className="h-4 w-4" />
        Invite to Talent Pool
      </button>
      {open && <InviteToPoolModal professional={professional} onClose={() => setOpen(false)} />}
    </>
  );
}
