import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { DeskLabel } from "@/components/ui/DeskLabel";
import { PageHero } from "@/components/ui/PageHero";

export const metadata: Metadata = {
  title: "Account",
  description: "Your DataBiz account after you sign in.",
};

const afterLogin = [
  {
    title: "Your profile",
    body: "Name, year, branch, and phone — the details used when you apply or RSVP.",
  },
  {
    title: "Applications",
    body: "Status of any recruitment drive you've applied to, including assessment and interview stages.",
  },
  {
    title: "Results",
    body: "When a drive concludes, your result shows here and nowhere public.",
  },
  {
    title: "RSVPs",
    body: "Events you've registered for, in one list.",
  },
];

export default function AccountPage() {
  return (
    <>
      <PageHero
        index="14"
        label="Account"
        title="You're not signed in."
        description="Your account is a private page for MANIT students. Here is what lives on it once you sign in."
      >
        <div className="mt-6 flex flex-wrap gap-3">
          <Button href="/login" variant="primary" size="md">
            Sign in
          </Button>
          <Button href="/faq" variant="ghost" size="md">
            Read the FAQ
          </Button>
        </div>
      </PageHero>
      <section className="py-16 sm:py-20">
        <Container>
          <DeskLabel>After you sign in</DeskLabel>
          <ol className="mt-6 divide-y divide-line border-y border-line">
            {afterLogin.map((item, i) => (
              <li key={item.title} className="grid gap-2 py-6 sm:grid-cols-[5rem_1fr_1.4fr] sm:gap-8">
                <span className="font-mono text-sm text-signal">{String(i + 1).padStart(2, "0")}</span>
                <h2 className="font-display text-2xl font-bold tracking-tight">{item.title}</h2>
                <p className="leading-relaxed text-steel">{item.body}</p>
              </li>
            ))}
          </ol>
          <p className="mt-8 max-w-xl text-sm text-steel">
            Only addresses ending in @stu.manit.ac.in can sign in. Your information is visible to admins and assigned
            interviewers only — see the{" "}
            <Link href="/privacy" className="font-medium text-signal hover:underline">
              privacy page
            </Link>
            .
          </p>
        </Container>
      </section>
    </>
  );
}
