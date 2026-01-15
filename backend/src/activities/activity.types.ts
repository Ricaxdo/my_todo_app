import type { ActivityType } from "./activity.model";

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
  createdAt: string;
};

export type ActivityListResponse = {
  items: ActivityItem[];
  nextCursor: string | null;
};
