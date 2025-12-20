import type { ApiError } from "./clients";

export function getErrorMessage(err: unknown): string {
  if (typeof err === "object" && err !== null && "message" in err) {
    return (err as ApiError).message;
  }
  return "Something went wrong";
}
