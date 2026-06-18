import { applicationExpiryDays, today } from "../data/mockData";
import type { Application, ApplicationStatus, Invitation, InvitationStatus } from "../types";

export function daysBetween(start: string, end = today) {
  const startDate = new Date(`${start}T00:00:00`);
  const endDate = new Date(`${end}T00:00:00`);
  return Math.floor((endDate.getTime() - startDate.getTime()) / 86_400_000);
}

export function formatDate(date: string) {
  return new Intl.DateTimeFormat("en", { month: "short", day: "numeric", year: "numeric" }).format(new Date(`${date}T00:00:00`));
}

export function formatDateTime(date: string) {
  return new Intl.DateTimeFormat("en", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" }).format(new Date(date));
}

export function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(amount);
}

export function resolveApplicationStatus(application: Application): ApplicationStatus {
  if (application.status === "Pending" && daysBetween(application.submittedAt) >= applicationExpiryDays) {
    return "Expired";
  }
  return application.status;
}

export function resolveInvitationStatus(invitation: Invitation): InvitationStatus {
  if (invitation.status === "Pending" && daysBetween(invitation.sentAt) >= applicationExpiryDays) {
    return "Expired";
  }
  return invitation.status;
}

export function daysUntil(date: string) {
  return daysBetween(today, date);
}
