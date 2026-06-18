import { ArrowLeft, ArrowRight, BriefcaseBusiness, Check, FileCheck2, FileText, Paperclip, Plus, Save, Trash2, X } from "lucide-react";
import { type ChangeEvent, type FormEvent, useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Avatar } from "../components/ui/Avatar";
import { Badge } from "../components/ui/Badge";
import { EmptyState } from "../components/ui/EmptyState";
import { PageHeader } from "../components/ui/PageHeader";
import { useTalentPool } from "../state/TalentPoolContext";
import type { CreateMilestoneInput, TaskAttachment } from "../types";
import { formatCurrency, formatDate } from "../utils/date";

const MAX_MILESTONES = 20;

type WizardStep = "details" | "milestones" | "assignment" | "preview";

const STEPS: Array<{ id: WizardStep; label: string }> = [
  { id: "details", label: "Task details" },
  { id: "milestones", label: "Milestones" },
  { id: "assignment", label: "Assignment" },
  { id: "preview", label: "Preview" },
];

type MilestoneForm = CreateMilestoneInput & { key: string };

const emptyMilestone = (): MilestoneForm => ({
  key: `ms-${Date.now()}-${Math.random()}`,
  title: "",
  description: "",
  startDate: "",
  endDate: "",
  amount: 0,
  attachments: [],
});

