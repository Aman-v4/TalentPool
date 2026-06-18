import { ArrowRight, BriefcaseBusiness, Check, FolderKanban, Target, Users } from "lucide-react";
import { FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";
import { PortalToggle } from "../components/layout/PortalToggle";
import { Badge } from "../components/ui/Badge";
import { useTalentPool } from "../state/TalentPoolContext";

export function OnboardingPage() {
  const { clientProfile, completeOnboarding } = useTalentPool();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    industry: clientProfile.industry,
    teamSize: clientProfile.teamSize,
    objective: clientProfile.objective,
  });

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    completeOnboarding(form);
    navigate("/");
  };

  return (
    <main className="min-h-screen bg-[#f6f8fb] px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8">
          <PortalToggle />
        </div>
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-ink-900 text-lg font-extrabold text-white">TP</div>
          <div>
            <p className="text-lg font-bold text-ink-900">Talent Pool</p>
            <p className="text-xs font-medium text-ink-500">Client onboarding</p>
          </div>
        </div>

        <div className="mt-10 grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
          <section>
            <Badge tone="brand">Step 2</Badge>
            <h1 className="mt-5 text-4xl font-bold tracking-normal text-ink-900">Set the operating context</h1>
            <p className="mt-4 text-base leading-8 text-ink-500">
              This setup shapes the sample dashboard and moves the client into the full product workspace.
            </p>

            <div className="mt-8 grid gap-4">
              {[
                { icon: FolderKanban, title: "Create reusable Talent Pools" },
                { icon: Users, title: "Review applications and invitations" },
                { icon: BriefcaseBusiness, title: "Create workspaces and tasks" },
                { icon: Target, title: "Track milestones, payments, and reviews" },
              ].map((item) => (
                <div key={item.title} className="panel flex items-center gap-4 p-4">
                  <div className="rounded-lg bg-brand-50 p-3 text-brand-700">
                    <item.icon className="h-5 w-5" />
                  </div>
                  <p className="font-semibold text-ink-900">{item.title}</p>
                </div>
              ))}
            </div>
          </section>

          <form onSubmit={onSubmit} className="panel p-6 sm:p-8">
            <h2 className="text-2xl font-bold text-ink-900">Company setup</h2>
            <div className="mt-6 grid gap-5">
              <label className="block">
                <span className="text-sm font-semibold text-ink-700">Industry</span>
                <select className="focus-ring mt-2 w-full rounded-lg border border-ink-200 bg-white px-3 py-3 text-sm text-ink-900" value={form.industry} onChange={(event) => setForm((current) => ({ ...current, industry: event.target.value }))}>
                  <option>Fintech</option>
                  <option>SaaS</option>
                  <option>Healthcare</option>
                  <option>Retail</option>
                  <option>Consulting</option>
                </select>
              </label>

              <label className="block">
                <span className="text-sm font-semibold text-ink-700">Team size</span>
                <select className="focus-ring mt-2 w-full rounded-lg border border-ink-200 bg-white px-3 py-3 text-sm text-ink-900" value={form.teamSize} onChange={(event) => setForm((current) => ({ ...current, teamSize: event.target.value }))}>
                  <option>1-10</option>
                  <option>11-50</option>
                  <option>51-200</option>
                  <option>201-1000</option>
                  <option>1000+</option>
                </select>
              </label>

              <label className="block">
                <span className="text-sm font-semibold text-ink-700">Primary objective</span>
                <textarea className="focus-ring mt-2 min-h-28 w-full rounded-lg border border-ink-200 bg-white px-3 py-3 text-sm leading-6 text-ink-900" value={form.objective} onChange={(event) => setForm((current) => ({ ...current, objective: event.target.value }))} />
              </label>
            </div>

            <div className="mt-8 rounded-lg border border-brand-100 bg-brand-50 p-4">
              <div className="flex items-center gap-2 text-sm font-bold text-brand-700">
                <Check className="h-4 w-4" />
                MVP boundaries applied
              </div>
              <p className="mt-2 text-sm leading-6 text-ink-600">No backend, no direct messaging, no multi-assignee tasks, no manual workspace-pool linking.</p>
            </div>

            <button className="focus-ring mt-8 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-ink-900 px-5 py-3 text-sm font-bold text-white shadow-soft">
              Enter console
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
