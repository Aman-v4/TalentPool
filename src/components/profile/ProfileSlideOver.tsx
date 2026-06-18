import { ExternalLink, MapPin, Star } from "lucide-react";
import { Link } from "react-router-dom";
import { Avatar } from "../ui/Avatar";
import { Badge } from "../ui/Badge";
import { SlideOver } from "../ui/SlideOver";
import { useTalentPool } from "../../state/TalentPoolContext";
import type { Professional } from "../../types";
import { getCredibilityScore } from "../../utils/credibility";

export function ProfileSlideOver({
  professional,
  onClose,
}: {
  professional: Professional;
  onClose: () => void;
}) {
  const { getPoolsForProfessional } = useTalentPool();
  const pools = getPoolsForProfessional(professional.id);
  const credibility = getCredibilityScore(professional);

  return (
    <SlideOver
      title={professional.name}
      subtitle={professional.title}
      onClose={onClose}
      footer={
        <Link to={`/professionals/${professional.id}`} className="btn-primary w-full" onClick={onClose}>
          <ExternalLink className="h-4 w-4" />
          View full profile
        </Link>
      }
    >
      <div className="space-y-5">
        <div className="flex items-center gap-4">
          <Avatar initials={professional.avatar} src={professional.photoUrl} size="lg" />
          <div>
            <Badge tone={professional.availability === "Available" ? "success" : "amber"}>{professional.availability}</Badge>
            <p className="mt-2 flex items-center gap-1 text-sm text-ink-500">
              <MapPin className="h-3.5 w-3.5" />
              {professional.location}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-2xl bg-ink-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-widest text-ink-400">Credibility</p>
            <p className="mt-1 text-2xl font-bold text-ink-900">{credibility}<span className="text-sm font-medium text-ink-400">/100</span></p>
          </div>
          <div className="rounded-2xl bg-amber-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-widest text-amber-700">Rating</p>
            <p className="mt-1 flex items-center gap-1 text-2xl font-bold text-amber-700">
              <Star className="h-5 w-5 fill-current" />
              {professional.rating.toFixed(1)}
            </p>
          </div>
        </div>

        <div>
          <p className="text-sm font-bold text-ink-900">About</p>
          <p className="mt-2 text-sm leading-6 text-ink-600">{professional.bio}</p>
        </div>

        <div>
          <p className="text-sm font-bold text-ink-900">Skills</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {professional.skills.map((skill) => <span key={skill} className="tag-pill">{skill}</span>)}
          </div>
        </div>

        {pools.length > 0 && (
          <div>
            <p className="text-sm font-bold text-ink-900">Talent pools</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {pools.map((pool) => <Badge key={pool.id} tone="blue">{pool.name}</Badge>)}
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="rounded-xl border border-ink-100 p-3">
            <p className="text-xs text-ink-400">Active tasks</p>
            <p className="font-bold text-ink-900">{professional.activeTaskIds.length}</p>
          </div>
          <div className="rounded-xl border border-ink-100 p-3">
            <p className="text-xs text-ink-400">On-time delivery</p>
            <p className="font-bold text-ink-900">{professional.onTimeRate}%</p>
          </div>
        </div>
      </div>
    </SlideOver>
  );
}
