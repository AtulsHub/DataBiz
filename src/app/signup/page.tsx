import { redirect } from "next/navigation";

/** Convenience alias — Sign up lives on /login?mode=signup. */
export default function SignupPage() {
  redirect("/login?mode=signup");
}
