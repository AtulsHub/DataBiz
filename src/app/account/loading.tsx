import { Container } from "@/components/ui/Container";
import { AccountSkeleton } from "@/components/ui/PageLoader";

export default function AccountLoading() {
  return (
    <section className="py-12 sm:py-16">
      <Container className="max-w-5xl">
        <AccountSkeleton />
      </Container>
    </section>
  );
}
