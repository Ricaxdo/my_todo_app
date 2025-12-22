import type { NextFunction, Request, Response } from "express";
import { unauthorized } from "../errors/AppError";
import type { AuthRequest } from "../middleware/auth";
import { UserModel } from "../users/user.model";
import { signToken } from "./auth.utils";

// 👇 ajusta los paths según tu estructura real
import { WorkspaceModel } from "../workspaces/workspace.model";
import { WorkspaceMemberModel } from "../workspaces/workspaceMember.model";

export async function signup(req: Request, res: Response, next: NextFunction) {
  let createdUserId: string | null = null;
  let createdWorkspaceId: string | null = null;

  try {
    const { name, lastName, phone, email, password } = req.body as {
      name: string;
      lastName: string;
      phone: string;
      email: string;
      password: string;
    };

    const cleanEmail = email.trim().toLowerCase();
    const cleanPhone = phone.replace(/\D/g, "");

    // 1) Crear user
    const user = await UserModel.create({
      name: name.trim(),
      lastName: lastName.trim(),
      phone: cleanPhone,
      email: cleanEmail,
      password,
    });
    createdUserId = user._id.toString();

    // 2) Crear workspace personal
    const personalWorkspace = await WorkspaceModel.create({
      name: "Personal",
      owner: user._id,
      isPersonal: true,
      inviteCode: null, // opcional, el hook ya lo forzará
    });
    createdWorkspaceId = personalWorkspace._id.toString();

    // 3) Crear membership
    await WorkspaceMemberModel.create({
      workspaceId: personalWorkspace._id,
      userId: user._id,
      role: "owner",
    });

    // 4) Link en user
    user.personalWorkspaceId = personalWorkspace._id;
    await user.save();

    const token = signToken({
      _id: user._id.toString(),
      email: user.email,
    });

    return res.status(201).json({
      token,
      personalWorkspaceId: personalWorkspace._id.toString(),
    });
  } catch (err) {
    // 🔥 rollback best-effort para no dejar basura
    try {
      if (createdWorkspaceId) {
        await WorkspaceMemberModel.deleteMany({
          workspaceId: createdWorkspaceId,
        });
        await WorkspaceModel.findByIdAndDelete(createdWorkspaceId);
      }

      if (createdUserId) {
        await UserModel.findByIdAndDelete(createdUserId);
      }
    } catch {
      // si el rollback falla, no bloqueamos el error original
    }

    return next(err);
  }
}

export async function login(req: Request, res: Response, next: NextFunction) {
  try {
    const { email, password } = req.body as { email: string; password: string };

    const cleanEmail = email.trim().toLowerCase();

    const user = await UserModel.findOne({ email: cleanEmail }).select(
      "+password"
    );

    if (!user) throw unauthorized("invalid credentials");

    const isValid = await user.comparePassword(password);
    if (!isValid) throw unauthorized("invalid credentials");

    const token = signToken({
      _id: user._id.toString(),
      email: user.email,
    });

    return res.json({ token });
  } catch (err) {
    return next(err);
  }
}

export async function me(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const userId = req.user?._id;

    const user = await UserModel.findById(userId).select(
      "name lastName phone email personalWorkspaceId"
    );

    if (!user) throw unauthorized("authorization required");

    return res.json({
      user: {
        _id: user._id.toString(),
        name: user.name,
        lastName: user.lastName,
        phone: user.phone,
        email: user.email,
        personalWorkspaceId: user.personalWorkspaceId?.toString() ?? null,
      },
    });
  } catch (err) {
    return next(err);
  }
}
