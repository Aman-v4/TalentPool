import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import {
  announcements as seedAnnouncements,
  applications as seedApplications,
  invitations as seedInvitations,
  memberships as seedMemberships,
  milestones as seedMilestones,
  notifications as seedNotifications,
  paymentRecords as seedPaymentRecords,
  professionals as seedProfessionals,
  reviews as seedReviews,
  submissions as seedSubmissions,
  talentPools as seedTalentPools,
  taskMessages as seedTaskMessages,
  tasks as seedTasks,
  today,
  workspaces as seedWorkspaces,
} from "../data/mockData";
import { calculateSkillMatch } from "../data/categorySkills";
import type {
  Announcement,
  Application,
  ClientProfile,
  ConsultantApplicationInput,
  ConsultantProfile,
  ConsultantSubmissionInput,
  CreateMilestoneInput,
  Invitation,
  JourneyEvent,
  Membership,
  Milestone,
  Notification,
  PaymentRecord,
  PortalMode,
  Professional,
  Review,
  SaveTaskInput,
  Submission,
  TalentPool,
  Task,
  TaskMessage,
  Workspace,
  WorkspaceStatus,
} from "../types";
import { resolveApplicationStatus } from "../utils/date";
import { buildInvoiceNumber } from "../components/workspace/PaymentInvoice";

interface TalentPoolState {
  portalMode: PortalMode;
  setPortalMode: (mode: PortalMode) => void;
  clientProfile: ClientProfile;
  consultantProfile: ConsultantProfile;
  journeyEvents: JourneyEvent[];
  professionals: Professional[];
  talentPools: TalentPool[];
  memberships: Membership[];
  applications: Application[];
  invitations: Invitation[];
  announcements: Announcement[];
  workspaces: Workspace[];
  tasks: Task[];
  milestones: Milestone[];
  reviews: Review[];
  submissions: Submission[];
  taskMessages: TaskMessage[];
  notifications: Notification[];
  clientNotifications: Notification[];
  consultantNotifications: Notification[];
  paymentRecords: PaymentRecord[];
  activeApplications: Application[];
  expiredApplications: Application[];
  getProfessional: (id?: string) => Professional | undefined;
  getPool: (id: string) => TalentPool | undefined;
  getWorkspace: (id: string) => Workspace | undefined;
  getTask: (id: string) => Task | undefined;
  getActiveMembershipsForPool: (poolId: string) => Membership[];
  getPoolsForProfessional: (professionalId?: string) => TalentPool[];
  getProfessionalsForPool: (poolId: string) => Professional[];
  getAssociatedPoolsForWorkspace: (workspaceId: string) => TalentPool[];
  getTasksForWorkspace: (workspaceId: string) => Task[];
  getMilestonesForTask: (taskId: string) => Milestone[];
  getMilestone: (milestoneId: string) => Milestone | undefined;
  getSubmissionForTask: (taskId: string) => Submission | undefined;
  getSubmissionForMilestone: (milestoneId: string) => Submission | undefined;
  getTaskProgress: (taskId: string) => number;
  canArchiveWorkspace: (workspaceId: string) => boolean;
  completeSignup: (profile: Pick<ClientProfile, "name" | "email" | "company" | "role" | "phone">) => void;
  completeOnboarding: (details: Pick<ClientProfile, "industry" | "teamSize" | "objective">) => void;
  completeConsultantSignup: (profile: Pick<ConsultantProfile, "name" | "email" | "title" | "location" | "timeZone">) => void;
  completeConsultantOnboarding: (details: Pick<ConsultantProfile, "category" | "skills" | "bio" | "title">) => void;
  submitConsultantApplication: (poolId: string, input: ConsultantApplicationInput) => Application | undefined;
  submitConsultantDeliverable: (taskId: string, input: ConsultantSubmissionInput, milestoneId?: string) => void;
  getDiscoverablePools: () => TalentPool[];
  getConsultantPools: () => TalentPool[];
  getConsultantApplications: () => Application[];
  getConsultantWorkspaces: () => Workspace[];
  getConsultantTasks: () => Task[];
  getConsultantPayments: () => PaymentRecord[];
  getConsultantInvitations: () => Invitation[];
  getPendingApplicationsByPool: () => Array<{ poolId: string; count: number }>;
  getInvestedAmountForWorkspace: (workspaceId: string) => number;
  getConsultantPoolMetrics: (poolId: string) => { openTasks: number; closedTasks: number; pendingApplications: number };
  getConsultantWorkspaceMetrics: (workspaceId: string) => { openTasks: number; closedTasks: number; inReview: number };
  getTasksForPool: (poolId: string) => Task[];
  getPoolMatchScore: (poolId: string) => number;
  hasConsultantAppliedToPool: (poolId: string) => boolean;
  isConsultantEnrolledInPool: (poolId: string) => boolean;
  createTalentPool: (input: Pick<TalentPool, "name" | "description" | "requiredSkills" | "visibility" | "intakeStatus"> & { entryAssignment: TalentPool["entryAssignment"]; category?: string; openings?: number }) => TalentPool;
  updateTalentPool: (poolId: string, input: Pick<TalentPool, "name" | "description" | "requiredSkills" | "visibility" | "intakeStatus"> & { entryAssignment: TalentPool["entryAssignment"]; category?: string; openings?: number }) => void;
  createTaskWithMilestones: (
    taskInput: { workspaceId: string; title: string; description: string; priority: Task["priority"]; startDate: string; endDate: string; deadline: string; deliverables: string[]; budget?: number; poolId?: string; assigneeId?: string },
    milestoneInputs: CreateMilestoneInput[],
  ) => Task;
  saveTask: (input: SaveTaskInput) => Task;
  requestMilestoneStart: (milestoneId: string) => void;
  approveMilestoneStart: (milestoneId: string) => void;
  submitMilestoneWork: (milestoneId: string) => void;
  approveMilestoneCompletion: (milestoneId: string) => void;
  requestMilestoneRework: (milestoneId: string, notes: string) => void;
  releasePaymentForMilestone: (milestoneId: string) => void;
  requestTaskRework: (taskId: string, notes: string) => void;
  approveTask: (taskId: string) => void;
  releasePaymentForTask: (taskId: string) => void;
  closeTalentPool: (poolId: string) => void;
  openTalentPool: (poolId: string) => void;
  createAnnouncement: (poolId: string, title: string, body: string) => void;
  approveApplication: (applicationId: string) => void;
  rejectApplication: (applicationId: string, reason: string) => void;
  sendInvitation: (poolId: string, professionalId: string) => void;
  createWorkspace: (input: Pick<Workspace, "name" | "description" | "objective" | "dueAt" | "budget"> & { category?: string; internalNotes?: string }) => Workspace;
  createTask: (input: Pick<Task, "workspaceId" | "title" | "description" | "priority" | "startDate" | "endDate" | "deadline" | "deliverables"> & { assigneeId?: string; poolId?: string }) => Task;
  assignTask: (taskId: string, professionalId: string, reason?: string) => void;
  removeAssignee: (taskId: string, reason: string) => void;
  updateTaskStatus: (taskId: string, status: Task["status"]) => void;
  approveMilestone: (milestoneId: string) => void;
  releasePayment: (milestoneId: string) => void;
  addReview: (taskId: string, rating: number, summary: string) => void;
  archiveWorkspace: (workspaceId: string) => boolean;
  markNotificationRead: (notificationId: string) => void;
  markAllNotificationsRead: () => void;
}

