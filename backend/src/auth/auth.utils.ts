import jwt, { type SignOptions } from "jsonwebtoken";
import { env } from "../config/env";

/**
 * Payload mínimo que guardamos dentro del JWT.
 * Regla: solo info necesaria para identificar al usuario.
 * (Nunca datos sensibles ni pesados).
 */
type JwtPayload = {
  _id: string;
  email: string;
};

/**
 * Firma un JWT para autenticación.
 *
 * - Usa el secret definido en env.jwtSecret
 * - Aplica expiración solo si está configurada (env.jwtExpiresIn)
 */
export function signToken(payload: JwtPayload) {
  const options: SignOptions = {};

  /**
   * Expiración opcional:
   * - Permite tokens "sin expiry" en dev o setups especiales.
   * - En prod se recomienda SIEMPRE definir jwtExpiresIn.
   */
  if (env.jwtExpiresIn) {
    options.expiresIn = env.jwtExpiresIn;
  }

  return jwt.sign(payload, env.jwtSecret, options);
}
