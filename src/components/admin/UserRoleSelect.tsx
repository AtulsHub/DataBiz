"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { setUserRole } from "@/app/actions/users";
import { ROLES, type Role } from "@/lib/roles";
import { inputClass } from "@/components/forms/Field";
import { Spinner } from "@/components/ui/Spinner";

type Props = {
  userId: string;
  role: Role;
};

export function UserRoleSelect({ userId, role }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <div className="flex items-center gap-2">
      <select
        className={inputClass}
        defaultValue={role}
        disabled={pending}
        aria-busy={pending || undefined}
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
      {pending ? <Spinner className="size-3.5 text-mute" label="Saving role" /> : null}
    </div>
  );
}
