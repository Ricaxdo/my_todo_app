import type { SignOptions } from "jsonwebtoken";

/**
 * Helper para variables de entorno obligatorias.
 * Si falta alguna, la app debe fallar al arrancar (fail-fast),
 * no en tiempo de ejecución manejando requests.
 */
function required(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Missing env var: ${name}`);
  return v;
}

/**
 * Configuración centralizada de entorno.
 */
export const env = {
  /**
   * Puerto del servidor.
   * Default 4000 para dev/local.
   */
  port: Number(process.env.PORT ?? 4000),

  /**
   * URI de MongoDB (obligatoria).
   */
  mongoUri: required("MONGO_URI"),

  /**
   * Secret para firmar JWT (obligatorio).
   * Debe ser largo y mantenerse fuera del repo.
   */
  jwtSecret: required("JWT_SECRET"),

  /**
   * Expiración del JWT.
   * - Default: "1d"
   * - Tipado contra jsonwebtoken para evitar strings inválidos.
   */
  jwtExpiresIn: (process.env.JWT_EXPIRES_IN ??
    "1d") as SignOptions["expiresIn"],

  /**
   * Salt rounds para bcrypt.
   * Default 10 (balance razonable entre seguridad y performance).
   */
  bcryptSaltRounds: Number(process.env.BCRYPT_SALT_ROUNDS ?? 10),
};
