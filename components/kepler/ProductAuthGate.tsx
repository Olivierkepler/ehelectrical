"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import AuthLoadingScreen from "@/components/kepler/AuthLoadingScreen";
import { useAuth } from "@/lib/kepler/AuthProvider";

/**
 * Client-side gate for app/(app).
 * Unauthenticated users are redirected to /login.
 * No Firebase Admin, cookies, or middleware.
 */
export default function ProductAuthGate({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { user, loading, configured } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) {
      return;
    }

    if (!user) {
      router.replace("/login");
    }
  }, [loading, user, router]);

  if (loading) {
    return <AuthLoadingScreen />;
  }

  if (!configured || !user) {
    return <AuthLoadingScreen />;
  }

  return <>{children}</>;
}
