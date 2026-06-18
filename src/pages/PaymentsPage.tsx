import {
  ArrowDownToLine,
  CalendarClock,
  CheckCircle2,
  CircleDollarSign,
  Clock3,
  Eye,
  FileText,
  TrendingUp,
  Wallet,
  X,
} from "lucide-react";
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { buildInvoiceNumber, PaymentInvoice } from "../components/workspace/PaymentInvoice";
import { Avatar } from "../components/ui/Avatar";
import { Badge } from "../components/ui/Badge";
import { MetricCard } from "../components/ui/MetricCard";
import { PageHeader } from "../components/ui/PageHeader";
import { ProgressBar } from "../components/ui/ProgressBar";
import { StatusBadge } from "../components/ui/Status";
import { useTalentPool } from "../state/TalentPoolContext";
import type { Milestone, PaymentRecord, Task } from "../types";
import { formatCurrency, formatDate } from "../utils/date";

type UpcomingPayment = {
  id: string;
  task: Task;
  milestone?: Milestone;
  workspaceName: string;
  professionalName: string;
  amount: number;
  scheduledFor: string;
  status: "Ready for release" | "Scheduled";
};

export function PaymentsPage() {
  const {
    clientProfile,
    getMilestonesForTask,
    getProfessional,
    getWorkspace,
    milestones,
    paymentRecords,
    tasks,
    workspaces,
  } = useTalentPool();

  const [viewInvoice, setViewInvoice] = useState<PaymentRecord | null>(null);
  const [activeTab, setActiveTab] = useState<"completed" | "upcoming">("completed");

  const completedPayments = paymentRecords.filter((record) => record.status === "Completed");
  const totalPaid = completedPayments.reduce((sum, record) => sum + record.amount, 0);

  const upcomingPayments = useMemo(() => {
    const paidMilestoneIds = new Set(completedPayments.map((record) => record.milestoneId).filter(Boolean));
    const items: UpcomingPayment[] = [];

    tasks.forEach((task) => {
      const workspace = getWorkspace(task.workspaceId);
      const professional = getProfessional(task.activeAssigneeId);
      const taskMilestones = getMilestonesForTask(task.id);

      if (taskMilestones.length === 0 && task.budget && !["Completed", "Cancelled"].includes(task.status)) {
        items.push({
          id: `upcoming-task-${task.id}`,
          task,
          workspaceName: workspace?.name ?? "Unknown workspace",
          professionalName: professional?.name ?? "Unassigned",
          amount: task.budget,
          scheduledFor: task.deadline,
          status: ["Submitted", "Under Review", "Approved"].includes(task.status) ? "Ready for release" : "Scheduled",
        });
        return;
      }

      taskMilestones.forEach((milestone) => {
        if (milestone.paymentStatus === "Completed" || paidMilestoneIds.has(milestone.id)) return;
        items.push({
          id: `upcoming-${milestone.id}`,
          task,
          milestone,
          workspaceName: workspace?.name ?? "Unknown workspace",
          professionalName: professional?.name ?? "Unassigned",
          amount: milestone.amount,
          scheduledFor: milestone.deadline,
          status: milestone.paymentStatus === "Eligible" ? "Ready for release" : "Scheduled",
        });
      });
    });

    return items.sort((a, b) => a.scheduledFor.localeCompare(b.scheduledFor));
  }, [completedPayments, getMilestonesForTask, getProfessional, getWorkspace, tasks]);

  const upcomingTotal = upcomingPayments.reduce((sum, item) => sum + item.amount, 0);
  const readyCount = upcomingPayments.filter((item) => item.status === "Ready for release").length;
  const totalBudget = workspaces.reduce((sum, workspace) => sum + workspace.budget, 0);
  const utilization = totalBudget > 0 ? Math.round((totalPaid / totalBudget) * 100) : 0;

  const paymentsByTask = useMemo(() => {
    const grouped = new Map<string, { task: Task; records: PaymentRecord[] }>();
    completedPayments.forEach((record) => {
      const task = tasks.find((item) => item.id === record.taskId);
      if (!task) return;
      const existing = grouped.get(record.taskId);
      if (existing) existing.records.push(record);
      else grouped.set(record.taskId, { task, records: [record] });
    });
    return [...grouped.values()];
  }, [completedPayments, tasks]);

  const invoiceProfessional = viewInvoice ? getProfessional(viewInvoice.professionalId) : undefined;
  const invoiceWorkspace = viewInvoice ? getWorkspace(viewInvoice.workspaceId) : undefined;

  const downloadInvoice = (record: PaymentRecord) => {
    const professional = getProfessional(record.professionalId);
    const workspace = getWorkspace(record.workspaceId);
    const content = [
      "TALENT POOL — PAYMENT INVOICE",
      `Invoice: ${record.invoiceNumber}`,
      `Date: ${record.paidAt ? formatDate(record.paidAt) : "—"}`,
      `Client: ${clientProfile.company}`,
      `Freelancer: ${professional?.name ?? "—"} (${professional?.email ?? "—"})`,
      `Workspace: ${workspace?.name ?? "—"}`,
      `Task: ${record.taskTitle}`,
      record.milestoneTitle ? `Milestone: ${record.milestoneTitle}` : "",
      `Description: ${record.lineItem}`,
      `Amount: ${formatCurrency(record.amount)}`,
    ].filter(Boolean).join("\n");

    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `${record.invoiceNumber}.txt`;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Finance"
        title="Payments"
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Total paid" value={formatCurrency(totalPaid)} detail={`${completedPayments.length} releases completed`} icon={Wallet} accent="brand" />
        <MetricCard label="Upcoming" value={formatCurrency(upcomingTotal)} detail={`${upcomingPayments.length} scheduled payouts`} icon={CalendarClock} accent="amber" />
        <MetricCard label="Ready to release" value={String(readyCount)} detail="Awaiting client approval" icon={CheckCircle2} accent="blue" />
        <MetricCard label="Budget utilization" value={`${utilization}%`} detail={`${formatCurrency(totalPaid)} of ${formatCurrency(totalBudget)}`} icon={TrendingUp} accent="coral" />
      </div>

      <section className="panel p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm font-bold text-ink-900">Workspace spend overview</p>
            <p className="mt-1 text-sm text-ink-500">Paid vs allocated budget across active workspaces.</p>
          </div>
          <Badge tone="neutral">{workspaces.length} workspaces</Badge>
        </div>
        <div className="mt-4 grid gap-3 lg:grid-cols-3">
          {workspaces.map((workspace) => {
            const workspaceTasks = tasks.filter((task) => task.workspaceId === workspace.id);
            const workspaceMilestones = milestones.filter((milestone) => workspaceTasks.some((task) => task.id === milestone.taskId));
            const paid = paymentRecords
              .filter((record) => record.workspaceId === workspace.id && record.status === "Completed")
              .reduce((sum, record) => sum + record.amount, 0);
            const pct = Math.round((paid / Math.max(1, workspace.budget)) * 100);
            return (
              <Link key={workspace.id} to={`/workspaces/${workspace.id}`} className="rounded-lg border border-ink-200 bg-ink-50 p-4 transition hover:border-brand-300 hover:bg-brand-50">
                <p className="font-bold text-ink-900">{workspace.name}</p>
                <p className="mt-1 text-xs text-ink-500">{formatCurrency(paid)} paid · {workspaceMilestones.length} milestones</p>
                <div className="mt-3">
                  <div className="mb-1 flex justify-between text-xs font-semibold text-ink-500">
                    <span>{pct}% utilized</span>
                    <span>{formatCurrency(workspace.budget)}</span>
                  </div>
                  <ProgressBar value={pct} />
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      <div className="flex flex-wrap gap-2 rounded-lg border border-ink-200 bg-white p-1.5">
        <TabButton active={activeTab === "completed"} onClick={() => setActiveTab("completed")} label={`Completed (${completedPayments.length})`} />
        <TabButton active={activeTab === "upcoming"} onClick={() => setActiveTab("upcoming")} label={`Upcoming (${upcomingPayments.length})`} />
      </div>

      {activeTab === "completed" && (
        <div className="space-y-5">
          {paymentsByTask.length > 0 ? (
            paymentsByTask.map(({ task, records }) => {
              const workspace = getWorkspace(task.workspaceId);
              const professional = getProfessional(task.activeAssigneeId);
              const taskTotal = records.reduce((sum, record) => sum + record.amount, 0);
              return (
                <section key={task.id} className="panel overflow-hidden">
                  <div className="border-b border-ink-100 bg-ink-50 px-5 py-4">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <Link to={`/tasks/${task.id}`} className="text-lg font-bold text-ink-900 hover:text-brand-700">{task.title}</Link>
                        <p className="mt-1 text-sm text-ink-500">
                          Workspace: <Link to={`/workspaces/${workspace?.id}`} className="font-semibold text-brand-700">{workspace?.name}</Link>
                        </p>
                        {professional && (
                          <p className="mt-1 flex items-center gap-2 text-sm text-ink-500">
                            <Avatar initials={professional.avatar} src={professional.photoUrl} size="sm" />
                            {professional.name}
                          </p>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-ink-400">Task total paid</p>
                        <p className="text-xl font-bold text-ink-900">{formatCurrency(taskTotal)}</p>
                      </div>
                    </div>
                  </div>
                  <div className="divide-y divide-ink-100">
                    {records.map((record) => (
                      <div key={record.id} className="flex flex-col gap-4 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <Badge tone="success">Paid</Badge>
                            <span className="text-sm font-bold text-ink-900">{record.invoiceNumber}</span>
                          </div>
                          <p className="mt-1 text-sm font-semibold text-ink-800">
                            {record.milestoneTitle ? `Milestone: ${record.milestoneTitle}` : "Full task payment"}
                          </p>
                          <p className="mt-0.5 line-clamp-1 text-sm text-ink-500">{record.lineItem}</p>
                          <p className="mt-1 text-xs text-ink-400">Paid {record.paidAt ? formatDate(record.paidAt) : "—"}</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <p className="text-lg font-bold text-ink-900">{formatCurrency(record.amount)}</p>
                          <button
                            onClick={() => setViewInvoice(record)}
                            className="focus-ring inline-flex items-center gap-1.5 rounded-lg border border-ink-200 bg-white px-3 py-2 text-xs font-bold text-ink-700 hover:bg-ink-50"
                          >
                            <Eye className="h-3.5 w-3.5" />
                            View
                          </button>
                          <button
                            onClick={() => downloadInvoice(record)}
                            className="focus-ring inline-flex items-center gap-1.5 rounded-lg bg-ink-900 px-3 py-2 text-xs font-bold text-white hover:bg-ink-800"
                          >
                            <ArrowDownToLine className="h-3.5 w-3.5" />
                            Download
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              );
            })
          ) : (
            <div className="panel p-10 text-center">
              <CircleDollarSign className="mx-auto h-10 w-10 text-ink-300" />
              <p className="mt-3 font-bold text-ink-900">No completed payments yet</p>
              <p className="mt-1 text-sm text-ink-500">Payments appear here after you approve and release milestone or task submissions.</p>
            </div>
          )}
        </div>
      )}

      {activeTab === "upcoming" && (
        <section className="panel overflow-hidden">
          <div className="grid grid-cols-12 gap-4 border-b border-ink-200 bg-ink-50 px-5 py-3 text-xs font-bold uppercase tracking-[0.14em] text-ink-400">
            <div className="col-span-4">Task / Milestone</div>
            <div className="col-span-2 hidden md:block">Workspace</div>
            <div className="col-span-2 hidden lg:block">Freelancer</div>
            <div className="col-span-2">Expected date</div>
            <div className="col-span-2 text-right">Amount</div>
          </div>
          <div className="divide-y divide-ink-100">
            {upcomingPayments.length > 0 ? (
              upcomingPayments.map((item) => (
                <div key={item.id} className="grid grid-cols-12 items-center gap-4 px-5 py-4">
                  <div className="col-span-8 md:col-span-4">
                    <Link to={`/tasks/${item.task.id}`} className="font-bold text-ink-900 hover:text-brand-700">{item.task.title}</Link>
                    {item.milestone && <p className="mt-0.5 text-sm text-ink-500">{item.milestone.title}</p>}
                    <Badge tone={item.status === "Ready for release" ? "amber" : "neutral"}>{item.status}</Badge>
                  </div>
                  <div className="col-span-2 hidden md:block text-sm font-semibold text-ink-700">{item.workspaceName}</div>
                  <div className="col-span-2 hidden lg:block text-sm text-ink-600">{item.professionalName}</div>
                  <div className="col-span-2 flex items-center gap-1.5 text-sm text-ink-600">
                    <Clock3 className="h-4 w-4 text-ink-400" />
                    {formatDate(item.scheduledFor)}
                  </div>
                  <div className="col-span-2 text-right text-sm font-bold text-ink-900">{formatCurrency(item.amount)}</div>
                </div>
              ))
            ) : (
              <div className="px-5 py-10 text-center text-sm text-ink-500">No upcoming payments scheduled.</div>
            )}
          </div>
        </section>
      )}

      <section className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-lg border border-brand-100 bg-brand-50 p-5">
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-brand-600" />
            <h3 className="font-bold text-ink-900">Invoice policy</h3>
          </div>
          <p className="mt-2 text-sm leading-6 text-ink-600">
            Invoices are generated automatically when you approve and release payment from a task or milestone review. Each invoice is emailed to the freelancer and stored here for download.
          </p>
        </div>
        <div className="rounded-lg border border-amber-100 bg-amber-50 p-5">
          <div className="flex items-center gap-2">
            <CalendarClock className="h-5 w-5 text-amber-600" />
            <h3 className="font-bold text-ink-900">Upcoming payouts</h3>
          </div>
          <p className="mt-2 text-sm leading-6 text-ink-600">
            Milestones marked <span className="font-semibold">Ready for release</span> can be paid immediately after review. Scheduled items follow milestone deadlines or task completion dates.
          </p>
        </div>
      </section>

      {viewInvoice && invoiceProfessional && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto px-4 py-8">
          <button className="absolute inset-0 bg-ink-900/50" onClick={() => setViewInvoice(null)} aria-label="Close" />
          <div className="relative w-full max-w-3xl">
            <div className="mb-4 flex justify-end">
              <button onClick={() => setViewInvoice(null)} className="focus-ring rounded-lg bg-white p-2 text-ink-600 shadow-sm">
                <X className="h-5 w-5" />
              </button>
            </div>
            <PaymentInvoice
              invoiceNumber={viewInvoice.invoiceNumber}
              issueDate={viewInvoice.paidAt ?? todayFallback()}
              client={clientProfile}
              professional={invoiceProfessional}
              workspaceName={invoiceWorkspace?.name ?? "—"}
              lineItem={viewInvoice.lineItem}
              amount={viewInvoice.amount}
              taskTitle={viewInvoice.taskTitle}
            />
            <div className="mt-4 flex justify-end gap-3">
              <button
                onClick={() => downloadInvoice(viewInvoice)}
                className="focus-ring inline-flex items-center gap-2 rounded-lg bg-ink-900 px-4 py-2 text-sm font-bold text-white"
              >
                <ArrowDownToLine className="h-4 w-4" />
                Download invoice
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function TabButton({ active, onClick, label }: { active: boolean; onClick: () => void; label: string }) {
  return (
    <button
      onClick={onClick}
      className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
        active ? "bg-ink-900 text-white shadow-sm" : "text-ink-600 hover:bg-ink-50"
      }`}
    >
      {label}
    </button>
  );
}

function todayFallback() {
  return new Date().toISOString().slice(0, 10);
}
