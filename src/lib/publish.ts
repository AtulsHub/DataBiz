import { canPublish, type Role } from "@/lib/roles";

/** Members may only save drafts; admins keep the requested status. */
export function clampToDraftIfNeeded<T extends string>(
  role: Role,
  requested: T,
  draftValue: T,
): T {
  if (canPublish(role)) return requested;
  return draftValue;
}

export function memberPendingMessage(role: Role) {
  if (canPublish(role)) return undefined;
  return "Saved as draft. An admin must approve before it goes public.";
}
