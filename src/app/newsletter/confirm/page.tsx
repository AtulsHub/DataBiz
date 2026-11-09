import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { connection } from "next/server";
import { confirmNewsletterToken } from "@/app/actions/newsletter";
import { Container } from "@/components/ui/Container";
import { PageHero } from "@/components/ui/PageHero";

export const metadata: Metadata = { title: "Confirm subscription" };

type Props = { searchParams: Promise<{ token?: string }> };

async function ConfirmBody({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  await connection();
  const { token } = await searchParams;
  const result = token
    ? await confirmNewsletterToken(token)
    : { ok: false, error: "Missing confirmation token." };

  return (
    <>
      <PageHero
        index="Mail"
        label="Newsletter"
        title={result.ok ? "You are confirmed." : "Could not confirm."}
        description={
          result.ok
            ? "You will get occasional notes when something ships."
            : result.error || "That link is invalid."
        }
      />
      <section className="pb-20">
        <Container>
          <Link href="/" className="text-sm font-medium text-ember hover:underline">
            Back home
          </Link>
        </Container>
      </section>
    </>
  );
}

export default function NewsletterConfirmPage({ searchParams }: Props) {
  return (
    <Suspense fallback={<div className="min-h-[40vh]" aria-hidden />}>
      <ConfirmBody searchParams={searchParams} />
    </Suspense>
  );
}
