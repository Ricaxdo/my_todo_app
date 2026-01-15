import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { env } from "../config/env";
import { unauthorized } from "../errors/AppError";

/**
 * Payload esperado dentro del JWT.
 * Debe coincidir con lo que se firma en auth.utils (signToken).
 *
 * Regla: solo datos mínimos de identificación.
 */
export type JwtPayload = {
  _id: string;
  email: string;
};

/**
 * Extensión del Request de Express para requests autenticados.
 * El middleware `auth` inyecta `req.user` si el token es válido.
 */
export type AuthRequest = Request & {
  user?: JwtPayload;
};

/**
 * Middleware de autenticación JWT.
 *
 * Responsabilidad:
 * - Leer el header Authorization
 * - Validar formato Bearer
 * - Verificar y decodificar el token
 * - Inyectar payload en req.user
 *
 * NO:
 * - No hace queries a DB
 * - No decide permisos (eso va en middlewares/guards aparte)
 */
export function auth(req: AuthRequest, res: Response, next: NextFunction) {
  /**
   * Header esperado:
   * Authorization: Bearer <token>
   */
  const header = req.header("Authorization");

  // Si no hay header o no sigue el formato correcto → no autorizado.
  if (!header || !header.startsWith("Bearer ")) {
    throw unauthorized("authorization required");
  }

  // Extraemos el token quitando el prefijo "Bearer ".
  const token = header.slice("Bearer ".length);

  try {
    /**
     * Verificación del token:
     * - Usa el jwtSecret del env
     * - Valida firma y expiración automáticamente
     */
    const payload = jwt.verify(token, env.jwtSecret) as JwtPayload;

    /**
     * Inyectamos el payload en req.user
     * para que controllers posteriores puedan usarlo.
     */
    req.user = payload;
    next();
  } catch {
    /**
     * Error genérico para no filtrar si el token expiró,
     * es inválido o fue manipulado (mejor seguridad).
     */
    throw unauthorized("invalid or expired token");
  }
}
