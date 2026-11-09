import { neon } from "@neondatabase/serverless";
import { config } from "dotenv";

config({ path: ".env.local" });

const sql = neon(process.env.DATABASE_URL);
const rows = await sql`
  select id, slug, title, status, starts_at, ends_at, published_at
  from events
  order by created_at desc
  limit 10
`;
console.log(JSON.stringify(rows, null, 2));
