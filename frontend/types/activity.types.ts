export type ActivityType =
  | "todo.create"
  | "todo.toggle"
  | "todo.delete"
  | "todo.bulk_create"
  | "todo.bulk_complete"
  | "todo.bulk_delete"
  | "workspace.join"
  | "workspace.leave"
  | "workspace.delete"
  | "member.remove";

export type ActivityItem = {
  id: string;
  workspaceId: string;
  type: ActivityType;
  entity: "todo" | "workspace" | "member";
  actor: {
    userId: string;
    name: string;
    lastName?: string;
    email?: string;
  };
  meta?: Record<string, unknown>;
  createdAt: string; // ISO
};

export type ActivityListResponse = {
  items: ActivityItem[];
  nextCursor: string | null;
};
