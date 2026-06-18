import { ArrowLeft, ClipboardList, Clock, FolderKanban, Send, Sparkles, Users } from "lucide-react";
import { FormEvent, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Badge } from "../../components/ui/Badge";
import { EmptyState } from "../../components/ui/EmptyState";
import { PageHeader } from "../../components/ui/PageHeader";
import { StatusBadge } from "../../components/ui/Status";
import { useTalentPool } from "../../state/TalentPoolContext";
import { formatDate } from "../../utils/date";

export function ConsultantPoolDetailPage() {
  const { poolId } = useParams();
  const {
    consultantProfile,
    getActiveMembershipsForPool,
    getPool,
    getPoolMatchScore,
    hasConsultantAppliedToPool,
    isConsultantEnrolledInPool,
    submitConsultantApplication,
  } = useTalentPool();
  const pool = poolId ? getPool(poolId) : undefined;
  const [description, setDescription] = useState("");
  const [submissionDetails, setSubmissionDetails] = useState("");
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);

  const skills = consultantProfile.skills ?? [];

  if (!pool) {
    return <EmptyState icon={FolderKanban} title="Pool not found" body="This talent pool is not available." />;
  }

  const matchScore = getPoolMatchScore(pool.id);
  const alreadyApplied = hasConsultantAppliedToPool(pool.id);
  const isEnrolled = isConsultantEnrolledInPool(pool.id);
  const assignment = pool.entryAssignment;
  const members = getActiveMembershipsForPool(pool.id);
  const matchedSkills = pool.requiredSkills.filter((skill) => skills.includes(skill));
  const missingSkills = pool.requiredSkills.filter((skill) => !skills.includes(skill));
  const backHref = isEnrolled ? "/consultant/my-pools" : "/consultant";

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    const clientQuestions = (assignment?.clientQuestions ?? []).map((question) => ({
      question,
      answer: answers[question] ?? "",
    }));
    submitConsultantApplication(pool.id, { description, submissionDetails, clientQuestions });
    setSubmitted(true);
  };

  return (
    <div className="space-y-8">
      <Link to={backHref} className="inline-flex items-center gap-2 text-sm font-semibold text-ink-600 hover:text-ink-900">
        <ArrowLeft className="h-4 w-4" />
        {isEnrolled ? "Back to my pools" : "Back to discover"}
      </Link>

      <PageHeader
        eyebrow="Talent pool"
        title={pool.name}
        actions={
          <>
            <Badge tone={matchScore >= 70 ? "success" : matchScore >= 40 ? "amber" : "neutral"}>{matchScore}% skill match</Badge>
            {isEnrolled && <Badge tone="success">Active member</Badge>}
          </>
        }
      />

      <div className="grid gap-6 xl:grid-cols-[1fr_320px]">
        <div className="space-y-6">
          <section className="panel p-5">
            <h2 className="text-lg font-bold text-ink-900">About this pool</h2>
            <p className="mt-3 text-sm leading-7 text-ink-600">{pool.description}</p>
            <div className="mt-5 flex flex-wrap gap-2">
              <StatusBadge status={pool.intakeStatus} />
              <Badge>{pool.visibility}</Badge>
              {pool.category && <Badge tone="blue">{pool.category}</Badge>}
            </div>
          </section>

          <section className="panel p-5">
            <h2 className="text-lg font-bold text-ink-900">Required skills</h2>
            <div className="mt-4 flex flex-wrap gap-2">
              {pool.requiredSkills.map((skill) => (
                <Badge key={skill} tone={skills.includes(skill) ? "brand" : "neutral"}>{skill}</Badge>
              ))}
            </div>
            {missingSkills.length > 0 && (
              <p className="mt-3 text-sm text-ink-500">
                {missingSkills.length} skill{missingSkills.length !== 1 ? "s" : ""} not on your profile yet: {missingSkills.join(", ")}
              </p>
            )}
          </section>

          {assignment && !isEnrolled && (
            <section className="panel p-5">
              <div className="flex items-center gap-2">
                <ClipboardList className="h-5 w-5 text-amber-600" />
                <h2 className="text-lg font-bold text-ink-900">Entry assignment</h2>
              </div>
              <p className="mt-1 text-sm text-ink-500">You will need to complete this assignment as part of your application.</p>
              <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-4">
                <p className="font-bold text-ink-900">{assignment.title}</p>
                <p className="mt-2 text-sm leading-6 text-ink-600">{assignment.brief}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {assignment.deliverables.map((d) => <Badge key={d}>{d}</Badge>)}
                </div>
                <p className="mt-3 text-xs font-semibold text-ink-500">
                  <Clock className="mr-1 inline h-3.5 w-3.5" />
                  Estimated {assignment.estimatedHours} hours
                </p>
              </div>
            </section>
          )}
        </div>

        <aside className="space-y-4">
          <div className="panel p-5">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-ink-400">
              <Users className="h-4 w-4" />
              Pool stats
            </div>
            <p className="mt-3 text-2xl font-bold text-ink-900">{members.length}</p>
            <p className="text-sm text-ink-500">Active members</p>
            {pool.openings !== undefined && (
              <p className="mt-3 text-sm text-ink-500">{pool.openings} openings</p>
            )}
            <p className="mt-1 text-xs text-ink-400">Created {formatDate(pool.createdAt)}</p>
          </div>

          <div className="panel p-5">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-ink-400">
              <Sparkles className="h-4 w-4" />
              Your match
            </div>
            <p className="mt-3 text-2xl font-bold text-brand-700">{matchScore}%</p>
            <p className="mt-1 text-sm text-ink-500">{matchedSkills.length} of {pool.requiredSkills.length} skills matched</p>
          </div>
        </aside>
      </div>

      {isEnrolled && (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-5 py-4">
          <p className="text-sm font-bold text-emerald-800">You are an active member of this pool</p>
          <p className="mt-1 text-sm text-emerald-700">You can be assigned to workspace tasks from this talent pool by the client.</p>
        </div>
      )}

      {(submitted || alreadyApplied) && !isEnrolled && (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-5 py-4">
          <p className="text-sm font-bold text-emerald-800">Application submitted</p>
          <p className="mt-1 text-sm text-emerald-700">Your application is pending client review. You will be notified when there is an update.</p>
        </div>
      )}

      {!isEnrolled && !submitted && !alreadyApplied && pool.intakeStatus === "Open" && (
        <form onSubmit={onSubmit} className="panel overflow-hidden">
          <div className="border-b border-ink-100 bg-ink-50 px-6 py-5">
            <h2 className="text-lg font-bold text-ink-900">Apply to this pool</h2>
            <p className="mt-1 text-sm text-ink-500">Tell the client why you are a strong fit{assignment ? " and complete the entry assignment below" : ""}.</p>
          </div>

          <div className="space-y-6 p-6">
            <div className="rounded-lg border border-ink-200 p-5">
              <label className="block">
                <span className="text-sm font-bold text-ink-900">Why do you want to join?</span>
                <p className="mt-1 text-xs text-ink-500">Highlight relevant experience, availability, and what you bring to the pool.</p>
                <textarea
                  className="modal-input mt-3 min-h-28"
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="I have 5+ years building React dashboards and would like to contribute to product delivery engagements..."
                />
              </label>
            </div>

            {assignment && (
              <>
                <div className="rounded-lg border border-amber-200 bg-amber-50/60 p-5">
                  <p className="text-sm font-bold text-amber-800">Entry assignment: {assignment.title}</p>
                  <p className="mt-2 text-sm leading-6 text-ink-600">{assignment.brief}</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {assignment.deliverables.map((d) => <Badge key={d} tone="amber">{d}</Badge>)}
                  </div>
                </div>

                <div className="rounded-lg border border-ink-200 p-5">
                  <label className="block">
                    <span className="text-sm font-bold text-ink-900">Your assignment submission</span>
                    <p className="mt-1 text-xs text-ink-500">Describe your deliverables and include links to files, repos, or demos.</p>
                    <textarea
                      className="modal-input mt-3 min-h-36"
                      required
                      value={submissionDetails}
                      onChange={(e) => setSubmissionDetails(e.target.value)}
                      placeholder="I built a responsive login card with validation states. Repo: github.com/... Demo: ..."
                    />
                  </label>
                </div>
              </>
            )}

            {assignment?.clientQuestions.map((question, index) => (
              <div key={question} className="rounded-lg border border-ink-200 p-5">
                <label className="block">
                  <span className="text-sm font-bold text-ink-900">Question {index + 1}</span>
                  <p className="mt-1 text-sm text-ink-600">{question}</p>
                  <textarea
                    className="modal-input mt-3 min-h-24"
                    required
                    value={answers[question] ?? ""}
                    onChange={(e) => setAnswers((c) => ({ ...c, [question]: e.target.value }))}
                    placeholder="Your answer..."
                  />
                </label>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between gap-4 border-t border-ink-100 bg-ink-50 px-6 py-4">
            <p className="text-xs text-ink-500">Applications are reviewed by the client before pool enrollment.</p>
            <button type="submit" className="focus-ring inline-flex items-center gap-2 rounded-lg bg-brand-700 px-5 py-2.5 text-sm font-bold text-white">
              <Send className="h-4 w-4" />
              Submit application
            </button>
          </div>
        </form>
      )}

      {!isEnrolled && pool.intakeStatus === "Closed" && (
        <div className="rounded-lg border border-ink-200 bg-ink-50 px-5 py-4 text-sm text-ink-600">
          This pool is not currently accepting new applications.
        </div>
      )}
    </div>
  );
}
