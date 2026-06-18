export type Availability = "Available" | "Partially Available" | "Fully Occupied";
export type MembershipStatus = "Active" | "Removed" | "Inactive" | "Suspended";
export type ApplicationStatus = "Pending" | "Approved" | "Rejected" | "Withdrawn" | "Cancelled" | "Expired";
export type InvitationStatus = "Pending" | "Accepted" | "Declined" | "Expired" | "Cancelled";
export type PoolVisibility = "Public" | "Invite Only";
export type PoolIntakeStatus = "Open" | "Closed";
export type WorkspaceStatus = "Active" | "Archived" | "At Risk" | "Completed";
export type TaskStatus =
  | "Draft"
  | "Pending"
  | "Assigned"
  | "In Progress"
  | "Submitted"
  | "Under Review"
  | "Revision Requested"
  | "Approved"
  | "Completed"
  | "Cancelled";
export type TaskPriority = "Low" | "Medium" | "High" | "Urgent";
export type MilestoneStatus =
  | "Planned"
  | "Start Requested"
  | "Start Approved"
  | "In Progress"
  | "Submitted"
  | "Under Review"
  | "Revision Requested"
  | "Completed";
export type PaymentStatus = "Not Eligible" | "Eligible" | "Released" | "Completed";

export interface TaskAttachment {
  id: string;
  name: string;
  size?: string;
}

export type PortalMode = "client" | "consultant";

export interface ConsultantProfile {
  id: string;
  name: string;
  email: string;
  title: string;
  location: string;
  timeZone: string;
  category: string;
  skills: string[];
  bio: string;
  professionalId: string;
  signedUp: boolean;
  onboardingComplete: boolean;
}

export interface ClientProfile {
  id: string;
  name: string;
  email: string;
  company: string;
  role: string;
  phone: string;
  industry: string;
  teamSize: string;
  objective: string;
  signedUp: boolean;
  onboardingComplete: boolean;
}

export interface JourneyEvent {
  id: string;
  title: string;
  body: string;
  createdAt: string;
}

export type SubmissionItemType = "link" | "file";

export interface SubmissionItem {
  id: string;
  type: SubmissionItemType;
  label: string;
  url: string;
  size?: string;
}

export interface Submission {
  id: string;
  taskId: string;
  milestoneId?: string;
  professionalId: string;
  submittedAt: string;
  summary: string;
  items: SubmissionItem[];
}

export interface Professional {
  id: string;
  name: string;
  email: string;
  title: string;
  avatar: string;
  photoUrl: string;
  location: string;
  timeZone: string;
  skills: string[];
  availability: Availability;
  rating: number;
  completionRate: number;
  onTimeRate: number;
  communicationScore: number;
  activeTaskIds: string[];
  portfolio: string;
  resumeAvailable: boolean;
  bio: string;
  joinedAt: string;
}

export interface TalentPool {
  id: string;
  name: string;
  description: string;
  category?: string;
  openings?: number;
  requiredSkills: string[];
  visibility: PoolVisibility;
  intakeStatus: PoolIntakeStatus;
  closedAt?: string;
  entryAssignment: {
    title: string;
    brief: string;
    deliverables: string[];
    estimatedHours: number;
    clientQuestions: string[];
  } | null;
  createdAt: string;
  archived: boolean;
  announcementIds: string[];
}

export interface Membership {
  id: string;
  poolId: string;
  professionalId: string;
  status: MembershipStatus;
  joinedAt: string;
  removedAt?: string;
  removalReason?: string;
}

export interface Application {
  id: string;
  poolId: string;
  professionalId: string;
  submittedAt: string;
  status: ApplicationStatus;
  matchScore: number;
  source: "Application" | "Invitation";
  description: string;
  submissionStatus: string;
  submissionDetails: string;
  clientQuestions: Array<{
    question: string;
    answer: string;
  }>;
  rejectionReason?: string;
}

export interface Invitation {
  id: string;
  poolId: string;
  professionalId: string;
  sentAt: string;
  status: InvitationStatus;
  declineReason?: string;
}

export interface Announcement {
  id: string;
  poolId: string;
  title: string;
  body: string;
  createdAt: string;
  reactions: number;
}

export interface Workspace {
  id: string;
  name: string;
  description: string;
  objective: string;
  status: WorkspaceStatus;
  createdAt: string;
  dueAt: string;
  budget: number;
  category?: string;
  internalNotes?: string;
}

export interface AssignmentHistory {
  id: string;
  taskId: string;
  professionalId?: string;
  assignedAt: string;
  removedAt?: string;
  reason?: string;
}

export interface Task {
  id: string;
  workspaceId: string;
  poolId?: string;
  title: string;
  description: string;
  priority: TaskPriority;
  status: TaskStatus;
  startDate: string;
  endDate: string;
  deadline: string;
  deliverables: string[];
  budget?: number;
  activeAssigneeId?: string;
  attachmentCount: number;
  assignmentHistory: AssignmentHistory[];
  createdAt: string;
  submittedAt?: string;
  approvedAt?: string;
}

export interface Milestone {
  id: string;
  taskId: string;
  title: string;
  description: string;
  deliverables: string[];
  startDate: string;
  endDate: string;
  deadline: string;
  amount: number;
  attachments: TaskAttachment[];
  status: MilestoneStatus;
  paymentStatus: PaymentStatus;
  reworkNotes?: string;
  startRequestedAt?: string;
  startApprovedAt?: string;
  submittedAt?: string;
  completedAt?: string;
}

export interface CreateMilestoneInput {
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  amount: number;
  attachments: TaskAttachment[];
}

export interface SaveTaskInput {
  id?: string;
  workspaceId: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  poolId?: string;
  assigneeId?: string;
  hasMilestones: boolean;
  milestones: CreateMilestoneInput[];
  asDraft: boolean;
}

export interface Review {
  id: string;
  taskId: string;
  milestoneId?: string;
  reviewerType: "Client" | "Professional";
  rating: number;
  summary: string;
  createdAt: string;
}

export interface TaskMessage {
  id: string;
  taskId: string;
  authorName: string;
  authorRole: "Client" | "Professional";
  body: string;
  createdAt: string;
}

export interface PaymentRecord {
  id: string;
  taskId: string;
  milestoneId?: string;
  workspaceId: string;
  professionalId: string;
  invoiceNumber: string;
  amount: number;
  lineItem: string;
  taskTitle: string;
  milestoneTitle?: string;
  status: "Completed" | "Scheduled";
  paidAt?: string;
  scheduledFor?: string;
}

export interface Notification {
  id: string;
  title: string;
  body: string;
  createdAt: string;
  type: "Application" | "Task" | "Milestone" | "Payment" | "Review" | "Announcement";
  read: boolean;
  audience?: "client" | "consultant" | "all";
}

export interface ConsultantApplicationInput {
  description: string;
  submissionDetails: string;
  clientQuestions: Array<{ question: string; answer: string }>;
}

export interface ConsultantSubmissionInput {
  summary: string;
  items: Array<{ type: "link" | "file"; label: string; url: string; size?: string }>;
}
