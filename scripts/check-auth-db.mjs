import { neon } from "@neondatabase/serverless";
import { config } from "dotenv";

config({ path: ".env.local" });

const sql = neon(process.env.DATABASE_URL);

const users = await sql`
  select id, email, role, created_at
  from "user"
  order by created_at desc
  limit 5
`;
const sessions = await sql`
  select id, user_id, expires_at, created_at
  from session
  order by created_at desc
  limit 5
`;
const accounts = await sql`
  select id, provider_id, user_id, created_at
  from account
  order by created_at desc
  limit 5
`;

console.log(JSON.stringify({ users, sessions, accounts }, null, 2));
