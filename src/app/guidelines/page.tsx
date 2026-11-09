import type { Metadata } from "next";
import { guidelinesBody } from "@/content/pages";
import { LegalDocument } from "@/components/ui/LegalDocument";

export const metadata: Metadata = {
  title: "Community guidelines",
  description: "How DataBiz members work with each other and with data.",
};

export default function GuidelinesPage() {
  return (
    <LegalDocument
      index="G"
      label="Guidelines"
      title="How we work together."
      description="Short rules for sessions, channels, and collaborations."
      body={guidelinesBody}
    />
  );
}
