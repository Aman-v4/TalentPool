import type { ClientProfile, Professional } from "../../types";
import { formatCurrency, formatDate } from "../../utils/date";

interface PaymentInvoiceProps {
  invoiceNumber: string;
  issueDate: string;
  client: ClientProfile;
  professional: Professional;
  workspaceName: string;
  lineItem: string;
  amount: number;
  taskTitle: string;
}

export function PaymentInvoice({
  invoiceNumber,
  issueDate,
  client,
  professional,
  workspaceName,
  lineItem,
  amount,
  taskTitle,
}: PaymentInvoiceProps) {
  return (
    <div className="overflow-hidden rounded-xl border border-ink-200 bg-white">
      <div className="border-b border-ink-200 bg-ink-900 px-6 py-5 text-white">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-ink-300">Tax Invoice</p>
            <h3 className="mt-1 text-2xl font-bold">INVOICE</h3>
          </div>
          <div className="text-right text-sm">
            <p className="font-bold">{invoiceNumber}</p>
            <p className="mt-1 text-ink-300">Issued {formatDate(issueDate)}</p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 px-6 py-5 sm:grid-cols-2">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-ink-400">Bill From</p>
          <p className="mt-2 font-bold text-ink-900">{client.company}</p>
          <p className="text-sm text-ink-600">{client.name}</p>
          <p className="text-sm text-ink-500">{client.email}</p>
          {client.phone && <p className="text-sm text-ink-500">{client.phone}</p>}
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-ink-400">Bill To</p>
          <p className="mt-2 font-bold text-ink-900">{professional.name}</p>
          <p className="text-sm text-ink-600">{professional.title}</p>
          <p className="text-sm font-medium text-brand-700">{professional.email}</p>
          <p className="text-sm text-ink-500">{professional.location}</p>
        </div>
      </div>

      <div className="border-y border-ink-100 px-6 py-4">
        <div className="grid gap-2 text-sm sm:grid-cols-2">
          <div>
            <span className="text-ink-500">Workspace: </span>
            <span className="font-semibold text-ink-900">{workspaceName}</span>
          </div>
          <div>
            <span className="text-ink-500">Task: </span>
            <span className="font-semibold text-ink-900">{taskTitle}</span>
          </div>
        </div>
      </div>

      <div className="px-6 py-4">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-ink-200 text-left text-xs font-semibold uppercase tracking-[0.12em] text-ink-400">
              <th className="pb-3 pr-4">Description</th>
              <th className="pb-3 pr-4 text-center">Qty</th>
              <th className="pb-3 pr-4 text-right">Rate</th>
              <th className="pb-3 text-right">Amount</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-ink-100">
              <td className="py-4 pr-4 leading-6 text-ink-700">{lineItem}</td>
              <td className="py-4 pr-4 text-center text-ink-600">1</td>
              <td className="py-4 pr-4 text-right text-ink-600">{formatCurrency(amount)}</td>
              <td className="py-4 text-right font-semibold text-ink-900">{formatCurrency(amount)}</td>
            </tr>
          </tbody>
        </table>

        <div className="mt-4 flex justify-end">
          <div className="w-full max-w-xs space-y-2 text-sm">
            <div className="flex justify-between text-ink-600">
              <span>Subtotal</span>
              <span>{formatCurrency(amount)}</span>
            </div>
            <div className="flex justify-between text-ink-600">
              <span>Tax (0%)</span>
              <span>{formatCurrency(0)}</span>
            </div>
            <div className="flex justify-between border-t border-ink-200 pt-2 text-base font-bold text-ink-900">
              <span>Total Due</span>
              <span>{formatCurrency(amount)}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-ink-100 bg-ink-50 px-6 py-4 text-xs leading-5 text-ink-500">
        <p>Payment terms: Due upon approval. Currency: USD.</p>
        <p className="mt-1">This invoice is generated for freelance services rendered through the Talent Pool platform.</p>
      </div>
    </div>
  );
}

export function buildInvoiceNumber(seed: string) {
  const suffix = seed.replace(/\D/g, "").slice(-6).padStart(6, "0");
  return `INV-2026-${suffix}`;
}
