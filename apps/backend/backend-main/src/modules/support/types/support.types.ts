/**
 * Enum for ticket priority levels
 */
export enum TicketPriorityEnum {
  HIGH = "high",
  LOW = "low",
  MEDIUM = "medium",
  URGENT = "urgent",
}

/**
 * Enum for ticket status
 */
export enum TicketStatusEnum {
  ASSIGNED = "assigned",
  CLOSED = "closed",
  IN_PROGRESS = "in_progress",
  OPEN = "open",
  RESOLVED = "resolved",
}

/**
 * Enum for message types in support chat
 */
export enum MessageTypeEnum {
  FILE = "file",
  IMAGE = "image",
  QUICK_REPLY = "quick_reply",
  SYSTEM = "system",
  TEXT = "text",
}

/**
 * Enum for ticket activity types
 */
export enum TicketActivityEnum {
  AGENT_ASSIGNED = "agent_assigned",
  MESSAGE_SENT = "message_sent",
  NOTE_ADDED = "note_added",
  PRIORITY_CHANGED = "priority_changed",
  STATUS_CHANGED = "status_changed",
  TICKET_CREATED = "ticket_created",
  TICKET_REOPENED = "ticket_reopened",
  TICKET_RESOLVED = "ticket_resolved",
}

/**
 * Type for ticket metadata
 */
export interface ITicketMetadata {
  browser?: string;
  customFields?: Record<string, any>;
  location?: string;
  platform?: string;
}

/**
 * Type for message metadata
 */
export interface IMessageMetadata {
  attachmentUrl?: string;
  fileName?: string;
  fileSize?: number;
  mimeType?: string;
  quickReplyOptions?: string[];
}

/**
 * Type for ticket activity details
 */
export interface ITicketActivityDetails {
  description?: string;
  from?: string;
  metadata?: Record<string, any>;
  timestamp: Date;
  to?: string;
}
