import type { Metadata } from "next";
import { AccountPanel } from "@/components/account/AccountPanel";

export const metadata: Metadata = {
  title: "Account",
  description: "Your DataBiz account after you sign in.",
};

export default function AccountPage() {
  return <AccountPanel />;
}
