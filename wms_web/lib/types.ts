export type Role = "admin" | "manager" | "staff";
export type WorkshopStatus = "scheduled" | "cancelled" | "completed";
export type RegistrationStatus = "active" | "cancelled";

export type User = {
  id: number;
  email: string;
  fullName: string;
  role: Role;
  isActive: boolean;
  createdAt: string;
};

export type Workshop = {
  id: number;
  code: string;
  title: string;
  instructor: string;
  startAt: string;
  location: string;
  capacity: number;
  activeCount: number;
  seatsAvailable: number;
  status: WorkshopStatus;
  createdBy: number;
  createdAt: string;
};

export type Registration = {
  id: number;
  workshopId: number;
  attendeeName: string;
  attendeeEmail: string;
  status: RegistrationStatus;
  registeredBy: number;
  registeredAt: string;
  cancelledBy: number | null;
  cancelledAt: string | null;
};

export type AuditLog = {
  id: number;
  actorId: number;
  entityType: string;
  entityId: number;
  action: string;
  details: Record<string, unknown> | null;
  createdAt: string;
};

export type LoginResponse = {
  accessToken: string;
  tokenType: string;
  user: User;
};
