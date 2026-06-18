import { ArrowRight, Building2, CheckCircle2, Mail, Phone, UserRound } from "lucide-react";
import { FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Badge } from "../components/ui/Badge";
import { PortalToggle } from "../components/layout/PortalToggle";
import { useTalentPool } from "../state/TalentPoolContext";

export function SignupPage() {
  const { clientProfile, completeSignup } = useTalentPool();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: clientProfile.name,
    email: clientProfile.email,
    company: clientProfile.company,
    role: clientProfile.role,
    phone: clientProfile.phone,
  });

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    completeSignup(form);
    navigate("/onboarding");
  };

  return (
    <main className="min-h-screen bg-[#f6f8fb]">
      <div className="border-b border-ink-200 bg-white px-4 py-3 sm:px-8">
        <PortalToggle />
      </div>
      <div className="grid min-h-[calc(100vh-57px)] lg:grid-cols-[0.95fr_1.05fr]">
        <section className="flex flex-col justify-between bg-ink-900 px-6 py-8 text-white sm:px-10 lg:px-14">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-white text-lg font-extrabold text-ink-900">TP</div>
            <div>
              <p className="text-lg font-bold">Talent Pool</p>
              <p className="text-sm text-white/60">Client workforce console</p>
            </div>
          </div>

          <div className="my-16 max-w-xl">
            <Badge tone="brand">Client experience</Badge>
            <h1 className="mt-6 text-4xl font-bold tracking-normal sm:text-5xl">Build a trusted external workforce, then deploy it into real work.</h1>
            <p className="mt-6 text-base leading-8 text-white/70">
              The prototype starts with account creation and continues through workforce setup, applications, assignments, milestones, payments, reviews, and preserved history.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            {["Private pools", "Task-led access", "Permanent history"].map((item) => (
              <div key={item} className="rounded-lg border border-white/10 bg-white/5 p-4">
                <CheckCircle2 className="h-5 w-5 text-brand-300" />
                <p className="mt-3 text-sm font-semibold">{item}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="flex items-center justify-center px-4 py-10 sm:px-8">
          <form onSubmit={onSubmit} className="panel w-full max-w-xl p-6 sm:p-8">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-brand-600">Step 1</p>
              <h2 className="mt-2 text-3xl font-bold text-ink-900">Create client account</h2>
              <p className="mt-3 text-sm leading-6 text-ink-500">Use the prefilled sample values or change them before entering the console.</p>
            </div>

            <div className="mt-8 grid gap-4">
              <Field icon={UserRound} label="Full name" value={form.name} onChange={(value) => setForm((current) => ({ ...current, name: value }))} />
              <Field icon={Mail} label="Work email" value={form.email} onChange={(value) => setForm((current) => ({ ...current, email: value }))} type="email" />
              <Field icon={Building2} label="Company" value={form.company} onChange={(value) => setForm((current) => ({ ...current, company: value }))} />
              <Field icon={UserRound} label="Role" value={form.role} onChange={(value) => setForm((current) => ({ ...current, role: value }))} />
              <Field icon={Phone} label="Phone" value={form.phone} onChange={(value) => setForm((current) => ({ ...current, phone: value }))} />
            </div>

            <button className="focus-ring mt-8 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-ink-900 px-5 py-3 text-sm font-bold text-white shadow-soft">
              Continue to onboarding
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>
        </section>
      </div>
    </main>
  );
}

function Field({
  icon: Icon,
  label,
  value,
  onChange,
  type = "text",
}: {
  icon: typeof UserRound;
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
}) {
  return (
    <label className="block">
      <span className="text-sm font-semibold text-ink-700">{label}</span>
      <span className="mt-2 flex items-center rounded-lg border border-ink-200 bg-white px-3 py-2.5 focus-within:border-brand-500">
        <Icon className="mr-2 h-4 w-4 text-ink-400" />
        <input className="w-full border-0 bg-transparent text-sm text-ink-900 outline-none" value={value} type={type} onChange={(event) => onChange(event.target.value)} required />
      </span>
    </label>
  );
}
