import { Plus, Trash2, X } from "lucide-react";
import { type FormEvent, type ReactNode, useState } from "react";
import type { TaskPriority } from "../../types";
import { formatCurrency } from "../../utils/date";

type MilestoneInput = {
  title: string;
  description: string;
  targets: string;
  amount: string;
  deadline: string;
};

const defaultMilestone = (): MilestoneInput => ({
  title: "",
  description: "",
  targets: "",
  amount: "",
  deadline: "",
});

export function CreateTaskModal({
  workspaceId,
  onClose,
  onCreate,
}: {
  workspaceId: string;
  onClose: () => void;
  onCreate: (
    taskInput: { workspaceId: string; title: string; description: string; priority: TaskPriority; deadline: string; deliverables: string[]; budget?: number },
    milestoneInputs: Array<{ title: string; description: string; deliverables: string[]; deadline: string; amount: number }>
  ) => void;
}) {
  const [form, setForm] = useState({
    title: "",
    description: "",
    priority: "Medium" as TaskPriority,
    deadline: "",
    budget: "",
    deliverables: "",
    hasMilestones: false,
  });
  const [milestones, setMilestones] = useState<MilestoneInput[]>([defaultMilestone()]);

  const totalMilestoneAmount = milestones.reduce((sum, m) => sum + (Number(m.amount) || 0), 0);
  const budgetNum = Number(form.budget) || 0;

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    const deliverables = form.deliverables.split(",").map((d) => d.trim()).filter(Boolean);
    const taskInput = {
      workspaceId,
      title: form.title,
      description: form.description,
      priority: form.priority,
      deadline: form.deadline,
      deliverables,
      budget: budgetNum || undefined,
    };
    const milestoneInputs = form.hasMilestones
      ? milestones
          .filter((m) => m.title.trim())
          .map((m) => ({
            title: m.title,
            description: m.description,
            deliverables: m.targets.split(",").map((t) => t.trim()).filter(Boolean),
            deadline: m.deadline || form.deadline,
            amount: Number(m.amount) || 0,
          }))
      : [];
    onCreate(taskInput, milestoneInputs);
  };

  const addMilestone = () => setMilestones((c) => [...c, defaultMilestone()]);
  const removeMilestone = (i: number) => setMilestones((c) => c.filter((_, idx) => idx !== i));
  const updateMilestone = (i: number, field: keyof MilestoneInput, value: string) =>
    setMilestones((c) => c.map((m, idx) => idx === i ? { ...m, [field]: value } : m));

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto px-4 py-8">
      <button className="absolute inset-0 bg-ink-900/40" onClick={onClose} aria-label="Close" />
      <div className="relative w-full max-w-2xl rounded-xl bg-white shadow-panel">
        <div className="flex items-center justify-between border-b border-ink-100 px-6 py-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-brand-600">New Task</p>
            <h2 className="mt-0.5 text-xl font-bold text-ink-900">Create a Task</h2>
          </div>
          <button onClick={onClose} className="focus-ring rounded-lg p-2 text-ink-400 hover:bg-ink-100 hover:text-ink-900">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={onSubmit} className="divide-y divide-ink-100">
          <div className="space-y-5 px-6 py-6">
            <h3 className="text-sm font-bold uppercase tracking-widest text-ink-400">Task Details</h3>

            <ModalField label="Task name" required>
              <input className="modal-input" value={form.title} required placeholder="e.g. Build authentication module" onChange={(e) => setForm((c) => ({ ...c, title: e.target.value }))} />
            </ModalField>

            <ModalField label="Description" required hint="Describe what needs to be done, acceptance criteria, context, preferred approach, and any constraints the professional should know about.">
              <textarea className="modal-input min-h-28" value={form.description} required placeholder="Describe the task in full detail — what to build, what done looks like, edge cases to handle, and any relevant tech stack or constraints." onChange={(e) => setForm((c) => ({ ...c, description: e.target.value }))} />
            </ModalField>

            <div className="grid gap-5 sm:grid-cols-3">
              <ModalField label="Priority">
                <select className="modal-input" value={form.priority} onChange={(e) => setForm((c) => ({ ...c, priority: e.target.value as TaskPriority }))}>
                  <option>Low</option>
                  <option>Medium</option>
                  <option>High</option>
                  <option>Urgent</option>
                </select>
              </ModalField>
              <ModalField label="Deadline" required>
                <input className="modal-input" type="date" value={form.deadline} required onChange={(e) => setForm((c) => ({ ...c, deadline: e.target.value }))} />
              </ModalField>
              <ModalField label="Budget (total)" hint="Optional — total amount for this task.">
                <input className="modal-input" type="number" min="0" step="100" value={form.budget} placeholder="e.g. 5000" onChange={(e) => setForm((c) => ({ ...c, budget: e.target.value }))} />
              </ModalField>
            </div>

            <ModalField label="Deliverables" hint="Separate with commas.">
              <input className="modal-input" value={form.deliverables} placeholder="Source code, Documentation, Demo link" onChange={(e) => setForm((c) => ({ ...c, deliverables: e.target.value }))} />
            </ModalField>
          </div>

          <div className="px-6 py-6">
            <button type="button" onClick={() => setForm((c) => ({ ...c, hasMilestones: !c.hasMilestones }))} className="flex w-full items-center justify-between rounded-lg border border-ink-200 bg-ink-50 px-4 py-3 text-left transition hover:bg-ink-100">
              <div>
                <p className="text-sm font-bold text-ink-900">Divide into milestones</p>
                <p className="mt-0.5 text-xs text-ink-500">Break the task into phased deliverables with individual payments.</p>
              </div>
              <div className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full border-2 border-transparent transition-colors ${form.hasMilestones ? "bg-ink-900" : "bg-ink-200"}`}>
                <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-md transition-transform ${form.hasMilestones ? "translate-x-5" : "translate-x-0"}`} />
              </div>
            </button>

            {form.hasMilestones && (
              <div className="mt-5 space-y-4">
                {budgetNum > 0 && (
                  <div className={`rounded-lg border px-4 py-2 text-xs font-semibold ${totalMilestoneAmount > budgetNum ? "border-coral-200 bg-coral-50 text-coral-600" : "border-ink-200 bg-ink-50 text-ink-500"}`}>
                    Milestones total: {formatCurrency(totalMilestoneAmount)} / {formatCurrency(budgetNum)} budget
                    {totalMilestoneAmount > budgetNum && " — exceeds task budget"}
                  </div>
                )}

                {milestones.map((milestone, i) => (
                  <div key={i} className="rounded-lg border border-ink-200 p-4">
                    <div className="mb-3 flex items-center justify-between">
                      <p className="text-sm font-bold text-ink-700">Milestone {i + 1}</p>
                      {milestones.length > 1 && (
                        <button type="button" onClick={() => removeMilestone(i)} className="rounded p-1 text-ink-400 hover:bg-coral-50 hover:text-coral-500">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                    <div className="grid gap-4">
                      <ModalField label="Milestone name" required>
                        <input className="modal-input" value={milestone.title} required placeholder="e.g. Auth UI and form states" onChange={(e) => updateMilestone(i, "title", e.target.value)} />
                      </ModalField>
                      <ModalField label="Description" required>
                        <textarea className="modal-input min-h-20" value={milestone.description} required placeholder="What will be delivered and what does completion look like?" onChange={(e) => updateMilestone(i, "description", e.target.value)} />
                      </ModalField>
                      <ModalField label="Targets / deliverables" hint="Separate with commas.">
                        <input className="modal-input" value={milestone.targets} placeholder="Login screen, Validation logic, Error states" onChange={(e) => updateMilestone(i, "targets", e.target.value)} />
                      </ModalField>
                      <div className="grid gap-4 sm:grid-cols-2">
                        <ModalField label="Payment amount" required>
                          <input className="modal-input" type="number" min="0" step="100" value={milestone.amount} required placeholder="e.g. 2500" onChange={(e) => updateMilestone(i, "amount", e.target.value)} />
                        </ModalField>
                        <ModalField label="Deadline">
                          <input className="modal-input" type="date" value={milestone.deadline} onChange={(e) => updateMilestone(i, "deadline", e.target.value)} />
                        </ModalField>
                      </div>
                    </div>
                  </div>
                ))}

                <button type="button" onClick={addMilestone} className="focus-ring inline-flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-brand-300 bg-brand-50 px-4 py-2.5 text-sm font-semibold text-brand-700 hover:bg-brand-100">
                  <Plus className="h-4 w-4" />
                  Add another milestone
                </button>
              </div>
            )}
          </div>

          <div className="flex justify-end gap-3 px-6 py-4">
            <button type="button" onClick={onClose} className="focus-ring rounded-lg border border-ink-200 px-4 py-2 text-sm font-semibold text-ink-700 hover:bg-ink-50">
              Cancel
            </button>
            <button type="submit" className="focus-ring inline-flex items-center gap-2 rounded-lg bg-ink-900 px-5 py-2 text-sm font-bold text-white shadow-sm hover:bg-ink-800">
              <Plus className="h-4 w-4" />
              Create Task
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function ModalField({ label, children, hint, required }: { label: string; children: ReactNode; hint?: string; required?: boolean }) {
  return (
    <label className="block">
      <span className="text-sm font-semibold text-ink-700">
        {label}
        {required && <span className="ml-1 text-coral-500">*</span>}
      </span>
      <div className="mt-2">{children}</div>
      {hint && <p className="mt-1.5 text-xs text-ink-500">{hint}</p>}
    </label>
  );
}
