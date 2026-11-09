import { Container } from "./Container";
import { Markdown } from "./Markdown";
import { PageHero } from "./PageHero";

type Props = {
  index: string;
  label: string;
  title: string;
  description: string;
  body: string;
};

export function LegalDocument({ index, label, title, description, body }: Props) {
  return (
    <>
      <PageHero index={index} label={label} title={title} description={description} />
      <section className="py-14 sm:py-20">
        <Container width="narrow">
          <Markdown content={body} />
        </Container>
      </section>
    </>
  );
}
