"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    // Check if the user is logged in
    const token = localStorage.getItem("token");

    if (token) {
      // If logged in, redirect to admin dashboard
      router.push("/admin/dashboard");
    } else {
      // If not logged in, redirect to login page
      router.push("/auth/login");
    }
  }, [router]);

  // Show a loading state while redirecting
  return (
    <div className="h-screen w-full flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="flex flex-col items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mb-4"></div>
        <h2 className="text-xl font-medium text-gray-700">Redirecting...</h2>
      </div>
    </div>
  );
}