export function CreateTaskPage() {
  const { workspaceId, taskId } = useParams();
  const navigate = useNavigate();
  const {
    getMilestonesForTask,
    getPool,
    getProfessionalsForPool,
    getTask,
    getWorkspace,
    saveTask,
    talentPools,
  } = useTalentPool();

  const workspace = workspaceId ? getWorkspace(workspaceId) : undefined;
  const existingTask = taskId ? getTask(taskId) : undefined;
  const isEditingDraft = existingTask?.status === "Draft";

  const [step, setStep] = useState<WizardStep>("details");
  const [form, setForm] = useState({
    title: "",
    description: "",
    startDate: "",
    endDate: "",
    hasMilestones: true,
    poolId: "",
    assigneeId: "",
  });
  const [milestones, setMilestones] = useState<MilestoneForm[]>([emptyMilestone()]);

  useEffect(() => {
    if (!existingTask) return;
    const existingMilestones = getMilestonesForTask(existingTask.id);
    setForm({
      title: existingTask.title,
      description: existingTask.description,
      startDate: existingTask.startDate,
      endDate: existingTask.endDate,
      hasMilestones: existingMilestones.length > 0,
      poolId: existingTask.poolId ?? "",
      assigneeId: existingTask.activeAssigneeId ?? "",
    });
    setMilestones(
      existingMilestones.length > 0
        ? existingMilestones.map((milestone) => ({
            key: milestone.id,
            title: milestone.title,
            description: milestone.description,
            startDate: milestone.startDate,
            endDate: milestone.endDate,
            amount: milestone.amount,
            attachments: milestone.attachments,
          }))
        : [emptyMilestone()],
    );
  }, [existingTask, getMilestonesForTask]);

  const poolMembers = useMemo(
    () => (form.poolId ? getProfessionalsForPool(form.poolId) : []),
    [form.poolId, getProfessionalsForPool],
  );

  const totalAmount = useMemo(
    () => milestones.reduce((sum, milestone) => sum + (Number(milestone.amount) || 0), 0),
    [milestones],
  );

  const activePools = talentPools.filter((pool) => !pool.archived);

  if (!workspace) {
    return <EmptyState icon={BriefcaseBusiness} title="Workspace not found" body="Select a valid workspace to create a task." />;
  }

  if (taskId && existingTask && !isEditingDraft) {
    return (
      <div className="space-y-4">
        <EmptyState icon={FileCheck2} title="Task is not a draft" body="Only draft tasks can be edited from this flow." />
        <Link to={`/tasks/${existingTask.id}`} className="text-sm font-semibold text-brand-700 hover:underline">
          View task
        </Link>
      </div>
    );
  }

  const stepIndex = STEPS.findIndex((entry) => entry.id === step);

  const goNext = () => {
    const next = STEPS[stepIndex + 1];
    if (next) setStep(next.id);
  };

  const goBack = () => {
    const prev = STEPS[stepIndex - 1];
    if (prev) setStep(prev.id);
  };

  const addMilestone = () => {
    if (milestones.length >= MAX_MILESTONES) return;
    setMilestones((current) => [...current, emptyMilestone()]);
  };

  const removeMilestone = (key: string) => {
    setMilestones((current) => (current.length > 1 ? current.filter((milestone) => milestone.key !== key) : current));
  };

  const updateMilestone = (key: string, patch: Partial<MilestoneForm>) => {
    setMilestones((current) => current.map((milestone) => (milestone.key === key ? { ...milestone, ...patch } : milestone)));
  };

  const onMilestoneAttachments = (key: string, event: ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files?.length) return;
    const newAttachments: TaskAttachment[] = Array.from(files).map((file) => ({
      id: `att-${Date.now()}-${file.name}`,
      name: file.name,
      size: `${Math.max(1, Math.round(file.size / 1024))} KB`,
    }));
    setMilestones((current) =>
      current.map((milestone) =>
        milestone.key === key ? { ...milestone, attachments: [...milestone.attachments, ...newAttachments] } : milestone,
      ),
    );
    event.target.value = "";
  };

  const removeAttachment = (milestoneKey: string, attachmentId: string) => {
    setMilestones((current) =>
      current.map((milestone) =>
        milestone.key === milestoneKey
          ? { ...milestone, attachments: milestone.attachments.filter((attachment) => attachment.id !== attachmentId) }
          : milestone,
      ),
    );
  };

  const buildPayload = (asDraft: boolean) => ({
    id: existingTask?.id,
    workspaceId: workspace.id,
    title: form.title,
    description: form.description,
    startDate: form.startDate,
    endDate: form.endDate,
    poolId: form.poolId || undefined,
    assigneeId: form.assigneeId || undefined,
    hasMilestones: form.hasMilestones,
    milestones: form.hasMilestones
      ? milestones
          .filter((milestone) => milestone.title.trim())
          .map(({ key: _key, ...milestone }) => milestone)
      : [],
    asDraft,
  });

  const onSaveDraft = (event?: FormEvent) => {
    event?.preventDefault();
    const task = saveTask(buildPayload(true));
    navigate(`/workspaces/${workspace.id}/tasks/${task.id}/edit`);
  };

  const onPublish = (event?: FormEvent) => {
    event?.preventDefault();
    const task = saveTask(buildPayload(false));
    navigate(`/tasks/${task.id}`);
  };

  const canProceedFromDetails = form.title.trim() && form.description.trim() && form.startDate && form.endDate;
  const canProceedFromMilestones =
    !form.hasMilestones ||
    (milestones.some((milestone) => milestone.title.trim()) &&
      milestones
        .filter((milestone) => milestone.title.trim())
        .every((milestone) => milestone.description.trim() && milestone.startDate && milestone.endDate && Number(milestone.amount) > 0));

  return (
    <div className="space-y-8">
      <Link to={`/workspaces/${workspace.id}`} className="inline-flex items-center gap-2 text-sm font-semibold text-ink-600 hover:text-ink-900">
        <ArrowLeft className="h-4 w-4" />
        Back to {workspace.name}
      </Link>

      <PageHeader
        eyebrow={isEditingDraft ? "Continue draft" : "New task"}
        title={isEditingDraft ? `Edit: ${form.title || "Untitled task"}` : "Create Task"}
        actions={
          <button
            type="button"
            onClick={onSaveDraft}
            className="focus-ring inline-flex items-center gap-2 rounded-lg border border-ink-200 bg-white px-4 py-2 text-sm font-semibold text-ink-700 shadow-sm hover:bg-ink-50"
          >
            <Save className="h-4 w-4" />
            Save draft
          </button>
        }
      />

      <div className="flex flex-wrap gap-2 rounded-lg border border-ink-200 bg-white p-2 shadow-sm">
        {STEPS.map((entry, index) => (
          <button
            key={entry.id}
            type="button"
            onClick={() => index <= stepIndex && setStep(entry.id)}
            className={`focus-ring rounded-lg px-4 py-2 text-sm font-bold transition ${
              step === entry.id ? "bg-ink-900 text-white shadow-soft" : index < stepIndex ? "text-brand-700 hover:bg-brand-50" : "text-ink-400"
            }`}
          >
            {index + 1}. {entry.label}
          </button>
        ))}
      </div>

      {form.hasMilestones && (
        <div className="rounded-lg border border-brand-200 bg-brand-50 px-5 py-4">
          <p className="text-sm font-bold text-brand-800">Total task amount</p>
          <p className="mt-1 text-2xl font-bold text-ink-900">{formatCurrency(totalAmount)}</p>
          <p className="mt-1 text-xs text-ink-500">Calculated from {milestones.filter((m) => m.title.trim()).length} milestone{milestones.filter((m) => m.title.trim()).length !== 1 ? "s" : ""}</p>
        </div>
      )}

      {step === "details" && (
        <section className="panel space-y-5 p-6">
          <Field label="Title" required>
            <input className="modal-input" value={form.title} required placeholder="e.g. Build authentication module" onChange={(e) => setForm((c) => ({ ...c, title: e.target.value }))} />
          </Field>
          <Field label="Description" required>
            <textarea className="modal-input min-h-32" value={form.description} required placeholder="Describe scope, acceptance criteria, and constraints." onChange={(e) => setForm((c) => ({ ...c, description: e.target.value }))} />
          </Field>
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Start date" required>
              <input className="modal-input" type="date" value={form.startDate} required onChange={(e) => setForm((c) => ({ ...c, startDate: e.target.value }))} />
            </Field>
            <Field label="End date" required>
              <input className="modal-input" type="date" value={form.endDate} required min={form.startDate} onChange={(e) => setForm((c) => ({ ...c, endDate: e.target.value }))} />
            </Field>
          </div>
          <div className="flex justify-end">
            <button type="button" disabled={!canProceedFromDetails} onClick={goNext} className="focus-ring inline-flex items-center gap-2 rounded-lg bg-ink-900 px-5 py-2 text-sm font-bold text-white disabled:bg-ink-200">
              Next <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </section>
      )}

      {step === "milestones" && (
        <section className="panel space-y-5 p-6">
          <Toggle
            enabled={form.hasMilestones}
            label="Divide into milestones"
            description="Break the task into phased deliverables with individual payments (up to 20)."
            onChange={(enabled) => setForm((c) => ({ ...c, hasMilestones: enabled }))}
          />

          {form.hasMilestones && (
            <div className="space-y-4">
              {milestones.map((milestone, index) => (
                <div key={milestone.key} className="rounded-lg border border-ink-200 p-4">
                  <div className="mb-4 flex items-center justify-between">
                    <p className="text-sm font-bold text-ink-900">Milestone {index + 1}</p>
                    {milestones.length > 1 && (
                      <button type="button" onClick={() => removeMilestone(milestone.key)} className="rounded p-1 text-ink-400 hover:bg-coral-50 hover:text-coral-500">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                  <div className="grid gap-4">
                    <Field label="Title" required>
                      <input className="modal-input" value={milestone.title} placeholder="Milestone title" onChange={(e) => updateMilestone(milestone.key, { title: e.target.value })} />
                    </Field>
                    <Field label="Description" required>
                      <textarea className="modal-input min-h-24" value={milestone.description} placeholder="What will be delivered?" onChange={(e) => updateMilestone(milestone.key, { description: e.target.value })} />
                    </Field>
                    <div className="grid gap-4 sm:grid-cols-3">
                      <Field label="Start date" required>
                        <input className="modal-input" type="date" value={milestone.startDate} min={form.startDate} max={form.endDate} onChange={(e) => updateMilestone(milestone.key, { startDate: e.target.value })} />
                      </Field>
                      <Field label="End date" required>
                        <input className="modal-input" type="date" value={milestone.endDate} min={milestone.startDate || form.startDate} max={form.endDate} onChange={(e) => updateMilestone(milestone.key, { endDate: e.target.value })} />
                      </Field>
                      <Field label="Amount" required>
                        <input className="modal-input" type="number" min="0" step="100" value={milestone.amount || ""} placeholder="0" onChange={(e) => updateMilestone(milestone.key, { amount: Number(e.target.value) || 0 })} />
                      </Field>
                    </div>
                    <div>
                      <span className="text-sm font-semibold text-ink-700">Attachments</span>
                      <label className="focus-ring mt-2 flex cursor-pointer items-center gap-2 rounded-lg border border-dashed border-ink-300 bg-ink-50 px-4 py-3 text-sm font-semibold text-ink-600 hover:bg-ink-100">
                        <Paperclip className="h-4 w-4" />
                        Add files
                        <input type="file" multiple className="sr-only" onChange={(e) => onMilestoneAttachments(milestone.key, e)} />
                      </label>
                      {milestone.attachments.length > 0 && (
                        <div className="mt-3 space-y-2">
                          {milestone.attachments.map((attachment) => (
                            <div key={attachment.id} className="flex items-center justify-between rounded-lg border border-ink-200 px-3 py-2 text-sm">
                              <div className="flex items-center gap-2">
                                <FileText className="h-4 w-4 text-ink-400" />
                                <span>{attachment.name}</span>
                                {attachment.size && <span className="text-xs text-ink-400">{attachment.size}</span>}
                              </div>
                              <button type="button" onClick={() => removeAttachment(milestone.key, attachment.id)} className="text-ink-400 hover:text-coral-500">
                                <X className="h-4 w-4" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              {milestones.length < MAX_MILESTONES && (
                <button type="button" onClick={addMilestone} className="focus-ring inline-flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-brand-300 bg-brand-50 px-4 py-2.5 text-sm font-semibold text-brand-700">
                  <Plus className="h-4 w-4" />
                  Add milestone ({milestones.length}/{MAX_MILESTONES})
                </button>
              )}
            </div>
          )}

          <div className="flex justify-between">
            <button type="button" onClick={goBack} className="focus-ring rounded-lg border border-ink-200 px-4 py-2 text-sm font-semibold text-ink-700">Back</button>
            <button type="button" disabled={!canProceedFromMilestones} onClick={goNext} className="focus-ring inline-flex items-center gap-2 rounded-lg bg-ink-900 px-5 py-2 text-sm font-bold text-white disabled:bg-ink-200">
              Next <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </section>
      )}

      {step === "assignment" && (
        <section className="panel space-y-5 p-6">
          <Field label="Talent pool" hint="Select the pool to source the freelancer from.">
            <select className="modal-input" value={form.poolId} onChange={(e) => setForm((c) => ({ ...c, poolId: e.target.value, assigneeId: "" }))}>
              <option value="">Select a talent pool</option>
              {activePools.map((pool) => (
                <option key={pool.id} value={pool.id}>{pool.name}</option>
              ))}
            </select>
          </Field>

          <Field label="Freelancer" hint={form.poolId ? "Members of the selected pool." : "Select a talent pool first."}>
            <div className="mt-2 space-y-2">
              {form.poolId ? (
                poolMembers.length > 0 ? (
                  poolMembers.map((member) => (
                    <button
                      key={member.id}
                      type="button"
                      onClick={() => setForm((c) => ({ ...c, assigneeId: member.id }))}
                      className={`flex w-full items-center gap-3 rounded-lg border p-3 text-left transition ${
                        form.assigneeId === member.id ? "border-brand-400 bg-brand-50" : "border-ink-200 hover:border-brand-200"
                      }`}
                    >
                      <Avatar initials={member.avatar} src={member.photoUrl} />
                      <div>
                        <p className="font-semibold text-ink-900">{member.name}</p>
                        <p className="text-sm text-ink-500">{member.title}</p>
                      </div>
                      {form.assigneeId === member.id && <Check className="ml-auto h-5 w-5 text-brand-600" />}
                    </button>
                  ))
                ) : (
                  <p className="text-sm text-ink-500">No active members in this pool.</p>
                )
              ) : (
                <p className="text-sm text-ink-500">Choose a talent pool to see available freelancers.</p>
              )}
            </div>
          </Field>

          <div className="flex justify-between">
            <button type="button" onClick={goBack} className="focus-ring rounded-lg border border-ink-200 px-4 py-2 text-sm font-semibold text-ink-700">Back</button>
            <button type="button" onClick={goNext} className="focus-ring inline-flex items-center gap-2 rounded-lg bg-ink-900 px-5 py-2 text-sm font-bold text-white">
              Preview <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </section>
      )}

      {step === "preview" && (
        <section className="panel space-y-6 p-6">
          <div>
            <h2 className="text-lg font-bold text-ink-900">{form.title}</h2>
            <p className="mt-2 text-sm leading-6 text-ink-600">{form.description}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              <Badge>{formatDate(form.startDate)} → {formatDate(form.endDate)}</Badge>
              {form.poolId && <Badge tone="blue">{getPool(form.poolId)?.name}</Badge>}
              {form.assigneeId && poolMembers.find((m) => m.id === form.assigneeId) && (
                <Badge tone="brand">{poolMembers.find((m) => m.id === form.assigneeId)?.name}</Badge>
              )}
              <Badge tone="amber">{formatCurrency(totalAmount)} total</Badge>
            </div>
          </div>

          {form.hasMilestones && (
            <div className="space-y-3">
              <p className="text-sm font-bold text-ink-900">Milestones</p>
              {milestones.filter((m) => m.title.trim()).map((milestone, index) => (
                <div key={milestone.key} className="rounded-lg border border-ink-200 p-4">
                  <p className="font-semibold text-ink-900">{index + 1}. {milestone.title}</p>
                  <p className="mt-1 text-sm text-ink-500">{milestone.description}</p>
                  <div className="mt-3 flex flex-wrap gap-2 text-xs">
                    <Badge tone="neutral">{formatDate(milestone.startDate)} → {formatDate(milestone.endDate)}</Badge>
                    <Badge tone="amber">{formatCurrency(milestone.amount)}</Badge>
                    {milestone.attachments.length > 0 && <Badge>{milestone.attachments.length} attachment{milestone.attachments.length !== 1 ? "s" : ""}</Badge>}
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="flex flex-wrap justify-between gap-3">
            <button type="button" onClick={goBack} className="focus-ring rounded-lg border border-ink-200 px-4 py-2 text-sm font-semibold text-ink-700">Back</button>
            <div className="flex flex-wrap gap-3">
              <button type="button" onClick={onSaveDraft} className="focus-ring inline-flex items-center gap-2 rounded-lg border border-ink-200 bg-white px-4 py-2 text-sm font-semibold text-ink-700">
                <Save className="h-4 w-4" />
                Save draft
              </button>
              <button type="button" onClick={onPublish} className="focus-ring inline-flex items-center gap-2 rounded-lg bg-ink-900 px-5 py-2 text-sm font-bold text-white">
                <Check className="h-4 w-4" />
                Create task
              </button>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}

function Field({ label, children, hint, required }: { label: string; children: React.ReactNode; hint?: string; required?: boolean }) {
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

function Toggle({ enabled, label, description, onChange }: { enabled: boolean; label: string; description: string; onChange: (value: boolean) => void }) {
  return (
    <button type="button" onClick={() => onChange(!enabled)} className="flex w-full items-center justify-between rounded-lg border border-ink-200 bg-ink-50 px-4 py-3 text-left">
      <div>
        <p className="text-sm font-bold text-ink-900">{label}</p>
        <p className="mt-0.5 text-xs text-ink-500">{description}</p>
      </div>
      <div className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full border-2 border-transparent transition-colors ${enabled ? "bg-ink-900" : "bg-ink-200"}`}>
        <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-md transition-transform ${enabled ? "translate-x-5" : "translate-x-0"}`} />
      </div>
    </button>
  );
}
