import { ArrowRight, CheckCircle2, Mail, MapPin, UserRound } from "lucide-react";
import { FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Badge } from "../../components/ui/Badge";
import { PortalToggle } from "../../components/layout/PortalToggle";
import { useTalentPool } from "../../state/TalentPoolContext";

export function ConsultantSignupPage() {
  const { consultantProfile, completeConsultantSignup } = useTalentPool();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: consultantProfile.name,
    email: consultantProfile.email,
    title: consultantProfile.title || "Full Stack Consultant",
    location: consultantProfile.location,
    timeZone: consultantProfile.timeZone,
  });

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    completeConsultantSignup(form);
    navigate("/consultant/onboarding");
  };

  return (
    <main className="min-h-screen bg-[#f6f8fb]">
      <div className="border-b border-ink-200 bg-white px-4 py-3 sm:px-8">
        <PortalToggle />
      </div>
      <div className="grid min-h-[calc(100vh-57px)] lg:grid-cols-[0.95fr_1.05fr]">
        <section className="flex flex-col justify-between bg-brand-800 px-6 py-8 text-white sm:px-10 lg:px-14">
          <div>
            <Badge tone="brand">Consultant experience</Badge>
            <h1 className="mt-6 text-4xl font-bold tracking-normal sm:text-5xl">Join talent pools, deliver milestone work, and get paid.</h1>
            <p className="mt-6 text-base leading-8 text-white/70">
              Discover pools matched to your skills, complete entry assignments, collaborate on workspace tasks, and track invoices.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            {["Skill-matched pools", "Milestone tasks", "Payment history"].map((item) => (
              <div key={item} className="rounded-lg border border-white/10 bg-white/5 p-4">
                <CheckCircle2 className="h-5 w-5 text-brand-200" />
                <p className="mt-3 text-sm font-semibold">{item}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="flex items-center justify-center px-4 py-10 sm:px-8">
          <form onSubmit={onSubmit} className="panel w-full max-w-xl p-6 sm:p-8">
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-brand-600">Step 1</p>
            <h2 className="mt-2 text-3xl font-bold text-ink-900">Create consultant account</h2>
            <div className="mt-8 grid gap-4">
              <Field icon={UserRound} label="Full name" value={form.name} onChange={(v) => setForm((c) => ({ ...c, name: v }))} />
              <Field icon={Mail} label="Email" value={form.email} onChange={(v) => setForm((c) => ({ ...c, email: v }))} type="email" />
              <Field icon={UserRound} label="Professional title" value={form.title} onChange={(v) => setForm((c) => ({ ...c, title: v }))} />
              <Field icon={MapPin} label="Location" value={form.location} onChange={(v) => setForm((c) => ({ ...c, location: v }))} />
              <Field icon={MapPin} label="Time zone" value={form.timeZone} onChange={(v) => setForm((c) => ({ ...c, timeZone: v }))} />
            </div>
            <button className="focus-ring mt-8 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-brand-700 px-5 py-3 text-sm font-bold text-white shadow-soft">
              Continue to onboarding
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>
        </section>
      </div>
    </main>
  );
}

function Field({ icon: Icon, label, value, onChange, type = "text" }: { icon: typeof UserRound; label: string; value: string; onChange: (v: string) => void; type?: string }) {
  return (
    <label className="block">
      <span className="text-sm font-semibold text-ink-700">{label}</span>
      <span className="mt-2 flex items-center rounded-lg border border-ink-200 bg-white px-3 py-2.5">
        <Icon className="mr-2 h-4 w-4 text-ink-400" />
        <input className="w-full border-0 bg-transparent text-sm outline-none" value={value} type={type} required onChange={(e) => onChange(e.target.value)} />
      </span>
    </label>
  );
}
