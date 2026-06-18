import type { ApplicationStatus, InvitationStatus, MilestoneStatus, PoolIntakeStatus, TaskPriority, TaskStatus, WorkspaceStatus } from "../../types";
import { Badge, type BadgeTone } from "./Badge";

export function statusTone(status: ApplicationStatus | InvitationStatus | MilestoneStatus | TaskPriority | TaskStatus | WorkspaceStatus | PoolIntakeStatus): BadgeTone {
  if (["Approved", "Completed", "Start Approved", "Accepted", "Active", "Open"].includes(status)) return "success";
  if (["In Progress", "Assigned", "Submitted", "Under Review"].includes(status)) return "blue";
  if (["Urgent", "High", "At Risk", "Revision Requested", "Expired", "Start Requested", "Closed"].includes(status)) return "coral";
  if (["Pending", "Medium", "Eligible", "Partially Available", "Planned", "Draft"].includes(status)) return "amber";
  return "neutral";
}

export function StatusBadge({ status }: { status: ApplicationStatus | InvitationStatus | MilestoneStatus | TaskPriority | TaskStatus | WorkspaceStatus | PoolIntakeStatus }) {
  return <Badge tone={statusTone(status)}>{status}</Badge>;
}
