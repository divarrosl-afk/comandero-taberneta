"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { UserBar } from "@/components/auth/UserBar";

export function AuthShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const enLogin = pathname === "/login";

  return (
    <>
      {!enLogin && <UserBar />}
      {children}
    </>
  );
}
