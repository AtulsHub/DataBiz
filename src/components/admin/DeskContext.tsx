"use client";

import { createContext, useContext } from "react";
import type { Role } from "@/lib/roles";

export type DeskCapabilities = {
  role: Role;
  canPublish: boolean;
  isAdmin: boolean;
};

const DeskContext = createContext<DeskCapabilities>({
  role: "member",
  canPublish: false,
  isAdmin: false,
});

export function DeskProvider({
  value,
  children,
}: {
  value: DeskCapabilities;
  children: React.ReactNode;
}) {
  return <DeskContext.Provider value={value}>{children}</DeskContext.Provider>;
}

export function useDesk() {
  return useContext(DeskContext);
}
