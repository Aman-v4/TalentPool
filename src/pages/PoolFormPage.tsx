import { ArrowLeft, Check, ChevronDown, ClipboardList, FolderKanban, Plus, X } from "lucide-react";
import { FormEvent, useEffect, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Badge } from "../components/ui/Badge";
import { EmptyState } from "../components/ui/EmptyState";
import { PageHeader } from "../components/ui/PageHeader";
import { useTalentPool } from "../state/TalentPoolContext";
import type { PoolIntakeStatus, PoolVisibility } from "../types";

const CATEGORY_SKILLS: Record<string, { label: string; skills: string[] }> = {
  development: {
    label: "Development",
    skills: ["React", "TypeScript", "JavaScript", "Node.js", "Python", "Java", "C++", "GraphQL", "REST APIs", "PostgreSQL", "MongoDB", "Redis", "Docker", "Microservices", "Next.js", "Vue.js", "Angular", "PHP", "Ruby on Rails", "Go"],
  },
  "design-ux": {
    label: "Design & UX",
    skills: ["Figma", "Sketch", "Adobe XD", "UX Research", "Prototyping", "Design Systems", "Wireframing", "User Testing", "Information Architecture", "Interaction Design", "Motion Design", "Accessibility", "Design Tokens", "Visual Design", "Usability Studies", "Brand Identity", "Illustration"],
  },
  "qa-testing": {
    label: "QA & Testing",
    skills: ["Playwright", "Cypress", "Selenium", "Jest", "API Testing", "Performance Testing", "Manual Testing", "Test Planning", "Bug Tracking", "CI Integration", "Mobile Testing", "Load Testing", "Regression Testing", "Security Testing", "Accessibility Testing", "Test Automation", "Postman"],
  },
  "devops-infra": {
    label: "DevOps & Infrastructure",
    skills: ["AWS", "Azure", "GCP", "Terraform", "Kubernetes", "Docker", "CI/CD", "Linux", "Ansible", "Helm", "Prometheus", "Grafana", "CloudFormation", "Jenkins", "GitHub Actions", "Site Reliability", "Networking", "Security Hardening"],
  },
  "data-analytics": {
    label: "Data & Analytics",
    skills: ["SQL", "Python", "R", "Tableau", "Power BI", "dbt", "Apache Spark", "Airflow", "BigQuery", "Snowflake", "ETL Pipelines", "Data Modeling", "Excel", "Looker", "A/B Testing", "Statistics", "Data Visualization"],
  },
  "ai-ml": {
    label: "AI & Machine Learning",
    skills: ["Python", "TensorFlow", "PyTorch", "LLM Ops", "Prompt Engineering", "Fine-tuning", "RAG", "Vector Databases", "MLflow", "Hugging Face", "NLP", "Computer Vision", "Data Pipelines", "Automation Workflows", "OpenAI API", "LangChain", "Model Evaluation"],
  },
  marketing: {
    label: "Marketing & Growth",
    skills: ["SEO", "SEM", "Google Ads", "Meta Ads", "Email Marketing", "Content Strategy", "CRO", "Analytics", "HubSpot", "Klaviyo", "Affiliate Marketing", "Social Media", "Growth Hacking", "Marketing Automation", "Brand Strategy", "Influencer Marketing"],
  },
  "product-management": {
    label: "Product Management",
    skills: ["Roadmapping", "Agile", "Scrum", "User Stories", "A/B Testing", "Market Research", "Competitive Analysis", "Figma", "JIRA", "OKRs", "Stakeholder Management", "Product Analytics", "Customer Interviews", "PRD Writing", "Go-to-Market", "Prioritization"],
  },
  content: {
    label: "Content & Copywriting",
    skills: ["Blog Writing", "Technical Writing", "SEO Copywriting", "UX Writing", "Video Scripts", "Email Copywriting", "Social Media Content", "Ghostwriting", "Editing", "Brand Voice", "Long-form Content", "Case Studies", "White Papers", "Press Releases", "Newsletter Writing"],
  },
  sales: {
    label: "Sales & Business Development",
    skills: ["CRM", "Salesforce", "Lead Generation", "Cold Outreach", "Account Management", "Partnership Development", "Negotiation", "Enterprise Sales", "SaaS Sales", "Sales Automation", "HubSpot", "Proposal Writing", "Customer Success", "Pipeline Management", "Demo Delivery"],
  },
  finance: {
    label: "Finance & Accounting",
    skills: ["Financial Modeling", "Bookkeeping", "Tax Planning", "Payroll", "QuickBooks", "Xero", "Budgeting", "Cash Flow Analysis", "Audit", "FP&A", "SAP", "Financial Reporting", "Compliance", "Investment Analysis", "Revenue Recognition", "Forecasting"],
  },
  operations: {
    label: "Operations & Support",
    skills: ["Process Improvement", "Project Management", "Customer Support", "Zendesk", "SOPs", "Vendor Management", "Scheduling", "Reporting", "CRM", "Onboarding", "Workflow Automation", "Quality Assurance", "Risk Management", "Documentation", "Data Entry", "KPI Tracking"],
  },
};