const TalentPoolContext = createContext<TalentPoolState | undefined>(undefined);

const defaultClientProfile: ClientProfile = {
  id: "client-1",
  name: "Avery Stone",
  email: "avery@northstar.example",
  company: "Northstar Digital",
  role: "Head of Product",
  phone: "+1 555 0148",
  industry: "Fintech",
  teamSize: "51-200",
  objective: "Build a trusted external workforce for product delivery.",
  signedUp: false,
  onboardingComplete: false,
};

const defaultConsultantProfile: ConsultantProfile = {
  id: "consultant-1",
  name: "Jordan Lee",
  email: "jordan.lee@consultant.io",
  title: "Full Stack Consultant",
  location: "Remote",
  timeZone: "UTC",
  category: "",
  skills: [],
  bio: "",
  professionalId: "pro-consultant",
  signedUp: false,
  onboardingComplete: false,
};

function getStoredPortalMode(): PortalMode {
  try {
    const stored = window.localStorage.getItem("talentPoolPortalMode");
    return stored === "consultant" ? "consultant" : "client";
  } catch {
    return "client";
  }
}

function getStoredConsultantProfile() {
  try {
    const stored = window.localStorage.getItem("talentPoolConsultantProfile");
    return stored ? { ...defaultConsultantProfile, ...JSON.parse(stored) } : defaultConsultantProfile;
  } catch {
    return defaultConsultantProfile;
  }
}

function getStoredClientProfile() {
  try {
    const stored = window.localStorage.getItem("talentPoolClientProfile");
    return stored ? { ...defaultClientProfile, ...JSON.parse(stored) } : defaultClientProfile;
  } catch {
    return defaultClientProfile;
  }
}

