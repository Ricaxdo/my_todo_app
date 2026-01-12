import type { NextFunction, Request, Response } from "express";
import { unauthorized } from "../errors/AppError";
import type { AuthRequest } from "../middleware/auth";
import { UserModel } from "../users/user.model";
import { signToken } from "./auth.utils";

// 👇 ajusta los paths según tu estructura real
import { WorkspaceMemberModel } from "../members/workspaceMember.model";
import { WorkspaceModel } from "../workspaces/workspace.model";

/**
 * POST /auth/signup
 *
 * Crea un usuario y su "workspace personal" (isPersonal=true) + membership owner.
 * Devuelve un JWT y el personalWorkspaceId para que el FE pueda arrancar.
 *
 */
export async function signup(req: Request, res: Response, next: NextFunction) {
  // Guardamos IDs creados para rollback si algo explota a mitad del flujo.
  let createdUserId: string | null = null;
  let createdWorkspaceId: string | null = null;

  try {
    /**
     * Body esperado (idealmente validado con celebrate/Joi antes de llegar aquí).
     * password llega en claro y el modelo debería encargarse de hashearlo (pre-save).
     */
    const { name, lastName, phone, email, password } = req.body as {
      name: string;
      lastName: string;
      phone: string;
      email: string;
      password: string;
    };

    // Normalización: evitamos duplicados por mayúsculas/espacios.
    const cleanEmail = email.trim().toLowerCase();
    // Normalización: guardamos teléfono solo como dígitos.
    const cleanPhone = phone.replace(/\D/g, "");

    // 1) Crear user (si tu modelo tiene unique index en email, aquí puede tronar).
    const user = await UserModel.create({
      name: name.trim(),
      lastName: lastName.trim(),
      phone: cleanPhone,
      email: cleanEmail,
      password,
    });
    createdUserId = user._id.toString();

    /**
     * 2) Crear workspace personal:
     * - isPersonal=true para diferenciarlo de workspaces compartidos.
     * - owner = user._id
     * - SIN inviteCode (por ser personal / no joinable).
     */
    const personalWorkspace = await WorkspaceModel.create({
      name: "Personal",
      owner: user._id,
      isPersonal: true,
    });
    createdWorkspaceId = personalWorkspace._id.toString();

    /**
     * 3) Crear membership:
     * El user también debe existir como miembro del workspace personal.
     * role="owner" para permisos totales.
     */
    await WorkspaceMemberModel.create({
      workspaceId: personalWorkspace._id,
      userId: user._id,
      role: "owner",
    });

    /**
     * 4) Link en user:
     * Guardamos referencia al workspace personal para accesos rápidos
     * y para que el FE sepa cuál es su "home workspace".
     */
    user.personalWorkspaceId = personalWorkspace._id;
    await user.save();

    /**
     * JWT:
     * Metemos info mínima (id + email). Evita inflar el token con datos sensibles.
     */
    const token = signToken({
      _id: user._id.toString(),
      email: user.email,
    });

    return res.status(201).json({
      token,
      personalWorkspaceId: personalWorkspace._id.toString(),
    });
  } catch (err) {
    /**
     * Log útil para debugging de errores típicos:
     * - code 11000 => duplicate key (email ya existe)
     * - keyPattern / keyValue => qué campo chocó
     */
    console.log("[signup error]", {
      code: (err as any)?.code,
      keyPattern: (err as any)?.keyPattern,
      keyValue: (err as any)?.keyValue,
      message: (err as any)?.message,
    });

    /**
     * Rollback best-effort:
     * Si falló después de crear cosas, intentamos borrar lo creado para no dejar basura.
     *
     * Orden recomendado:
     * - borrar membership(s) del workspace
     * - borrar workspace
     * - borrar user
     *
     */
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
      // Si el rollback falla, no tapamos el error original.
    }

    return next(err);
  }
}

/**
 * POST /auth/login
 *
 * Valida credenciales y devuelve JWT.
 * Importante: select("+password") porque típicamente password está `select: false`.
 */
export async function login(req: Request, res: Response, next: NextFunction) {
  try {
    const { email, password } = req.body as { email: string; password: string };

    const cleanEmail = email.trim().toLowerCase();

    // Traemos password solo para comparar (no lo mandamos al cliente).
    const user = await UserModel.findOne({ email: cleanEmail }).select(
      "+password"
    );

    // Mensaje genérico para no filtrar si el email existe o no (seguridad básica).
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

/**
 * GET /auth/me
 *
 * Devuelve el "perfil mínimo" del usuario autenticado.
 * - userId se obtiene del middleware auth (req.user).
 */
export async function me(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const userId = req.user?._id;

    // Seleccionamos solo lo que el FE necesita (evita filtrar datos sensibles).
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

/**
 * DELETE /auth/me
 *
 * Borra al usuario actual y limpia relaciones principales:
 * - memberships (WorkspaceMember)
 * - su workspace personal (si existe)
 * - el user
 */
export async function deleteMe(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const userId = req.user?._id;
    if (!userId) throw unauthorized("authorization required");

    // Solo necesitamos el personalWorkspaceId para poder eliminarlo.
    const user = await UserModel.findById(userId).select("personalWorkspaceId");
    if (!user) throw unauthorized("authorization required");

    const personalWorkspaceId = user.personalWorkspaceId?.toString() ?? null;

    // 1) Limpia memberships del usuario en cualquier workspace.
    await WorkspaceMemberModel.deleteMany({ userId });

    // 2) Borra su workspace personal (si aplica).
    if (personalWorkspaceId) {
      await WorkspaceModel.findByIdAndDelete(personalWorkspaceId);
    }

    // 3) Borra el user.
    await UserModel.findByIdAndDelete(userId);

    return res.status(200).json({ success: true });
  } catch (err) {
    return next(err);
  }
}
