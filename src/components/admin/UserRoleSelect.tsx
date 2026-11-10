"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { setUserRole } from "@/app/actions/users";
import { ROLES, type Role } from "@/lib/roles";
import { inputClass } from "@/components/forms/Field";

type Props = {
  userId: string;
  role: Role;
};

export function UserRoleSelect({ userId, role }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <select
      className={inputClass}
      defaultValue={role}
      disabled={pending}
      aria-label="Promote or change role"
      onChange={(e) => {
        const next = e.target.value;
        startTransition(async () => {
          await setUserRole(userId, next);
          router.refresh();
        });
      }}
    >
      {ROLES.map((r) => (
        <option key={r} value={r}>
          {r}
        </option>
      ))}
    </select>
  );
}
