// src/activities/workspaceActivity.controller.ts
import type { NextFunction, Response } from "express";
import type { AuthRequest } from "../middleware/auth";
import { listWorkspaceActivity } from "./activity.store";

export async function getWorkspaceActivity(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const { workspaceId } = req.params as { workspaceId: string };
    const { limit, before } = req.query as { limit?: string; before?: string };

    const parsedLimit = limit ? Number(limit) : NaN;
    const cleanBefore =
      typeof before === "string" && before.trim() ? before.trim() : null;

    const params = {
      workspaceId,
      ...(Number.isFinite(parsedLimit) ? { limit: parsedLimit } : {}),
      ...(cleanBefore ? { before: cleanBefore } : {}),
    };

    const data = await listWorkspaceActivity(params);
    return res.json(data);
  } catch (err) {
    return next(err);
  }
}
