"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { authClient } from "@/lib/auth-client";

export function SignOutButton() {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      pending={pending}
      pendingLabel="Signing out…"
      onClick={async () => {
        setPending(true);
        try {
          await authClient.signOut();
          router.push("/");
          router.refresh();
        } finally {
          setPending(false);
        }
      }}
    >
      Sign out
    </Button>
  );
}
