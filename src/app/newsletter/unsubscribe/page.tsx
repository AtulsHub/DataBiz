import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { connection } from "next/server";
import { unsubscribeNewsletterToken } from "@/app/actions/newsletter";
import { Container } from "@/components/ui/Container";
import { PageHero } from "@/components/ui/PageHero";

export const metadata: Metadata = { title: "Unsubscribe" };

type Props = { searchParams: Promise<{ token?: string }> };

async function UnsubscribeBody({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  await connection();
  const { token } = await searchParams;
  const result = token
    ? await unsubscribeNewsletterToken(token)
    : { ok: false, error: "Missing unsubscribe token." };

  return (
    <>
      <PageHero
        index="Mail"
        label="Newsletter"
        title={result.ok ? "You are unsubscribed." : "Could not unsubscribe."}
        description={
          result.ok
            ? "You will not receive further newsletter mail from DataBiz."
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

export default function NewsletterUnsubscribePage({ searchParams }: Props) {
  return (
    <Suspense fallback={<div className="min-h-[40vh]" aria-hidden />}>
      <UnsubscribeBody searchParams={searchParams} />
    </Suspense>
  );
}
