import jwt, { type SignOptions } from "jsonwebtoken";
import { env } from "../config/env";

type JwtPayload = {
  _id: string;
  email: string;
};

export function signToken(payload: JwtPayload) {
  const options: SignOptions = {};

  if (env.jwtExpiresIn) {
    options.expiresIn = env.jwtExpiresIn;
  }

  return jwt.sign(payload, env.jwtSecret, options);
}
