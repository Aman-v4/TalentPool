import { Navigate, Route, Routes } from "react-router-dom";
import { AppShell } from "./components/layout/AppShell";
import { ConsultantAppShell } from "./components/layout/ConsultantAppShell";
import { ApplicationDetailsPage } from "./pages/ApplicationDetailsPage";
import { ApplicationsPage } from "./pages/ApplicationsPage";
import { ConsultantDiscoverPage } from "./pages/consultant/ConsultantDiscoverPage";
import { MembersPage } from "./pages/MembersPage";
import { ConsultantMilestoneDetailPage } from "./pages/consultant/ConsultantMilestoneDetailPage";
import { ConsultantMyPoolsPage } from "./pages/consultant/ConsultantMyPoolsPage";
import { ConsultantNotificationsPage } from "./pages/consultant/ConsultantNotificationsPage";
import { ConsultantOnboardingPage } from "./pages/consultant/ConsultantOnboardingPage";
import { ConsultantPaymentsPage } from "./pages/consultant/ConsultantPaymentsPage";
import { ConsultantPoolDetailPage } from "./pages/consultant/ConsultantPoolDetailPage";
import { ConsultantSignupPage } from "./pages/consultant/ConsultantSignupPage";
import { ConsultantTaskDetailPage } from "./pages/consultant/ConsultantTaskDetailPage";
import { ConsultantTasksPage } from "./pages/consultant/ConsultantTasksPage";
import { ConsultantWorkspaceDetailPage } from "./pages/consultant/ConsultantWorkspaceDetailPage";
import { ConsultantWorkspacesPage } from "./pages/consultant/ConsultantWorkspacesPage";
import { CreateTaskPage } from "./pages/CreateTaskPage";
import { MilestoneDetailPage } from "./pages/MilestoneDetailPage";
import { NotificationsPage } from "./pages/NotificationsPage";
import { OnboardingPage } from "./pages/OnboardingPage";
import { PaymentsPage } from "./pages/PaymentsPage";
import { PoolFormPage } from "./pages/PoolFormPage";
import { ProfessionalProfilePage } from "./pages/ProfessionalProfilePage";
import { SignupPage } from "./pages/SignupPage";
import { TalentPoolDetailsPage } from "./pages/TalentPoolDetailsPage";
import { TalentPoolsPage } from "./pages/TalentPoolsPage";
import { TaskDetailsPage } from "./pages/TaskDetailsPage";
import { TasksPage } from "./pages/TasksPage";
import { WorkspaceDetailsPage } from "./pages/WorkspaceDetailsPage";
import { WorkspaceFormPage } from "./pages/WorkspaceFormPage";
import { WorkspacesPage } from "./pages/WorkspacesPage";
import { useTalentPool } from "./state/TalentPoolContext";

function ClientRoutes() {
  return (
    <AppShell>
      <Routes>
        <Route path="/" element={<Navigate to="/talent-pools" replace />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/onboarding" element={<OnboardingPage />} />
        <Route path="/talent-pools" element={<TalentPoolsPage />} />
        <Route path="/talent-pools/new" element={<PoolFormPage />} />
        <Route path="/talent-pools/:poolId/edit" element={<PoolFormPage />} />
        <Route path="/talent-pools/:poolId" element={<TalentPoolDetailsPage />} />
        <Route path="/applications" element={<ApplicationsPage />} />
        <Route path="/applications/:applicationId" element={<ApplicationDetailsPage />} />
        <Route path="/members" element={<MembersPage />} />
        <Route path="/professionals/:professionalId" element={<ProfessionalProfilePage />} />
        <Route path="/workspaces" element={<WorkspacesPage />} />
        <Route path="/workspaces/new" element={<WorkspaceFormPage />} />
        <Route path="/workspaces/:workspaceId/tasks/new" element={<CreateTaskPage />} />
        <Route path="/workspaces/:workspaceId/tasks/:taskId/edit" element={<CreateTaskPage />} />
        <Route path="/workspaces/:workspaceId" element={<WorkspaceDetailsPage />} />
        <Route path="/tasks" element={<TasksPage />} />
        <Route path="/tasks/:taskId/milestones/:milestoneId" element={<MilestoneDetailPage />} />
        <Route path="/tasks/:taskId" element={<TaskDetailsPage />} />
        <Route path="/payments" element={<PaymentsPage />} />
        <Route path="/notifications" element={<NotificationsPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AppShell>
  );
}

function ConsultantRoutes() {
  return (
    <ConsultantAppShell>
      <Routes>
        <Route path="/consultant" element={<ConsultantDiscoverPage />} />
        <Route path="/consultant/my-pools" element={<ConsultantMyPoolsPage />} />
        <Route path="/consultant/pools/:poolId" element={<ConsultantPoolDetailPage />} />
        <Route path="/consultant/workspaces" element={<ConsultantWorkspacesPage />} />
        <Route path="/consultant/workspaces/:workspaceId" element={<ConsultantWorkspaceDetailPage />} />
        <Route path="/consultant/tasks" element={<ConsultantTasksPage />} />
        <Route path="/consultant/tasks/:taskId/milestones/:milestoneId" element={<ConsultantMilestoneDetailPage />} />
        <Route path="/consultant/tasks/:taskId" element={<ConsultantTaskDetailPage />} />
        <Route path="/consultant/payments" element={<ConsultantPaymentsPage />} />
        <Route path="/consultant/notifications" element={<ConsultantNotificationsPage />} />
        <Route path="*" element={<Navigate to="/consultant" replace />} />
      </Routes>
    </ConsultantAppShell>
  );
}

export default function App() {
  const { portalMode, clientProfile, consultantProfile } = useTalentPool();

  if (portalMode === "consultant") {
    if (!consultantProfile.signedUp) {
      return (
        <Routes>
          <Route path="/consultant/signup" element={<ConsultantSignupPage />} />
          <Route path="*" element={<Navigate to="/consultant/signup" replace />} />
        </Routes>
      );
    }
    if (!consultantProfile.onboardingComplete) {
      return (
        <Routes>
          <Route path="/consultant/onboarding" element={<ConsultantOnboardingPage />} />
          <Route path="/consultant/signup" element={<ConsultantSignupPage />} />
          <Route path="*" element={<Navigate to="/consultant/onboarding" replace />} />
        </Routes>
      );
    }
    return <ConsultantRoutes />;
  }

  if (!clientProfile.signedUp) {
    return (
      <Routes>
        <Route path="/signup" element={<SignupPage />} />
        <Route path="*" element={<Navigate to="/signup" replace />} />
      </Routes>
    );
  }

  if (!clientProfile.onboardingComplete) {
    return (
      <Routes>
        <Route path="/onboarding" element={<OnboardingPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="*" element={<Navigate to="/onboarding" replace />} />
      </Routes>
    );
  }

  return <ClientRoutes />;
}
