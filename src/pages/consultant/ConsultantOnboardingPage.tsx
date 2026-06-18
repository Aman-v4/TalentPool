import { ArrowRight, Check } from "lucide-react";
import { FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Badge } from "../../components/ui/Badge";
import { PortalToggle } from "../../components/layout/PortalToggle";
import { CATEGORY_SKILLS } from "../../data/categorySkills";
import { useTalentPool } from "../../state/TalentPoolContext";

export function ConsultantOnboardingPage() {
  const { consultantProfile, completeConsultantOnboarding } = useTalentPool();
  const navigate = useNavigate();
  const [category, setCategory] = useState(consultantProfile.category || "development");
  const [selectedSkills, setSelectedSkills] = useState<string[]>(consultantProfile.skills.length ? consultantProfile.skills : ["React", "TypeScript"]);
  const [bio, setBio] = useState(consultantProfile.bio);
  const [title, setTitle] = useState(consultantProfile.title || "Full Stack Consultant");

  const skills = CATEGORY_SKILLS[category]?.skills ?? [];

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    completeConsultantOnboarding({ category, skills: selectedSkills, bio, title });
    navigate("/consultant");
  };

  const toggleSkill = (skill: string) => {
    setSelectedSkills((current) =>
      current.includes(skill) ? current.filter((entry) => entry !== skill) : [...current, skill],
    );
  };

  return (
    <main className="min-h-screen bg-[#f6f8fb] px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto mb-8 max-w-4xl">
        <PortalToggle />
      </div>
      <form onSubmit={onSubmit} className="panel mx-auto max-w-4xl p-6 sm:p-8">
        <Badge tone="brand">Step 2</Badge>
        <h1 className="mt-4 text-3xl font-bold text-ink-900">Set your category and skills</h1>
        <p className="mt-2 text-sm text-ink-500">We use this to recommend talent pools that match your expertise.</p>

        <div className="mt-8 grid gap-6">
          <label className="block">
            <span className="text-sm font-semibold text-ink-700">Professional title</span>
            <input className="modal-input mt-2" value={title} required onChange={(e) => setTitle(e.target.value)} />
          </label>

          <label className="block">
            <span className="text-sm font-semibold text-ink-700">Primary category</span>
            <select className="modal-input mt-2" value={category} onChange={(e) => { setCategory(e.target.value); setSelectedSkills([]); }}>
              {Object.entries(CATEGORY_SKILLS).map(([id, entry]) => (
                <option key={id} value={id}>{entry.label}</option>
              ))}
            </select>
          </label>

          <div>
            <span className="text-sm font-semibold text-ink-700">Skills <span className="text-ink-400">({selectedSkills.length} selected)</span></span>
            <div className="mt-3 flex flex-wrap gap-2">
              {skills.map((skill) => (
                <button
                  key={skill}
                  type="button"
                  onClick={() => toggleSkill(skill)}
                  className={`rounded-lg border px-3 py-1.5 text-sm font-semibold transition ${
                    selectedSkills.includes(skill) ? "border-brand-400 bg-brand-50 text-brand-800" : "border-ink-200 text-ink-600 hover:border-brand-200"
                  }`}
                >
                  {selectedSkills.includes(skill) && <Check className="mr-1 inline h-3.5 w-3.5" />}
                  {skill}
                </button>
              ))}
            </div>
          </div>

          <label className="block">
            <span className="text-sm font-semibold text-ink-700">Bio</span>
            <textarea className="modal-input mt-2 min-h-28" value={bio} required placeholder="Brief summary of your experience and what engagements you prefer." onChange={(e) => setBio(e.target.value)} />
          </label>
        </div>

        <button className="focus-ring mt-8 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-brand-700 px-5 py-3 text-sm font-bold text-white shadow-soft">
          Enter consultant portal
          <ArrowRight className="h-4 w-4" />
        </button>
      </form>
    </main>
  );
}
