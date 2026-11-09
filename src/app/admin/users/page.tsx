import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";

export const metadata: Metadata = { title: "Admin · Users" };

export default function AdminUsersPage() {
  return (
    <Container className="py-12">
      <h1 className="font-display text-3xl font-semibold tracking-tight">Users</h1>
      <p className="mt-3 max-w-xl text-mute">
        Role changes (applicant / member / interviewer / admin) will live here.
      </p>
    </Container>
  );
}
