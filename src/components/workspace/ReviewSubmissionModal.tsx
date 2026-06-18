import { Check, ChevronUp, CircleDollarSign, ExternalLink, FileText, Mail, RefreshCw, X } from "lucide-react";
import { useState } from "react";
import { Avatar } from "../ui/Avatar";
import { Badge } from "../ui/Badge";
import { StatusBadge } from "../ui/Status";
import type { ClientProfile, Milestone, Professional, Submission, Task } from "../../types";
import { formatCurrency, formatDateTime } from "../../utils/date";
import { buildInvoiceNumber, PaymentInvoice } from "./PaymentInvoice";

type ReviewMode = "review" | "rework" | "invoice";

interface ReviewSubmissionModalProps {
  task: Task;
  milestone?: Milestone;
  submission: Submission;
  professional: Professional;
  client: ClientProfile;
  workspaceName: string;
  amount: number;
  lineItemDescription: string;
  onClose: () => void;
  onRework: (notes: string) => void;
  onApprove: () => void;
  paymentOnApproval?: boolean;
}

export function ReviewSubmissionModal({
  task,
  milestone,
  submission,
  professional,
  client,
  workspaceName,
  amount,
  lineItemDescription,
  onClose,
  onRework,
  onApprove,
  paymentOnApproval = !milestone,
}: ReviewSubmissionModalProps) {
  const [mode, setMode] = useState<ReviewMode>("review");
  const [reworkNotes, setReworkNotes] = useState("");
  const invoiceNumber = buildInvoiceNumber(milestone?.id ?? task.id);
  const reviewTitle = milestone?.title ?? task.title;

  const handleConfirmApproval = () => {
    onApprove();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto px-4 py-8">
      <button className="absolute inset-0 bg-ink-900/50" onClick={onClose} aria-label="Close" />
      <div className="relative w-full max-w-3xl rounded-xl bg-white shadow-panel">
        <div className="flex items-center justify-between border-b border-ink-100 px-6 py-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-amber-600">
              {milestone ? "Milestone Review" : "Task Review"}
            </p>
            <h2 className="mt-0.5 text-xl font-bold text-ink-900">{reviewTitle}</h2>
          </div>
          <button onClick={onClose} className="focus-ring rounded-lg p-2 text-ink-400 hover:bg-ink-100 hover:text-ink-900">
            <X className="h-5 w-5" />
          </button>
        </div>

        {mode === "review" && (
          <div className="divide-y divide-ink-100">
            <div className="px-6 py-5">
              <div className="flex flex-col gap-4 rounded-lg border border-ink-200 bg-ink-50 p-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-4">
                  <Avatar initials={professional.avatar} src={professional.photoUrl} size="lg" />
                  <div>
                    <p className="font-bold text-ink-900">{professional.name}</p>
                    <p className="text-sm text-ink-500">{professional.title}</p>
                    <p className="text-sm text-brand-700">{professional.email}</p>
                  </div>
                </div>
                <div className="text-sm text-ink-500">
                  <p>Submitted {formatDateTime(submission.submittedAt)}</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    <StatusBadge status={milestone?.status ?? task.status} />
                    <Badge tone="amber">{formatCurrency(amount)}</Badge>
                  </div>
                </div>
              </div>

              <div className="mt-5">
                <p className="text-sm font-bold text-ink-900">Submission summary</p>
                <p className="mt-2 text-sm leading-6 text-ink-600">{submission.summary}</p>
              </div>

              <div className="mt-5">
                <p className="text-sm font-bold text-ink-900">Deliverables</p>
                <div className="mt-3 space-y-2">
                  {submission.items.map((item) => (
                    <div key={item.id} className="flex items-center justify-between gap-3 rounded-lg border border-ink-200 bg-white px-4 py-3">
                      <div className="flex min-w-0 items-center gap-3">
                        {item.type === "link" ? (
                          <ExternalLink className="h-4 w-4 shrink-0 text-brand-600" />
                        ) : (
                          <FileText className="h-4 w-4 shrink-0 text-ink-500" />
                        )}
                        <div className="min-w-0">
                          <p className="truncate font-semibold text-ink-900">{item.label}</p>
                          <p className="text-xs text-ink-500">
                            {item.type === "link" ? "External link" : "Uploaded file"}
                            {item.size ? ` · ${item.size}` : ""}
                          </p>
                        </div>
                      </div>
                      {item.type === "link" ? (
                        <a
                          href={item.url}
                          target="_blank"
                          rel="noreferrer"
                          className="focus-ring shrink-0 rounded-lg border border-brand-200 bg-brand-50 px-3 py-1.5 text-xs font-semibold text-brand-700 hover:bg-brand-100"
                        >
                          Open
                        </a>
                      ) : (
                        <span className="shrink-0 rounded-lg bg-ink-100 px-3 py-1.5 text-xs font-semibold text-ink-600">Download</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid gap-3 px-6 py-5 sm:grid-cols-2">
              <button
                onClick={() => setMode("rework")}
                className="focus-ring flex flex-col items-start gap-2 rounded-lg border-2 border-amber-200 bg-amber-50 p-4 text-left transition hover:border-amber-400 hover:bg-amber-100"
              >
                <div className="flex items-center gap-2">
                  <RefreshCw className="h-5 w-5 text-amber-600" />
                  <span className="font-bold text-amber-700">Ask for Rework</span>
                </div>
                <p className="text-xs leading-5 text-amber-700">
                  Request changes with detailed feedback on what the freelancer should revise.
                </p>
              </button>
              <button
                onClick={() => setMode("invoice")}
                className="focus-ring flex flex-col items-start gap-2 rounded-lg border-2 border-green-200 bg-green-50 p-4 text-left transition hover:border-green-400 hover:bg-green-100"
              >
                <div className="flex items-center gap-2">
                  <CircleDollarSign className="h-5 w-5 text-green-600" />
                  <span className="font-bold text-green-700">
                    {paymentOnApproval ? "Approve & Release Payment" : "Approve & Close Milestone"}
                  </span>
                </div>
                <p className="text-xs leading-5 text-green-700">
                  {paymentOnApproval
                    ? <>Approve this submission and release <span className="font-bold">{formatCurrency(amount)}</span> to the freelancer.</>
                    : "Approve the submitted work and mark this milestone as completed."}
                </p>
              </button>
            </div>
          </div>
        )}

        {mode === "rework" && (
          <div className="space-y-4 p-6">
            <div className="flex items-center gap-2">
              <button onClick={() => setMode("review")} className="rounded p-1 text-ink-400 hover:text-ink-700">
                <ChevronUp className="h-4 w-4" />
              </button>
              <p className="text-sm font-bold text-ink-900">Describe the required changes</p>
            </div>
            <textarea
              className="focus-ring min-h-40 w-full rounded-lg border border-ink-200 bg-white px-3 py-3 text-sm leading-6 text-ink-900"
              value={reworkNotes}
              autoFocus
              placeholder="Explain what needs to change, what was missing, acceptance criteria, and any reference examples. The freelancer will receive this in task communication."
              onChange={(e) => setReworkNotes(e.target.value)}
            />
            <div className="flex justify-end gap-3">
              <button type="button" onClick={() => setMode("review")} className="focus-ring rounded-lg border border-ink-200 px-4 py-2 text-sm font-semibold text-ink-700 hover:bg-ink-50">
                Back
              </button>
              <button
                type="button"
                disabled={!reworkNotes.trim()}
                onClick={() => reworkNotes.trim() && onRework(reworkNotes)}
                className="focus-ring inline-flex items-center gap-2 rounded-lg bg-amber-500 px-5 py-2 text-sm font-bold text-white shadow-sm disabled:cursor-not-allowed disabled:bg-ink-200 hover:bg-amber-600"
              >
                <RefreshCw className="h-4 w-4" />
                Send Rework Request
              </button>
            </div>
          </div>
        )}

        {mode === "invoice" && (
          <div className="space-y-5 p-6">
            <div className="flex items-center gap-2">
              <button onClick={() => setMode("review")} className="rounded p-1 text-ink-400 hover:text-ink-700">
                <ChevronUp className="h-4 w-4" />
              </button>
              <p className="text-sm font-bold text-ink-900">
                {paymentOnApproval ? "Confirm payment release" : "Confirm milestone approval"}
              </p>
            </div>

            {paymentOnApproval && (
              <>
                <PaymentInvoice
                  invoiceNumber={invoiceNumber}
                  issueDate={new Date().toISOString().slice(0, 10)}
                  client={client}
                  professional={professional}
                  workspaceName={workspaceName}
                  lineItem={lineItemDescription}
                  amount={amount}
                  taskTitle={task.title}
                />

                <div className="rounded-lg border border-brand-200 bg-brand-50 p-4">
                  <div className="flex items-start gap-3">
                    <Mail className="mt-0.5 h-5 w-5 shrink-0 text-brand-600" />
                    <div>
                      <p className="text-sm font-bold text-brand-800">Invoice delivery confirmation</p>
                      <p className="mt-1 text-sm leading-6 text-brand-700">
                        Upon confirmation, this invoice will be sent to <span className="font-bold">{professional.email}</span> and payment of{" "}
                        <span className="font-bold">{formatCurrency(amount)}</span> will be released to {professional.name}.
                      </p>
                    </div>
                  </div>
                </div>
              </>
            )}

            {!paymentOnApproval && (
              <div className="rounded-lg border border-green-200 bg-green-50 p-4 text-sm leading-6 text-green-800">
                Payment for this milestone was released when you approved the start request. Confirming here will close the milestone after work review.
              </div>
            )}

            <div className="flex justify-end gap-3">
              <button type="button" onClick={() => setMode("review")} className="focus-ring rounded-lg border border-ink-200 px-4 py-2 text-sm font-semibold text-ink-700 hover:bg-ink-50">
                Back
              </button>
              <button
                type="button"
                onClick={handleConfirmApproval}
                className="focus-ring inline-flex items-center gap-2 rounded-lg bg-green-600 px-5 py-2 text-sm font-bold text-white shadow-sm hover:bg-green-700"
              >
                <Check className="h-4 w-4" />
                {paymentOnApproval ? `Confirm & Release ${formatCurrency(amount)}` : "Confirm & Close Milestone"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
