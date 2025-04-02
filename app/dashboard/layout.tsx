"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "../store/authStore";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { token } = useAuthStore();

  useEffect(() => {
    // Check if running in browser environment
    if (typeof window !== "undefined") {
      const storedToken = localStorage.getItem("authToken");

      if (!storedToken) {
        router.push("/auth/login");
      }
    }
  }, [router]);

  return <main>{children}</main>;
}
