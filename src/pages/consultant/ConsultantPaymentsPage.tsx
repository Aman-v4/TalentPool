import { useState } from "react";
import { CircleDollarSign } from "lucide-react";
import { Badge } from "../../components/ui/Badge";
import { PageHeader } from "../../components/ui/PageHeader";
import { PaymentDetailModal } from "../../components/payments/PaymentDetailModal";
import { useTalentPool } from "../../state/TalentPoolContext";
import { formatCurrency, formatDate } from "../../utils/date";

export function ConsultantPaymentsPage() {
  const { getConsultantPayments, getTask, getWorkspace } = useTalentPool();
  const payments = getConsultantPayments();
  const totalPaid = payments.reduce((sum, record) => sum + record.amount, 0);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selected = payments.find((record) => record.id === selectedId);

  return (
    <div className="space-y-8">
      <PageHeader eyebrow="Finance" title="Payments & invoices" />

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="panel p-5">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-ink-400">
            <CircleDollarSign className="h-4 w-4" />
            Total received
          </div>
          <p className="mt-2 text-3xl font-bold text-emerald-700">{formatCurrency(totalPaid)}</p>
        </div>
        <div className="panel p-5">
          <p className="text-xs font-semibold uppercase tracking-widest text-ink-400">Paid invoices</p>
          <p className="mt-2 text-3xl font-bold text-ink-900">{payments.length}</p>
        </div>
      </div>

      <section className="panel divide-y divide-ink-100 overflow-hidden">
        {payments.map((record) => (
          <button
            key={record.id}
            type="button"
            onClick={() => setSelectedId(record.id)}
            className="flex w-full items-center justify-between gap-3 px-5 py-4 text-left transition hover:bg-brand-50"
          >
            <div className="min-w-0">
              <p className="font-semibold text-ink-900">{record.taskTitle}</p>
              {record.milestoneTitle && <p className="text-sm text-ink-500">{record.milestoneTitle}</p>}
              <p className="mt-1 text-xs text-ink-400">{record.invoiceNumber} · {record.paidAt ? formatDate(record.paidAt) : ""}</p>
            </div>
            <div className="text-right">
              <p className="font-bold text-emerald-700">{formatCurrency(record.amount)}</p>
              <Badge tone="success">Paid</Badge>
            </div>
          </button>
        ))}
        {payments.length === 0 && (
          <p className="px-5 py-12 text-center text-sm text-ink-500">No payments received yet.</p>
        )}
      </section>

      {selected && (
        <PaymentDetailModal
          payment={selected}
          workspace={getWorkspace(selected.workspaceId)}
          task={getTask(selected.taskId)}
          onClose={() => setSelectedId(null)}
        />
      )}
    </div>
  );
}
