import { BriefcaseBusiness, Calendar, CircleDollarSign, ExternalLink, FileText, X } from "lucide-react";
import { Link } from "react-router-dom";
import { Badge } from "../ui/Badge";
import type { PaymentRecord, Task, Workspace } from "../../types";
import { formatCurrency, formatDate } from "../../utils/date";

interface PaymentDetailModalProps {
  payment: PaymentRecord;
  workspace?: Workspace;
  task?: Task;
  onClose: () => void;
}

export function PaymentDetailModal({ payment, workspace, task, onClose }: PaymentDetailModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto px-4 py-8">
      <button className="absolute inset-0 bg-ink-900/50" onClick={onClose} aria-label="Close" />
      <div className="relative w-full max-w-2xl rounded-xl bg-white shadow-panel">
        <div className="flex items-start justify-between border-b border-ink-100 px-6 py-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-emerald-600">Payment received</p>
            <h2 className="mt-1 text-xl font-bold text-ink-900">{payment.taskTitle}</h2>
            {payment.milestoneTitle && <p className="mt-1 text-sm text-ink-500">{payment.milestoneTitle}</p>}
          </div>
          <button onClick={onClose} className="focus-ring rounded-lg p-2 text-ink-400 hover:bg-ink-100 hover:text-ink-900">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-5 p-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <DetailRow icon={CircleDollarSign} label="Amount received" value={formatCurrency(payment.amount)} highlight />
            <DetailRow icon={Calendar} label="Paid on" value={payment.paidAt ? formatDate(payment.paidAt) : "—"} />
            <DetailRow icon={FileText} label="Invoice reference" value={payment.invoiceNumber} />
            {workspace && (
              <DetailRow icon={BriefcaseBusiness} label="Workspace" value={workspace.name} />
            )}
          </div>

          <section className="rounded-lg border border-ink-200 bg-ink-50 p-4">
            <p className="text-sm font-bold text-ink-900">Service details</p>
            <p className="mt-2 text-sm leading-6 text-ink-600">{payment.lineItem}</p>
            {task && (
              <p className="mt-3 text-sm leading-6 text-ink-500">{task.description}</p>
            )}
          </section>

          {task && task.deliverables.length > 0 && (
            <section>
              <p className="text-sm font-bold text-ink-900">Related deliverables</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {task.deliverables.map((deliverable) => (
                  <Badge key={deliverable}>{deliverable}</Badge>
                ))}
              </div>
            </section>
          )}

          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-ink-100 pt-5">
            <Badge tone="success">Paid</Badge>
            {task && (
              <Link
                to={`/consultant/tasks/${task.id}`}
                onClick={onClose}
                className="focus-ring inline-flex items-center gap-2 rounded-lg border border-brand-200 bg-brand-50 px-4 py-2 text-sm font-semibold text-brand-700 hover:bg-brand-100"
              >
                View task
                <ExternalLink className="h-4 w-4" />
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function DetailRow({
  icon: Icon,
  label,
  value,
  highlight,
}: {
  icon: typeof Calendar;
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div className="rounded-lg border border-ink-200 p-4">
      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-ink-400">
        <Icon className="h-3.5 w-3.5" />
        {label}
      </div>
      <p className={`mt-2 text-sm font-bold ${highlight ? "text-emerald-700" : "text-ink-900"}`}>{value}</p>
    </div>
  );
}
