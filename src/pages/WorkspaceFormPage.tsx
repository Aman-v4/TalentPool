import { ArrowLeft, CircleDollarSign, FolderKanban, Plus, Sparkles } from "lucide-react";
import { FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { PageHeader } from "../components/ui/PageHeader";
import { useTalentPool } from "../state/TalentPoolContext";

const WORKSPACE_CATEGORIES = [
  "Product Development",
  "Design & UX",
  "QA & Testing",
  "DevOps & Infrastructure",
  "Data & Analytics",
  "AI & Automation",
  "Marketing & Growth",
  "Operations",
];

export function WorkspaceFormPage() {
  const navigate = useNavigate();
  const { createWorkspace } = useTalentPool();
  const [form, setForm] = useState({
    name: "",
    description: "",
    objective: "",
    category: "",
    dueAt: "",
    budget: "",
    internalNotes: "",
  });

  const budgetNum = Number(form.budget) || 0;

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    const workspace = createWorkspace({
      name: form.name,
      description: form.description,
      objective: form.objective,
      dueAt: form.dueAt,
      budget: budgetNum,
      category: form.category || undefined,
      internalNotes: form.internalNotes || undefined,
    });
    navigate(`/workspaces/${workspace.id}`);
  };

  return (
    <div className="space-y-8">
      <Link to="/workspaces" className="inline-flex items-center gap-2 text-sm font-semibold text-ink-600 hover:text-ink-900">
        <ArrowLeft className="h-4 w-4" />
        Back to Workspaces
      </Link>

      <PageHeader
        eyebrow="Create workspace"
        title="New Workspace"
      />

      <form onSubmit={onSubmit} className="space-y-6">
        <div className="space-y-6">
          <section className="panel p-6">
            <div className="mb-5 flex items-center gap-2">
              <FolderKanban className="h-5 w-5 text-brand-600" />
              <h2 className="text-lg font-bold text-ink-900">Workspace Profile</h2>
            </div>
            <div className="grid gap-5">
              <Field label="Workspace name" required value={form.name} placeholder="e.g. Fintech Mobile Companion" onChange={(value) => setForm((c) => ({ ...c, name: value }))} />
              <Textarea
                label="Description"
                required
                value={form.description}
                helper="Describe the project scope, business context, and what this workspace is meant to deliver."
                placeholder="Client portal and operational workflows for a digital wallet launch. This workspace covers frontend, QA, and deployment phases."
                onChange={(value) => setForm((c) => ({ ...c, description: value }))}
              />
              <Textarea
                label="Objective"
                required
                value={form.objective}
                helper="State the primary goal and success criteria for this workspace."
                placeholder="Ship core account, authentication, and QA workflows before July release planning."
                onChange={(value) => setForm((c) => ({ ...c, objective: value }))}
              />
              <label className="block">
                <span className="text-sm font-semibold text-ink-700">Category</span>
                <select
                  className="modal-input mt-2"
                  value={form.category}
                  onChange={(e) => setForm((c) => ({ ...c, category: e.target.value }))}
                >
                  <option value="">Select a category (optional)</option>
                  {WORKSPACE_CATEGORIES.map((category) => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </label>
            </div>
          </section>

          <section className="panel p-6">
            <div className="mb-5 flex items-center gap-2">
              <CircleDollarSign className="h-5 w-5 text-amber-500" />
              <h2 className="text-lg font-bold text-ink-900">Budget & Timeline</h2>
            </div>
            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="Total budget" required type="number" min="0" step="500" value={form.budget} placeholder="e.g. 50000" onChange={(value) => setForm((c) => ({ ...c, budget: value }))} />
              <Field label="Due date" required type="date" value={form.dueAt} onChange={(value) => setForm((c) => ({ ...c, dueAt: value }))} />
            </div>
          </section>

          <section className="panel p-6">
            <div className="mb-5 flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-sky-700" />
              <h2 className="text-lg font-bold text-ink-900">Internal Notes</h2>
            </div>
            <Textarea
              label="Notes for your team"
              value={form.internalNotes}
              helper="Optional — visible only to your team, not shared with freelancers."
              placeholder="Stakeholder contacts, compliance requirements, preferred communication cadence..."
              onChange={(value) => setForm((c) => ({ ...c, internalNotes: value }))}
              required={false}
            />
          </section>

          <button type="submit" className="focus-ring inline-flex items-center gap-2 rounded-lg bg-ink-900 px-5 py-3 text-sm font-bold text-white shadow-soft">
            <Plus className="h-4 w-4" />
            Create Workspace
          </button>
        </div>
      </form>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
  required = true,
  min,
  step,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  placeholder?: string;
  required?: boolean;
  min?: string;
  step?: string;
}) {
  return (
    <label className="block">
      <span className="text-sm font-semibold text-ink-700">
        {label}
        {required && <span className="ml-1 text-coral-500">*</span>}
      </span>
      <input
        className="modal-input mt-2"
        type={type}
        value={value}
        required={required}
        placeholder={placeholder}
        min={min}
        step={step}
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  );
}

function Textarea({
  label,
  value,
  onChange,
  helper,
  placeholder,
  required = true,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  helper?: string;
  placeholder?: string;
  required?: boolean;
}) {
  return (
    <label className="block">
      <span className="text-sm font-semibold text-ink-700">
        {label}
        {required && <span className="ml-1 text-coral-500">*</span>}
      </span>
      <textarea
        className="modal-input mt-2 min-h-28"
        value={value}
        required={required}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
      />
      {helper && <p className="mt-1.5 text-xs text-ink-500">{helper}</p>}
    </label>
  );
}
