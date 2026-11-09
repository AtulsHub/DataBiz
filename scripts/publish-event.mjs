import { neon } from "@neondatabase/serverless";
import { config } from "dotenv";

config({ path: ".env.local" });

const slug = process.argv[2] || "ai-data-science-bootcamp-2026";
const sql = neon(process.env.DATABASE_URL);

const rows = await sql`
  update events
  set status = 'published',
      published_at = coalesce(published_at, now()),
      updated_at = now()
  where slug = ${slug}
  returning slug, title, status, published_at
`;

console.log(rows.length ? rows[0] : `No event found for slug ${slug}`);
