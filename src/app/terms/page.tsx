import type { Metadata } from "next";
import { termsBody } from "@/content/pages";
import { LegalDocument } from "@/components/ui/LegalDocument";

export const metadata: Metadata = {
  title: "Terms",
  description: "Terms of use for the DataBiz site.",
};

export default function TermsPage() {
  return (
    <LegalDocument
      index="T"
      label="Terms"
      title="Terms of use."
      description="The ground rules for using this site."
      body={termsBody}
    />
  );
}