export function TalentPoolProvider({ children }: { children: ReactNode }) {
  const [portalMode, setPortalModeState] = useState<PortalMode>(getStoredPortalMode);
  const [clientProfile, setClientProfile] = useState<ClientProfile>(getStoredClientProfile);
  const [consultantProfile, setConsultantProfile] = useState<ConsultantProfile>(getStoredConsultantProfile);
  const [journeyEvents, setJourneyEvents] = useState<JourneyEvent[]>([]);
  const [professionals, setProfessionals] = useState(seedProfessionals);
  const [talentPools, setTalentPools] = useState(seedTalentPools);
  const [memberships, setMemberships] = useState(seedMemberships);
  const [applications, setApplications] = useState(seedApplications);
  const [invitations, setInvitations] = useState(seedInvitations);
  const [announcements, setAnnouncements] = useState(seedAnnouncements);
  const [workspaces, setWorkspaces] = useState(seedWorkspaces);
  const [tasks, setTasks] = useState(seedTasks);
  const [milestones, setMilestones] = useState(seedMilestones);
  const [reviews, setReviews] = useState(seedReviews);
  const [submissions, setSubmissions] = useState(seedSubmissions);
  const [taskMessages, setTaskMessages] = useState(seedTaskMessages);
  const [notifications, setNotifications] = useState(seedNotifications);
  const [paymentRecords, setPaymentRecords] = useState(seedPaymentRecords);

  useEffect(() => {
    window.localStorage.setItem("talentPoolClientProfile", JSON.stringify(clientProfile));
  }, [clientProfile]);

  useEffect(() => {
    window.localStorage.setItem("talentPoolConsultantProfile", JSON.stringify(consultantProfile));
  }, [consultantProfile]);

  useEffect(() => {
    window.localStorage.setItem("talentPoolPortalMode", portalMode);
  }, [portalMode]);

  const setPortalMode = (mode: PortalMode) => setPortalModeState(mode);

  const recordEvent = (title: string, body: string) => {
    setJourneyEvents((current) => [
      { id: `event-${Date.now()}-${current.length + 1}`, title, body, createdAt: new Date().toISOString() },
      ...current,
    ]);
  };

  const pushNotification = (title: string, body: string, type: Notification["type"], audience: Notification["audience"] = "client") => {
    setNotifications((current) => [
      { id: `note-${Date.now()}-${current.length + 1}`, title, body, type, read: false, createdAt: new Date().toISOString(), audience },
      ...current,
    ]);
  };

  const markNotificationRead: TalentPoolState["markNotificationRead"] = (notificationId) => {
    setNotifications((current) =>
      current.map((notification) =>
        notification.id === notificationId ? { ...notification, read: true } : notification,
      ),
    );
  };

  const markAllNotificationsRead: TalentPoolState["markAllNotificationsRead"] = () => {
    setNotifications((current) => current.map((notification) => ({ ...notification, read: true })));
  };

  const completeSignup: TalentPoolState["completeSignup"] = (profile) => {
    setClientProfile((current) => ({ ...current, ...profile, signedUp: true }));
    recordEvent("Client account created", `${profile.name} joined for ${profile.company}.`);
  };

  const completeOnboarding: TalentPoolState["completeOnboarding"] = (details) => {
    setClientProfile((current) => ({ ...current, ...details, onboardingComplete: true }));
    recordEvent("Onboarding completed", `${details.industry} team setup finished with objective: ${details.objective}`);
  };

  const completeConsultantSignup: TalentPoolState["completeConsultantSignup"] = (profile) => {
    setConsultantProfile((current) => ({
      ...current,
      ...profile,
      professionalId: current.professionalId || "pro-consultant",
      signedUp: true,
    }));
    setProfessionals((current) =>
      current.map((professional) =>
        professional.id === "pro-consultant"
          ? { ...professional, name: profile.name, email: profile.email, title: profile.title, location: profile.location, timeZone: profile.timeZone }
          : professional,
      ),
    );
    recordEvent("Consultant account created", `${profile.name} joined the consultant portal.`);
  };

  const completeConsultantOnboarding: TalentPoolState["completeConsultantOnboarding"] = (details) => {
    setConsultantProfile((current) => ({ ...current, ...details, onboardingComplete: true }));
    setProfessionals((current) =>
      current.map((professional) =>
        professional.id === consultantProfile.professionalId
          ? { ...professional, skills: details.skills, title: details.title, bio: details.bio }
          : professional,
      ),
    );
    pushNotification("Profile ready", "Your skills are live — discover matching talent pools.", "Announcement", "consultant");
    recordEvent("Consultant onboarding completed", `Category: ${details.category}`);
  };

  const submitConsultantApplication: TalentPoolState["submitConsultantApplication"] = (poolId, input) => {
    const professionalId = consultantProfile.professionalId;
    if (!professionalId) return undefined;
    const pool = talentPools.find((entry) => entry.id === poolId);
    if (!pool) return undefined;
    const existing = applications.find(
      (application) => application.poolId === poolId && application.professionalId === professionalId && application.status === "Pending",
    );
    if (existing) return existing;
    const application: Application = {
      id: `app-${Date.now()}`,
      poolId,
      professionalId,
      submittedAt: today,
      status: "Pending",
      matchScore: calculateSkillMatch(pool.requiredSkills, consultantProfile.skills),
      source: "Application",
      description: input.description,
      submissionStatus: pool.entryAssignment ? "Assignment submitted for review" : "Profile submitted for review",
      submissionDetails: input.submissionDetails,
      clientQuestions: input.clientQuestions,
      submissionAttachment: input.submissionAttachment,
    };
    setApplications((current) => [application, ...current]);
    pushNotification("Application submitted", `Your application to ${pool.name} is pending client review.`, "Application", "consultant");
    pushNotification("New application received", `${consultantProfile.name} applied to ${pool.name}.`, "Application", "client");
    recordEvent("Consultant application submitted", pool.name);
    return application;
  };

  const submitConsultantDeliverable: TalentPoolState["submitConsultantDeliverable"] = (taskId, input, milestoneId) => {
    const professionalId = consultantProfile.professionalId;
    const submission: Submission = {
      id: `sub-${Date.now()}`,
      taskId,
      milestoneId,
      professionalId,
      submittedAt: new Date().toISOString(),
      summary: input.summary,
      items: input.items.map((item, index) => ({ ...item, id: `sub-item-${Date.now()}-${index}` })),
    };
    setSubmissions((current) => [submission, ...current]);
    if (milestoneId) {
      const milestone = milestones.find((entry) => entry.id === milestoneId);
      setMilestones((current) =>
        current.map((entry) =>
          entry.id === milestoneId ? { ...entry, status: "Submitted", submittedAt: today } : entry,
        ),
      );
      pushNotification("Milestone work submitted", `${milestone?.title ?? "Milestone"} is ready for client review.`, "Milestone", "consultant");
      pushNotification("Deliverable submitted", "A consultant submitted milestone work for review.", "Task", "client");
    } else {
      setTasks((current) => current.map((task) => (task.id === taskId ? { ...task, status: "Submitted", submittedAt: today } : task)));
      pushNotification("Task submitted", "Your deliverables are awaiting client review.", "Task", "consultant");
      pushNotification("Deliverable submitted", "A consultant submitted work for review.", "Task", "client");
    }
    recordEvent("Consultant deliverable submitted", milestoneId ? "Milestone work submitted" : "Task work submitted");
  };

  const getDiscoverablePools = () => {
    const professionalId = consultantProfile.professionalId;
    const enrolledPoolIds = new Set(
      memberships.filter((membership) => membership.professionalId === professionalId && membership.status === "Active").map((membership) => membership.poolId),
    );
    return talentPools
      .filter((pool) => !pool.archived && pool.intakeStatus === "Open" && pool.visibility === "Public")
      .filter((pool) => !enrolledPoolIds.has(pool.id))
      .sort((a, b) => calculateSkillMatch(b.requiredSkills, consultantProfile.skills) - calculateSkillMatch(a.requiredSkills, consultantProfile.skills));
  };

  const getConsultantPools = () => {
    const professionalId = consultantProfile.professionalId;
    const poolIds = memberships
      .filter((membership) => membership.professionalId === professionalId && membership.status === "Active")
      .map((membership) => membership.poolId);
    return talentPools.filter((pool) => poolIds.includes(pool.id));
  };

  const getConsultantApplications = () =>
    applications.filter((application) => application.professionalId === consultantProfile.professionalId);

  const getConsultantTasks = () =>
    tasks.filter((task) => task.activeAssigneeId === consultantProfile.professionalId && task.status !== "Draft");

  const getConsultantWorkspaces = () => {
    const workspaceIds = new Set(getConsultantTasks().map((task) => task.workspaceId));
    return workspaces.filter((workspace) => workspaceIds.has(workspace.id));
  };

  const getConsultantPayments = () =>
    paymentRecords.filter((record) => record.professionalId === consultantProfile.professionalId && record.status === "Completed");

  const getConsultantInvitations = () =>
    invitations.filter((invitation) => invitation.professionalId === consultantProfile.professionalId);

  const getPendingApplicationsByPool = () => {
    const counts = new Map<string, number>();
    applications
      .filter((application) => resolveApplicationStatus(application) === "Pending")
      .forEach((application) => counts.set(application.poolId, (counts.get(application.poolId) ?? 0) + 1));
    return [...counts.entries()].map(([poolId, count]) => ({ poolId, count }));
  };

  const getInvestedAmountForWorkspace = (workspaceId: string) =>
    paymentRecords
      .filter((record) => record.workspaceId === workspaceId && record.status === "Completed")
      .reduce((sum, record) => sum + record.amount, 0);

  const getConsultantPoolMetrics = (poolId: string) => {
    const poolTasks = tasks.filter((task) => task.poolId === poolId && task.activeAssigneeId === consultantProfile.professionalId);
    const openTasks = poolTasks.filter((task) => !["Completed", "Approved", "Cancelled"].includes(task.status)).length;
    const closedTasks = poolTasks.filter((task) => ["Completed", "Approved"].includes(task.status)).length;
    const pendingApplications = applications.filter(
      (application) =>
        application.poolId === poolId &&
        application.professionalId === consultantProfile.professionalId &&
        application.status === "Pending",
    ).length;
    return { openTasks, closedTasks, pendingApplications };
  };

  const getConsultantWorkspaceMetrics = (workspaceId: string) => {
    const workspaceTasks = tasks.filter(
      (task) => task.workspaceId === workspaceId && task.activeAssigneeId === consultantProfile.professionalId,
    );
    const openTasks = workspaceTasks.filter((task) => !["Completed", "Approved", "Cancelled"].includes(task.status)).length;
    const closedTasks = workspaceTasks.filter((task) => ["Completed", "Approved"].includes(task.status)).length;
    const inReview = workspaceTasks.filter((task) => ["Submitted", "Under Review"].includes(task.status)).length;
    return { openTasks, closedTasks, inReview };
  };

  const getTasksForPool = (poolId: string) =>
    tasks.filter((task) => task.poolId === poolId && task.activeAssigneeId === consultantProfile.professionalId);

  const getPoolMatchScore = (poolId: string) => {
    const pool = talentPools.find((entry) => entry.id === poolId);
    return pool ? calculateSkillMatch(pool.requiredSkills, consultantProfile.skills) : 0;
  };

  const hasConsultantAppliedToPool = (poolId: string) =>
    applications.some(
      (application) =>
        application.poolId === poolId &&
        application.professionalId === consultantProfile.professionalId &&
        application.status === "Pending",
    );

  const isConsultantEnrolledInPool = (poolId: string) =>
    memberships.some(
      (membership) =>
        membership.poolId === poolId &&
        membership.professionalId === consultantProfile.professionalId &&
        membership.status === "Active",
    );

  const createTalentPool: TalentPoolState["createTalentPool"] = (input) => {
    const pool: TalentPool = {
      id: `pool-${Date.now()}`,
      ...input,
      createdAt: today,
      closedAt: input.intakeStatus === "Closed" ? today : undefined,
      archived: false,
      announcementIds: [],
    };
    setTalentPools((current) => [pool, ...current]);
    recordEvent("Talent Pool created", `${pool.name} was added as a reusable workforce asset.`);
    return pool;
  };

  const updateTalentPool: TalentPoolState["updateTalentPool"] = (poolId, input) => {
    setTalentPools((current) =>
      current.map((pool) =>
        pool.id === poolId
          ? { ...pool, ...input, closedAt: input.intakeStatus === "Closed" ? pool.closedAt ?? today : undefined }
          : pool,
      ),
    );
    recordEvent("Talent Pool updated", "Pool profile, description, visibility, and skills were edited.");
  };

  const closeTalentPool: TalentPoolState["closeTalentPool"] = (poolId) => {
    setTalentPools((current) => current.map((pool) => (pool.id === poolId ? { ...pool, intakeStatus: "Closed", closedAt: today } : pool)));
    pushNotification("Talent Pool closed", "This pool will no longer receive new applications.", "Application");
    recordEvent("Talent Pool closed", "Application intake was closed while historical records remain available.");
  };

  const openTalentPool: TalentPoolState["openTalentPool"] = (poolId) => {
    setTalentPools((current) => current.map((pool) => (pool.id === poolId ? { ...pool, intakeStatus: "Open", closedAt: undefined } : pool)));
    pushNotification("Talent Pool reopened", "This pool is now accepting new applications.", "Application");
    recordEvent("Talent Pool reopened", "Application intake was reopened for new submissions.");
  };

  const createAnnouncement: TalentPoolState["createAnnouncement"] = (poolId, title, body) => {
    const announcement: Announcement = {
      id: `ann-${Date.now()}`,
      poolId,
      title,
      body,
      createdAt: today,
      reactions: 0,
    };
    setAnnouncements((current) => [announcement, ...current]);
    setTalentPools((current) => current.map((pool) => (pool.id === poolId ? { ...pool, announcementIds: [announcement.id, ...pool.announcementIds] } : pool)));
    pushNotification("Announcement published", title, "Announcement");
    recordEvent("Announcement published", title);
  };

  const approveApplication: TalentPoolState["approveApplication"] = (applicationId) => {
    const application = applications.find((item) => item.id === applicationId);
    if (!application) return;
    setApplications((current) => current.map((item) => (item.id === applicationId ? { ...item, status: "Approved" } : item)));
    setMemberships((current) => {
      const existing = current.find((membership) => membership.poolId === application.poolId && membership.professionalId === application.professionalId);
      if (existing) {
        return current.map((membership) => (membership.id === existing.id ? { ...membership, status: "Active", joinedAt: today } : membership));
      }
      return [
        { id: `mem-${Date.now()}`, poolId: application.poolId, professionalId: application.professionalId, status: "Active", joinedAt: today },
        ...current,
      ];
    });
    pushNotification("Application approved", "The professional is now an active Talent Pool member.", "Application");
    recordEvent("Application approved", "Membership was activated and historical application record was preserved.");
  };

  const rejectApplication: TalentPoolState["rejectApplication"] = (applicationId, reason) => {
    setApplications((current) => current.map((item) => (item.id === applicationId ? { ...item, status: "Rejected", rejectionReason: reason } : item)));
    pushNotification("Application rejected", reason, "Application");
    recordEvent("Application rejected", reason);
  };

  const sendInvitation: TalentPoolState["sendInvitation"] = (poolId, professionalId) => {
    setInvitations((current) => [
      { id: `inv-${Date.now()}`, poolId, professionalId, sentAt: today, status: "Pending" },
      ...current,
    ]);
    pushNotification("Invitation sent", "Invitation will expire after 15 days if it remains pending.", "Application");
    recordEvent("Invitation sent", "Client invited a professional into a Talent Pool.");
  };

  const createWorkspace: TalentPoolState["createWorkspace"] = (input) => {
    const workspace: Workspace = {
      id: `workspace-${Date.now()}`,
      ...input,
      status: "Active",
      createdAt: today,
    };
    setWorkspaces((current) => [workspace, ...current]);
    recordEvent("Workspace created", `${workspace.name} was created independently from Talent Pools.`);
    return workspace;
  };

  const createTask: TalentPoolState["createTask"] = (input) => {
    const task: Task = {
      id: `task-${Date.now()}`,
      workspaceId: input.workspaceId,
      poolId: input.poolId,
      title: input.title,
      description: input.description,
      priority: input.priority,
      status: input.assigneeId ? "Assigned" : "Pending",
      startDate: input.startDate,
      endDate: input.endDate,
      deadline: input.deadline,
      deliverables: input.deliverables,
      activeAssigneeId: input.assigneeId,
      attachmentCount: 0,
      createdAt: today,
      assignmentHistory: input.assigneeId
        ? [{ id: `hist-${Date.now()}`, taskId: `task-${Date.now()}`, professionalId: input.assigneeId, assignedAt: today }]
        : [],
    };
    const taskWithHistory = {
      ...task,
      assignmentHistory: task.assignmentHistory.map((history) => ({ ...history, taskId: task.id })),
    };
    setTasks((current) => [taskWithHistory, ...current]);
    if (input.assigneeId) {
      setProfessionals((current) =>
        current.map((professional) =>
          professional.id === input.assigneeId
            ? { ...professional, activeTaskIds: [...new Set([...professional.activeTaskIds, taskWithHistory.id])] }
            : professional,
        ),
      );
    }
    pushNotification("Task created", taskWithHistory.title, "Task");
    recordEvent("Task created", input.assigneeId ? "Task assigned and workspace-pool association was derived automatically." : "Task is pending assignment.");
    return taskWithHistory;
  };

  const assignTask: TalentPoolState["assignTask"] = (taskId, professionalId, reason = "Assigned by client") => {
    const existingTask = tasks.find((task) => task.id === taskId);
    if (!existingTask) return;
    const previousAssignee = existingTask.activeAssigneeId;
    setTasks((current) =>
      current.map((task) => {
        if (task.id !== taskId) return task;
        const closedHistory = task.assignmentHistory.map((history) =>
          history.professionalId === task.activeAssigneeId && !history.removedAt ? { ...history, removedAt: today, reason } : history,
        );
        return {
          ...task,
          activeAssigneeId: professionalId,
          status: task.status === "Pending" ? "Assigned" : task.status,
          assignmentHistory: [
            ...closedHistory,
            { id: `hist-${Date.now()}`, taskId, professionalId, assignedAt: today, reason },
          ],
        };
      }),
    );
    setProfessionals((current) =>
      current.map((professional) => {
        const withoutTask = professional.activeTaskIds.filter((id) => id !== taskId);
        if (professional.id === professionalId) return { ...professional, activeTaskIds: [...new Set([...withoutTask, taskId])] };
        if (professional.id === previousAssignee) return { ...professional, activeTaskIds: withoutTask };
        return professional;
      }),
    );
    pushNotification("Task assigned", "Workspace access was granted through task assignment.", "Task");
    recordEvent("Task assigned", "One active assignee is now responsible for the task.");
  };

  const removeAssignee: TalentPoolState["removeAssignee"] = (taskId, reason) => {
    const existingTask = tasks.find((task) => task.id === taskId);
    if (!existingTask?.activeAssigneeId) return;
    const previousAssignee = existingTask.activeAssigneeId;
    setTasks((current) =>
      current.map((task) =>
        task.id === taskId
          ? {
              ...task,
              activeAssigneeId: undefined,
              status: "Pending",
              assignmentHistory: task.assignmentHistory.map((history) =>
                history.professionalId === previousAssignee && !history.removedAt ? { ...history, removedAt: today, reason } : history,
              ),
            }
          : task,
      ),
    );
    setProfessionals((current) =>
      current.map((professional) =>
        professional.id === previousAssignee ? { ...professional, activeTaskIds: professional.activeTaskIds.filter((id) => id !== taskId) } : professional,
      ),
    );
    pushNotification("Assignee removed", "Task access was revoked and historical records were preserved.", "Task");
    recordEvent("Assignee removed", reason);
  };

  const updateTaskStatus: TalentPoolState["updateTaskStatus"] = (taskId, status) => {
    setTasks((current) => current.map((task) => (task.id === taskId ? { ...task, status, submittedAt: status === "Submitted" ? today : task.submittedAt, approvedAt: status === "Approved" ? today : task.approvedAt } : task)));
    pushNotification("Task status updated", status, "Task");
    recordEvent("Task status updated", status);
  };

  const approveMilestone: TalentPoolState["approveMilestone"] = (milestoneId) => {
    setMilestones((current) => current.map((milestone) => (milestone.id === milestoneId ? { ...milestone, status: "Completed", paymentStatus: "Eligible" } : milestone)));
    pushNotification("Milestone approved", "Payment is now eligible for release.", "Milestone");
    recordEvent("Milestone approved", "Payment became eligible after client approval.");
  };

  const releasePayment: TalentPoolState["releasePayment"] = (milestoneId) => {
    setMilestones((current) => current.map((milestone) => (milestone.id === milestoneId ? { ...milestone, status: "Completed", paymentStatus: "Completed" } : milestone)));
    pushNotification("Payment released", "Payment record remains available for audit.", "Payment");
    recordEvent("Payment released", "Payment was completed and retained in history.");
  };

  const addReview: TalentPoolState["addReview"] = (taskId, rating, summary) => {
    setReviews((current) => [
      { id: `rev-${Date.now()}`, taskId, reviewerType: "Client", rating, summary, createdAt: today },
      ...current,
    ]);
    pushNotification("Review submitted", "Credibility scores update after new reviews.", "Review");
    recordEvent("Review submitted", summary);
  };

  const buildMilestonesFromInput = (taskId: string, inputs: CreateMilestoneInput[]): Milestone[] =>
    inputs
      .filter((input) => input.title.trim())
      .map((input, index) => ({
        id: `ms-${Date.now()}-${index}`,
        taskId,
        title: input.title,
        description: input.description,
        deliverables: [],
        startDate: input.startDate,
        endDate: input.endDate,
        deadline: input.endDate,
        amount: input.amount,
        attachments: input.attachments,
        status: "Planned" as const,
        paymentStatus: "Not Eligible" as const,
      }));

  const saveTask: TalentPoolState["saveTask"] = (input) => {
    const taskId = input.id ?? `task-${Date.now()}`;
    const existingTask = input.id ? tasks.find((task) => task.id === input.id) : undefined;
    const milestoneTotal = input.hasMilestones
      ? input.milestones.reduce((sum, milestone) => sum + (Number(milestone.amount) || 0), 0)
      : 0;
    const attachmentCount = input.hasMilestones
      ? input.milestones.reduce((sum, milestone) => sum + milestone.attachments.length, 0)
      : 0;
    const status = input.asDraft ? "Draft" : input.assigneeId ? "Assigned" : "Pending";

    const task: Task = {
      id: taskId,
      workspaceId: input.workspaceId,
      poolId: input.poolId,
      title: input.title,
      description: input.description,
      priority: existingTask?.priority ?? "Medium",
      status,
      startDate: input.startDate,
      endDate: input.endDate,
      deadline: input.endDate,
      deliverables: existingTask?.deliverables ?? [],
      budget: input.hasMilestones ? milestoneTotal : existingTask?.budget,
      activeAssigneeId: input.assigneeId,
      attachmentCount,
      createdAt: existingTask?.createdAt ?? today,
      assignmentHistory:
        !input.asDraft && input.assigneeId
          ? [
              ...(existingTask?.assignmentHistory ?? []),
              { id: `hist-${Date.now()}`, taskId, professionalId: input.assigneeId, assignedAt: today },
            ]
          : existingTask?.assignmentHistory ?? [],
      submittedAt: existingTask?.submittedAt,
      approvedAt: existingTask?.approvedAt,
    };

    if (input.id) {
      setTasks((current) => current.map((entry) => (entry.id === input.id ? task : entry)));
      setMilestones((current) => [
        ...current.filter((milestone) => milestone.taskId !== input.id),
        ...(input.hasMilestones ? buildMilestonesFromInput(taskId, input.milestones) : []),
      ]);
    } else {
      setTasks((current) => [task, ...current]);
      if (input.hasMilestones) {
        setMilestones((current) => [...buildMilestonesFromInput(taskId, input.milestones), ...current]);
      }
    }

    if (!input.asDraft) {
      if (input.assigneeId) {
        setProfessionals((current) =>
          current.map((professional) =>
            professional.id === input.assigneeId
              ? { ...professional, activeTaskIds: [...new Set([...professional.activeTaskIds, taskId])] }
              : professional,
          ),
        );
      }
      pushNotification("Task created", task.title, "Task");
      recordEvent("Task created", input.assigneeId ? "Task assigned and workspace-pool association was derived automatically." : "Task is pending assignment.");
    } else {
      pushNotification("Task saved as draft", task.title, "Task");
      recordEvent("Task draft saved", "You can continue editing this task later.");
    }

    return task;
  };

  const createTaskWithMilestones: TalentPoolState["createTaskWithMilestones"] = (taskInput, milestoneInputs) =>
    saveTask({
      workspaceId: taskInput.workspaceId,
      title: taskInput.title,
      description: taskInput.description,
      startDate: taskInput.startDate,
      endDate: taskInput.endDate,
      poolId: taskInput.poolId,
      assigneeId: taskInput.assigneeId,
      hasMilestones: milestoneInputs.length > 0,
      milestones: milestoneInputs,
      asDraft: false,
    });

  const requestMilestoneStart: TalentPoolState["requestMilestoneStart"] = (milestoneId) => {
    const milestone = milestones.find((entry) => entry.id === milestoneId);
    if (!milestone) return;
    setMilestones((current) =>
      current.map((entry) =>
        entry.id === milestoneId ? { ...entry, status: "Start Requested", startRequestedAt: today } : entry,
      ),
    );
    pushNotification("Milestone start requested", `${milestone.title} is awaiting client approval.`, "Milestone");
    recordEvent("Milestone start requested", milestone.title);
  };

  const approveMilestoneStart: TalentPoolState["approveMilestoneStart"] = (milestoneId) => {
    const milestone = milestones.find((entry) => entry.id === milestoneId);
    const task = milestone ? tasks.find((entry) => entry.id === milestone.taskId) : undefined;
    setMilestones((current) =>
      current.map((entry) =>
        entry.id === milestoneId
          ? { ...entry, status: "In Progress", paymentStatus: "Completed", startApprovedAt: today }
          : entry,
      ),
    );
    if (milestone && task) {
      setPaymentRecords((current) => [
        {
          id: `pay-${Date.now()}`,
          taskId: task.id,
          milestoneId: milestone.id,
          workspaceId: task.workspaceId,
          professionalId: task.activeAssigneeId ?? "",
          invoiceNumber: buildInvoiceNumber(milestone.id),
          amount: milestone.amount,
          lineItem: `${milestone.title} — milestone start payment`,
          taskTitle: task.title,
          milestoneTitle: milestone.title,
          status: "Completed",
          paidAt: today,
        },
        ...current,
      ]);
    }
    pushNotification("Milestone start approved", "Payment released. Consultant can begin work.", "Payment", "consultant");
    pushNotification("Milestone start approved", "Payment released to consultant. Work can begin.", "Payment", "client");
    recordEvent("Milestone start approved", "Payment was released before work began.");
  };

  const submitMilestoneWork: TalentPoolState["submitMilestoneWork"] = (milestoneId) => {
    const milestone = milestones.find((entry) => entry.id === milestoneId);
    if (!milestone) return;
    setMilestones((current) =>
      current.map((entry) =>
        entry.id === milestoneId ? { ...entry, status: "Submitted", submittedAt: today } : entry,
      ),
    );
    pushNotification("Milestone work submitted", `${milestone.title} is ready for client review.`, "Milestone");
    recordEvent("Milestone work submitted", milestone.title);
  };

  const approveMilestoneCompletion: TalentPoolState["approveMilestoneCompletion"] = (milestoneId) => {
    const milestone = milestones.find((entry) => entry.id === milestoneId);
    if (!milestone) return;
    setMilestones((current) =>
      current.map((entry) =>
        entry.id === milestoneId ? { ...entry, status: "Completed", completedAt: today } : entry,
      ),
    );
    pushNotification("Milestone completed", `${milestone.title} has been approved and closed.`, "Milestone");
    recordEvent("Milestone completed", milestone.title);
  };

  const requestMilestoneRework: TalentPoolState["requestMilestoneRework"] = (milestoneId, notes) => {
    const milestone = milestones.find((m) => m.id === milestoneId);
    if (!milestone) return;
    setMilestones((current) =>
      current.map((m) => m.id === milestoneId ? { ...m, status: "Revision Requested", reworkNotes: notes } : m)
    );
    setTaskMessages((current) => [
      {
        id: `msg-${Date.now()}`,
        taskId: milestone.taskId,
        authorName: "Avery Stone",
        authorRole: "Client",
        body: `Rework requested for milestone "${milestone.title}": ${notes}`,
        createdAt: new Date().toISOString(),
      },
      ...current,
    ]);
    pushNotification("Rework requested", `Revision requested for: ${milestone.title}`, "Task");
    recordEvent("Rework requested", notes);
  };

  const releasePaymentForMilestone: TalentPoolState["releasePaymentForMilestone"] = (milestoneId) => {
    approveMilestoneStart(milestoneId);
  };

  const requestTaskRework: TalentPoolState["requestTaskRework"] = (taskId, notes) => {
    setTasks((current) => current.map((t) => t.id === taskId ? { ...t, status: "Revision Requested" } : t));
    setTaskMessages((current) => [
      {
        id: `msg-${Date.now()}`,
        taskId,
        authorName: "Avery Stone",
        authorRole: "Client",
        body: `Rework requested: ${notes}`,
        createdAt: new Date().toISOString(),
      },
      ...current,
    ]);
    pushNotification("Rework requested", "Revision has been requested for this task.", "Task");
    recordEvent("Rework requested", notes);
  };

  const approveTask: TalentPoolState["approveTask"] = (taskId) => {
    setTasks((current) =>
      current.map((t) => t.id === taskId ? { ...t, status: "Approved", approvedAt: today } : t)
    );
    pushNotification("Task approved", "Task has been approved.", "Task");
    recordEvent("Task approved", "Client approved the task submission.");
  };

  const releasePaymentForTask: TalentPoolState["releasePaymentForTask"] = (taskId) => {
    const task = tasks.find((t) => t.id === taskId);
    setTasks((current) =>
      current.map((t) => t.id === taskId ? { ...t, status: "Completed", approvedAt: today } : t)
    );
    if (task) {
      setPaymentRecords((current) => [
        {
          id: `pay-${Date.now()}`,
          taskId: task.id,
          workspaceId: task.workspaceId,
          professionalId: task.activeAssigneeId ?? "",
          invoiceNumber: buildInvoiceNumber(task.id),
          amount: task.budget ?? 0,
          lineItem: `${task.title} — approved deliverables`,
          taskTitle: task.title,
          status: "Completed",
          paidAt: today,
        },
        ...current,
      ]);
    }
    pushNotification("Payment released", "Task payment has been released to the professional.", "Payment");
    recordEvent("Payment released", "Task was approved and payment released in one step.");
  };

  const canArchiveWorkspace = (workspaceId: string) => {
    const workspaceTaskIds = tasks.filter((task) => task.workspaceId === workspaceId).map((task) => task.id);
    const hasOpenTask = tasks.some((task) => task.workspaceId === workspaceId && !["Completed", "Cancelled", "Draft"].includes(task.status));
    const hasActiveMilestone = milestones.some((milestone) => workspaceTaskIds.includes(milestone.taskId) && milestone.status !== "Completed");
    return !hasOpenTask && !hasActiveMilestone;
  };

  const archiveWorkspace: TalentPoolState["archiveWorkspace"] = (workspaceId) => {
    if (!canArchiveWorkspace(workspaceId)) {
      recordEvent("Archive blocked", "Close or cancel open tasks and active milestones before archiving.");
      return false;
    }
    setWorkspaces((current) => current.map((workspace) => (workspace.id === workspaceId ? { ...workspace, status: "Archived" as WorkspaceStatus } : workspace)));
    recordEvent("Workspace archived", "Historical records remain preserved.");
    return true;
  };

  const value = useMemo<TalentPoolState>(() => {
    const professionalMap = new Map(professionals.map((professional) => [professional.id, professional]));
    const poolMap = new Map(talentPools.map((pool) => [pool.id, pool]));
    const workspaceMap = new Map(workspaces.map((workspace) => [workspace.id, workspace]));
    const taskMap = new Map(tasks.map((task) => [task.id, task]));

    const getProfessional = (id?: string) => (id ? professionalMap.get(id) : undefined);
    const getPool = (id: string) => poolMap.get(id);
    const getWorkspace = (id: string) => workspaceMap.get(id);
    const getTask = (id: string) => taskMap.get(id);

    const getActiveMembershipsForPool = (poolId: string) =>
      memberships.filter((membership) => membership.poolId === poolId && membership.status === "Active");

    const getPoolsForProfessional = (professionalId?: string) => {
      if (!professionalId) return [];
      return memberships
        .filter((membership) => membership.professionalId === professionalId && membership.status === "Active")
        .map((membership) => poolMap.get(membership.poolId))
        .filter((pool): pool is TalentPool => Boolean(pool));
    };

    const getProfessionalsForPool = (poolId: string) => {
      const memberIds = memberships
        .filter((membership) => membership.poolId === poolId && membership.status === "Active")
        .map((membership) => membership.professionalId);
      return professionals.filter((professional) => memberIds.includes(professional.id));
    };

    const getTasksForWorkspace = (workspaceId: string) => tasks.filter((task) => task.workspaceId === workspaceId);

    const getAssociatedPoolsForWorkspace = (workspaceId: string) => {
      const poolIds = new Set<string>();
      getTasksForWorkspace(workspaceId).forEach((task) => {
        getPoolsForProfessional(task.activeAssigneeId).forEach((pool) => poolIds.add(pool.id));
      });
      return [...poolIds].map((poolId) => poolMap.get(poolId)).filter((pool): pool is TalentPool => Boolean(pool));
    };

    const getMilestonesForTask = (taskId: string) => milestones.filter((milestone) => milestone.taskId === taskId);
    const getMilestone = (milestoneId: string) => milestones.find((milestone) => milestone.id === milestoneId);

    const getSubmissionForTask = (taskId: string) =>
      submissions.find((submission) => submission.taskId === taskId && !submission.milestoneId);

    const getSubmissionForMilestone = (milestoneId: string) =>
      submissions.find((submission) => submission.milestoneId === milestoneId);

    const getTaskProgress = (taskId: string) => {
      const taskMilestones = getMilestonesForTask(taskId);
      if (taskMilestones.length === 0) return 0;
      const completed = taskMilestones.filter((milestone) => milestone.status === "Completed").length;
      return Math.round((completed / taskMilestones.length) * 100);
    };

    const activeApplications = applications.filter((application) => resolveApplicationStatus(application) === "Pending");
    const expiredApplications = applications.filter((application) => resolveApplicationStatus(application) === "Expired");
    const clientNotifications = notifications.filter((notification) => !notification.audience || notification.audience === "client" || notification.audience === "all");
    const consultantNotifications = notifications.filter((notification) => notification.audience === "consultant" || notification.audience === "all");

    return {
      portalMode,
      setPortalMode,
      clientProfile,
      consultantProfile,
      journeyEvents,
      professionals,
      talentPools,
      memberships,
      applications,
      invitations,
      announcements,
      workspaces,
      tasks,
      milestones,
      reviews,
      submissions,
      taskMessages,
      notifications,
      clientNotifications,
      consultantNotifications,
      paymentRecords,
      activeApplications,
      expiredApplications,
      getProfessional,
      getPool,
      getWorkspace,
      getTask,
      getActiveMembershipsForPool,
      getPoolsForProfessional,
      getProfessionalsForPool,
      getAssociatedPoolsForWorkspace,
      getTasksForWorkspace,
      getMilestonesForTask,
      getMilestone,
      getSubmissionForTask,
      getSubmissionForMilestone,
      getTaskProgress,
      canArchiveWorkspace,
      completeSignup,
      completeOnboarding,
      completeConsultantSignup,
      completeConsultantOnboarding,
      submitConsultantApplication,
      submitConsultantDeliverable,
      getDiscoverablePools,
      getConsultantPools,
      getConsultantApplications,
      getConsultantWorkspaces,
      getConsultantTasks,
      getConsultantPayments,
      getConsultantInvitations,
      getPendingApplicationsByPool,
      getInvestedAmountForWorkspace,
      getConsultantPoolMetrics,
      getConsultantWorkspaceMetrics,
      getTasksForPool,
      getPoolMatchScore,
      hasConsultantAppliedToPool,
      isConsultantEnrolledInPool,
      createTalentPool,
      updateTalentPool,
      closeTalentPool,
      openTalentPool,
      createAnnouncement,
      createTaskWithMilestones,
      saveTask,
      requestMilestoneStart,
      approveMilestoneStart,
      submitMilestoneWork,
      approveMilestoneCompletion,
      requestMilestoneRework,
      releasePaymentForMilestone,
      requestTaskRework,
      approveTask,
      releasePaymentForTask,
      approveApplication,
      rejectApplication,
      sendInvitation,
      createWorkspace,
      createTask,
      assignTask,
      removeAssignee,
      updateTaskStatus,
      approveMilestone,
      releasePayment,
      addReview,
      archiveWorkspace,
      markNotificationRead,
      markAllNotificationsRead,
    };
  }, [announcements, applications, clientProfile, consultantProfile, invitations, journeyEvents, memberships, milestones, notifications, paymentRecords, portalMode, professionals, reviews, submissions, talentPools, taskMessages, tasks, workspaces]);

  return <TalentPoolContext.Provider value={value}>{children}</TalentPoolContext.Provider>;
}

export function useTalentPool() {
  const context = useContext(TalentPoolContext);
  if (!context) {
    throw new Error("useTalentPool must be used within TalentPoolProvider");
  }
  return context;
}
