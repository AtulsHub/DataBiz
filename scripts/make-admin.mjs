import { neon } from "@neondatabase/serverless";
import { config } from "dotenv";

config({ path: ".env.local" });

const email = "26230051126@stu.manit.ac.in";
const sql = neon(process.env.DATABASE_URL);

const rows = await sql`
  update "user"
  set role = 'admin', updated_at = now()
  where lower(email) = ${email}
  returning id, email, role, roll_number
`;

if (rows.length === 0) {
  console.error(`No user found for ${email}. Sign in once first.`);
  process.exit(1);
}

console.log("Updated:", rows[0]);