const CATEGORY_LIST = Object.entries(CATEGORY_SKILLS).map(([id, { label }]) => ({ id, label }));

export function PoolFormPage() {
  const { poolId } = useParams();
  const navigate = useNavigate();
  const { createTalentPool, getActiveMembershipsForPool, getPool, updateTalentPool } = useTalentPool();
  const existingPool = poolId ? getPool(poolId) : undefined;
  const isEditing = Boolean(poolId);

  const [form, setForm] = useState({
    name: existingPool?.name ?? "",
    description: existingPool?.description ?? "",
    category: existingPool?.category ?? "",
    selectedSkills: existingPool?.requiredSkills ?? [] as string[],
    visibility: (existingPool?.visibility ?? "Public") as PoolVisibility,
    intakeStatus: (existingPool?.intakeStatus ?? "Open") as PoolIntakeStatus,
    openings: String(existingPool?.openings ?? 1),
  });

  const [showAssignment, setShowAssignment] = useState(Boolean(existingPool?.entryAssignment));
  const [assignment, setAssignment] = useState({
    title: existingPool?.entryAssignment?.title ?? "",
    brief: existingPool?.entryAssignment?.brief ?? "",
    deliverables: existingPool?.entryAssignment?.deliverables.join(", ") ?? "",
    hours: String(existingPool?.entryAssignment?.estimatedHours ?? 2),
    questions: existingPool?.entryAssignment?.clientQuestions.join("\n") ?? "",
  });

  if (isEditing && !existingPool) {
    return <EmptyState icon={FolderKanban} title="Pool not found" body="The Talent Pool you want to edit is not available." />;
  }

  const activeMembers = existingPool ? getActiveMembershipsForPool(existingPool.id).length : 0;

  const onCategoryChange = (id: string) => {
    setForm((c) => ({ ...c, category: id, selectedSkills: [] }));
  };

  const onSkillToggle = (skill: string) => {
    setForm((c) => ({
      ...c,
      selectedSkills: c.selectedSkills.includes(skill)
        ? c.selectedSkills.filter((s) => s !== skill)
        : [...c.selectedSkills, skill],
    }));
  };

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    const deliverables = assignment.deliverables.split(",").map((s) => s.trim()).filter(Boolean);
    const questions = assignment.questions.split("\n").map((s) => s.trim()).filter(Boolean);

    const input = {
      name: form.name,
      description: form.description,
      category: form.category || undefined,
      openings: Number(form.openings) || 1,
      visibility: form.visibility,
      intakeStatus: form.intakeStatus,
      requiredSkills: form.selectedSkills,
      entryAssignment:
        showAssignment && assignment.title.trim()
          ? {
              title: assignment.title,
              brief: assignment.brief,
              deliverables,
              estimatedHours: Number(assignment.hours) || 0,
              clientQuestions: questions,
            }
          : null,
    };

    if (existingPool) {
      updateTalentPool(existingPool.id, input);
      navigate(`/talent-pools/${existingPool.id}`);
      return;
    }

    const pool = createTalentPool(input);
    navigate(`/talent-pools/${pool.id}`);
  };

  return (
    <div className="space-y-8">
      <Link
        to={existingPool ? `/talent-pools/${existingPool.id}` : "/talent-pools"}
        className="inline-flex items-center gap-2 text-sm font-semibold text-ink-600 hover:text-ink-900"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Talent Pools
      </Link>

      <PageHeader
        eyebrow={isEditing ? "Edit pool" : "Create pool"}
        title={isEditing ? `Edit ${existingPool?.name}` : "Create a Talent Pool"}
      />

      <form onSubmit={onSubmit} className="space-y-6">
          {/* Pool Profile */}
          <section className="panel p-6">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-brand-50 p-3 text-brand-700">
                <FolderKanban className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-ink-900">Pool Profile</h2>
                <p className="mt-1 text-sm text-ink-500">Core details that define the pool and attract the right professionals.</p>
              </div>
            </div>

            {isEditing && activeMembers > 0 && (
              <div className="mt-5 rounded-lg border border-amber-200 bg-amber-50 p-4">
                <Badge tone="amber">Active members</Badge>
                <p className="mt-2 text-sm leading-6 text-ink-600">
                  This pool already has {activeMembers} active member{activeMembers === 1 ? "" : "s"}. Editing preserves history and does not remove existing members.
                </p>
              </div>
            )}

            <div className="mt-6 grid gap-6">
              {/* Pool name */}
              <Field
                label="Pool name"
                value={form.name}
                onChange={(v) => setForm((c) => ({ ...c, name: v }))}
                placeholder="e.g. Frontend Developers · Q3 Product Build"
              />

              {/* Description */}
              <div>
                <label className="block">
                  <span className="text-sm font-semibold text-ink-700">Description</span>
                  <textarea
                    className="focus-ring mt-2 min-h-36 w-full rounded-lg border border-ink-200 bg-white px-3 py-3 text-sm leading-6 text-ink-900"
                    value={form.description}
                    required
                    placeholder="Describe this pool in detail. Include: the type of work professionals will do, required experience level, expected weekly commitment, preferred time zones, budget range per engagement, domain knowledge requirements, and any tooling or process expectations. The more context you provide, the easier it is to match and evaluate the right applicants."
                    onChange={(e) => setForm((c) => ({ ...c, description: e.target.value }))}
                  />
                </label>
                <p className="mt-1.5 text-xs text-ink-500">
                  Include experience level, time zone preferences, weekly commitment, budget range, and domain requirements to help applicants self-qualify.
                </p>
              </div>

              {/* Category */}
              <div>
                <span className="block text-sm font-semibold text-ink-700">Category <span className="text-coral-500">*</span></span>
                <p className="mt-0.5 text-xs text-ink-500">Choose one category. Skills will update to match your selection.</p>
                <div className="mt-2">
                  <CategoryDropdown value={form.category} onChange={onCategoryChange} />
                </div>
              </div>

              {/* Skills */}
              <div>
                <div className="flex items-center justify-between">
                  <span className="block text-sm font-semibold text-ink-700">
                    Skills <span className="text-coral-500">*</span>
                    {form.selectedSkills.length > 0 && (
                      <span className="ml-2 text-xs font-normal text-ink-400">{form.selectedSkills.length} selected</span>
                    )}
                  </span>
                  {form.selectedSkills.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setForm((c) => ({ ...c, selectedSkills: [] }))}
                      className="text-xs font-semibold text-coral-500 hover:underline"
                    >
                      Clear all
                    </button>
                  )}
                </div>
                <div className="mt-2">
                  <SkillsSelector
                    category={form.category}
                    selected={form.selectedSkills}
                    onToggle={onSkillToggle}
                  />
                </div>
                {/* hidden input to enforce required */}
                <input
                  type="text"
                  className="sr-only"
                  required
                  readOnly
                  value={form.selectedSkills.join(",")}
                  tabIndex={-1}
                />
              </div>

              {/* Openings + Visibility + Intake row */}
              <div className="grid gap-5 sm:grid-cols-3">
                <Field
                  label="Number of openings"
                  type="number"
                  value={form.openings}
                  onChange={(v) => setForm((c) => ({ ...c, openings: v }))}
                  placeholder="1"
                  helper="How many professionals this pool will accept."
                />
                <div>
                  <label className="block">
                    <span className="text-sm font-semibold text-ink-700">Visibility</span>
                    <select
                      className="focus-ring mt-2 w-full rounded-lg border border-ink-200 bg-white px-3 py-3 text-sm text-ink-900"
                      value={form.visibility}
                      onChange={(e) => setForm((c) => ({ ...c, visibility: e.target.value as PoolVisibility }))}
                    >
                      <option>Public</option>
                      <option>Invite Only</option>
                    </select>
                  </label>
                </div>
                <div>
                  <label className="block">
                    <span className="text-sm font-semibold text-ink-700">Application intake</span>
                    <select
                      className="focus-ring mt-2 w-full rounded-lg border border-ink-200 bg-white px-3 py-3 text-sm text-ink-900"
                      value={form.intakeStatus}
                      onChange={(e) => setForm((c) => ({ ...c, intakeStatus: e.target.value as PoolIntakeStatus }))}
                    >
                      <option>Open</option>
                      <option>Closed</option>
                    </select>
                  </label>
                </div>
              </div>
            </div>
          </section>

          {/* Entry Assignment toggle section */}
          <section className="panel p-6">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-amber-50 p-3 text-amber-500">
                  <ClipboardList className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-ink-900">Entry Assignment</h2>
                  <p className="mt-0.5 text-sm text-ink-500">Optional screening task applicants complete before joining.</p>
                </div>
              </div>
              <Toggle
                enabled={showAssignment}
                onChange={setShowAssignment}
              />
            </div>

            {showAssignment && (
              <div className="mt-6 grid gap-5 border-t border-ink-100 pt-6">
                <Field
                  label="Assignment title"
                  value={assignment.title}
                  onChange={(v) => setAssignment((c) => ({ ...c, title: v }))}
                  placeholder="Build a responsive login card"
                  required={false}
                />
                <Textarea
                  label="Assignment brief"
                  value={assignment.brief}
                  onChange={(v) => setAssignment((c) => ({ ...c, brief: v }))}
                  placeholder="Describe the challenge, expectations, and review criteria."
                  required={false}
                />
                <Field
                  label="Expected deliverables"
                  value={assignment.deliverables}
                  onChange={(v) => setAssignment((c) => ({ ...c, deliverables: v }))}
                  placeholder="Source file, Demo link, Notes"
                  helper="Separate deliverables with commas."
                  required={false}
                />
                <div className="grid gap-5 md:grid-cols-[180px_1fr]">
                  <Field
                    label="Estimated hours"
                    type="number"
                    value={assignment.hours}
                    onChange={(v) => setAssignment((c) => ({ ...c, hours: v }))}
                    required={false}
                  />
                  <Textarea
                    label="Client questions"
                    value={assignment.questions}
                    onChange={(v) => setAssignment((c) => ({ ...c, questions: v }))}
                    placeholder={"One question per line\nWhat edge cases would you test?"}
                    required={false}
                  />
                </div>
              </div>
            )}
          </section>

          <button
            type="submit"
            className="focus-ring inline-flex items-center justify-center gap-2 rounded-lg bg-ink-900 px-5 py-3 text-sm font-bold text-white shadow-soft"
          >
            {isEditing ? <Check className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
            {isEditing ? "Save Pool" : "Create Pool"}
          </button>
      </form>
    </div>
  );
}

