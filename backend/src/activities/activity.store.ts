// src/activities/activity.store.ts
import mongoose from "mongoose";
import { UserModel } from "../users/user.model";
import { ActivityModel, type ActivityType } from "./activity.model";
import type { ActivityItem, ActivityListResponse } from "./activity.types";

function toObjectId(id: string) {
  return new mongoose.Types.ObjectId(id);
}

export async function createActivity(input: {
  workspaceId: string;
  actorUserId: string;
  type: ActivityType;
  entity: "todo" | "workspace" | "member";
  meta?: Record<string, unknown>;
}) {
  await ActivityModel.create({
    workspaceId: toObjectId(input.workspaceId),
    actorUserId: toObjectId(input.actorUserId),
    type: input.type,
    entity: input.entity,
    meta: input.meta ?? {},
  });
}

export async function listWorkspaceActivity(params: {
  workspaceId: string;
  limit?: number;
  before?: string; // ISO cursor (createdAt)
}): Promise<ActivityListResponse> {
  const limit = Math.max(1, Math.min(params.limit ?? 30, 100));

  const filter: Record<string, unknown> = {
    workspaceId: toObjectId(params.workspaceId),
  };

  if (params.before) {
    const d = new Date(params.before);
    if (!Number.isNaN(d.getTime())) {
      filter.createdAt = { $lt: d };
    }
  }

  const docs = await ActivityModel.find(filter)
    .sort({ createdAt: -1 })
    .limit(limit + 1) // para saber si hay next page
    .lean()
    .exec();

  const slice = docs.slice(0, limit);
  const hasMore = docs.length > limit;

  // juntamos actores
  const actorIds = Array.from(new Set(slice.map((d) => String(d.actorUserId))));

  const users = await UserModel.find({ _id: { $in: actorIds } })
    .select("name lastName email")
    .lean()
    .exec();

  const userMap = new Map(
    users.map((u) => {
      const actor: {
        userId: string;
        name: string;
        lastName?: string;
        email?: string;
      } = {
        userId: String(u._id),
        name: String(u.name ?? ""),
      };

      if (u.lastName) actor.lastName = String(u.lastName);
      if (u.email) actor.email = String(u.email);

      return [String(u._id), actor] as const;
    })
  );

  function isActivityEntity(x: unknown): x is "todo" | "workspace" | "member" {
    return x === "todo" || x === "workspace" || x === "member";
  }

  const items: ActivityItem[] = slice.map((d) => {
    const actorId = String(d.actorUserId);
    const actor = userMap.get(actorId) ?? {
      userId: actorId,
      name: "Unknown",
    };

    return {
      id: String(d._id),
      workspaceId: String(d.workspaceId),
      type: d.type as any,
      entity: d.entity as any,
      actor,
      meta: (d.meta ?? undefined) as any,
      createdAt:
        d.createdAt instanceof Date
          ? d.createdAt.toISOString()
          : String(d.createdAt),
    };
  });

  const nextCursor = hasMore
    ? items[items.length - 1]?.createdAt ?? null
    : null;

  return { items, nextCursor };
}
