"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export function PasswordChangeGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { isLoading, mustChangePassword } = useAuth();

  useEffect(() => {
    if (!isLoading && mustChangePassword && pathname !== "/change-password") {
      router.replace("/change-password");
    }
  }, [isLoading, mustChangePassword, pathname, router]);

  if (isLoading || mustChangePassword) {
    return null;
  }

  return <>{children}</>;
}