/* ─── Sub-components ──────────────────────────────────────────── */

function CategoryDropdown({ value, onChange }: { value: string; onChange: (id: string) => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const selected = value ? CATEGORY_SKILLS[value] : null;

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="focus-ring flex w-full items-center justify-between rounded-lg border border-ink-200 bg-white px-3 py-3 text-sm"
      >
        <span className={selected ? "font-semibold text-ink-900" : "text-ink-400"}>
          {selected ? selected.label : "Select a category"}
        </span>
        <div className="flex items-center gap-2">
          {value && (
            <span
              role="button"
              tabIndex={0}
              className="rounded p-0.5 text-ink-400 hover:bg-ink-100 hover:text-ink-700"
              onClick={(e) => { e.stopPropagation(); onChange(""); }}
              onKeyDown={(e) => e.key === "Enter" && (e.stopPropagation(), onChange(""))}
            >
              <X className="h-3.5 w-3.5" />
            </span>
          )}
          <ChevronDown className={`h-4 w-4 text-ink-400 transition-transform ${open ? "rotate-180" : ""}`} />
        </div>
      </button>

      {open && (
        <div className="absolute left-0 right-0 top-full z-20 mt-1 max-h-72 overflow-y-auto rounded-lg border border-ink-200 bg-white p-2 shadow-panel">
          {CATEGORY_LIST.map((cat) => {
            const active = value === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => { onChange(cat.id); setOpen(false); }}
                className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition ${active ? "bg-ink-50" : "hover:bg-ink-50"}`}
              >
                <span
                  className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2 transition ${
                    active ? "border-ink-900 bg-ink-900" : "border-ink-300"
                  }`}
                >
                  {active && <span className="h-1.5 w-1.5 rounded-full bg-white" />}
                </span>
                <span className={`font-medium ${active ? "text-ink-900" : "text-ink-600"}`}>{cat.label}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

function SkillsSelector({
  category,
  selected,
  onToggle,
}: {
  category: string;
  selected: string[];
  onToggle: (skill: string) => void;
}) {
  if (!category) {
    return (
      <div className="rounded-lg border border-dashed border-ink-200 bg-ink-50 p-8 text-center text-sm text-ink-500">
        Select a category above to see available skills.
      </div>
    );
  }

  const skills = CATEGORY_SKILLS[category]?.skills ?? [];

  return (
    <div className="rounded-lg border border-ink-200 p-4">
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {skills.map((skill) => {
          const active = selected.includes(skill);
          return (
            <button
              key={skill}
              type="button"
              onClick={() => onToggle(skill)}
              className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-left text-sm font-medium transition ${
                active
                  ? "border-ink-900 bg-ink-900 text-white"
                  : "border-ink-200 bg-white text-ink-700 hover:border-ink-400 hover:bg-ink-50"
              }`}
            >
              <span
                className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border-2 transition ${
                  active ? "border-white bg-white" : "border-ink-300"
                }`}
              >
                {active && <Check className="h-2.5 w-2.5 text-ink-900" />}
              </span>
              <span className="truncate">{skill}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function Toggle({ enabled, onChange }: { enabled: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={enabled}
      onClick={() => onChange(!enabled)}
      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus-ring ${
        enabled ? "bg-ink-900" : "bg-ink-200"
      }`}
    >
      <span
        className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-md transition-transform ${
          enabled ? "translate-x-5" : "translate-x-0"
        }`}
      />
    </button>
  );
}

function Field({
  label,
  value,
  onChange,
  helper,
  placeholder,
  type = "text",
  required = true,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  helper?: string;
  placeholder?: string;
  type?: string;
  required?: boolean;
}) {
  return (
    <label className="block">
      <span className="text-sm font-semibold text-ink-700">{label}</span>
      <input
        className="focus-ring mt-2 w-full rounded-lg border border-ink-200 bg-white px-3 py-3 text-sm text-ink-900"
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        min={type === "number" ? 1 : undefined}
      />
      {helper && <span className="mt-1.5 block text-xs text-ink-500">{helper}</span>}
    </label>
  );
}

function Textarea({
  label,
  value,
  onChange,
  placeholder,
  required = true,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
}) {
  return (
    <label className="block">
      <span className="text-sm font-semibold text-ink-700">{label}</span>
      <textarea
        className="focus-ring mt-2 min-h-28 w-full rounded-lg border border-ink-200 bg-white px-3 py-3 text-sm leading-6 text-ink-900"
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        required={required}
      />
    </label>
  );
}
