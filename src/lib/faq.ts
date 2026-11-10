import { asc, eq } from "drizzle-orm";
import { getDb } from "@/db";
import { faqItems as faqTable } from "@/db/schema";
import { faqItems as seedFaq } from "@/content/pages";

export type FaqItem = {
  id?: string;
  question: string;
  answer: string;
};

export async function getPublishedFaqItems(): Promise<FaqItem[]> {
  const db = getDb();
  if (!db) return seedFaq;

  const rows = await db
    .select()
    .from(faqTable)
    .where(eq(faqTable.published, true))
    .orderBy(asc(faqTable.sortOrder));

  if (rows.length === 0) return seedFaq;
  return rows.map((row) => ({
    id: row.id,
    question: row.question,
    answer: row.answer,
  }));
}
