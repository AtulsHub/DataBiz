import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Container } from "@/components/ui/Container";
import { PathwayEditorForm } from "@/components/admin/PathwayEditorForm";
import { isPathwaysDbReady } from "@/lib/pathways";

export const metadata: Metadata = { title: "Admin · New pathway" };

export default function AdminNewPathwayPage() {
  if (!isPathwaysDbReady()) redirect("/admin/learn");

  return (
    <Container className="py-12">
      <h1 className="font-display text-3xl font-semibold tracking-tight">
        New pathway
      </h1>
      <div className="mt-10 max-w-3xl">
        <PathwayEditorForm />
      </div>
    </Container>
  );
}
