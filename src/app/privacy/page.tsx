import type { Metadata } from "next";
import { privacyBody } from "@/content/pages";
import { LegalDocument } from "@/components/ui/LegalDocument";

export const metadata: Metadata = {
  title: "Privacy",
  description: "What DataBiz stores and why.",
};

export default function PrivacyPage() {
  return (
    <LegalDocument
      index="P"
      label="Privacy"
      title="What we keep, and why."
      description="Plain-language notes on how this student-society site handles your information."
      body={privacyBody}
    />
  );
}
