import type { Metadata } from "next";
import { requireAdminPage } from "@/lib/admin-guard";
import { redirect } from "next/navigation";
import { Container } from "@/components/ui/Container";
import { DriveEditorForm } from "@/components/admin/DriveEditorForm";
import { isDrivesDbReady } from "@/lib/drives";

export const metadata: Metadata = { title: "Admin · New drive" };

export default async function AdminNewDrivePage() {
  await requireAdminPage();
  if (!isDrivesDbReady()) redirect("/admin/drives");
  return (
    <Container className="py-12">
      <h1 className="font-display text-3xl font-semibold tracking-tight">
        New drive
      </h1>
      <div className="mt-10 max-w-3xl">
        <DriveEditorForm />
      </div>
    </Container>
  );
}
