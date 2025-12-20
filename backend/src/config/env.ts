import type { SignOptions } from "jsonwebtoken";

function required(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Missing env var: ${name}`);
  return v;
}

export const env = {
  port: Number(process.env.PORT ?? 4000),
  mongoUri: required("MONGO_URI"),
  jwtSecret: required("JWT_SECRET"),
  jwtExpiresIn: (process.env.JWT_EXPIRES_IN ??
    "7d") as SignOptions["expiresIn"],
  bcryptSaltRounds: Number(process.env.BCRYPT_SALT_ROUNDS ?? 10),
};
