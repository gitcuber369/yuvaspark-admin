"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { loginUser } from "@/app/api/api";
import { useAuthStore } from "@/app/store/authStore";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardFooter,
} from "@/components/ui/card";
import { FiMail, FiLock, FiLogIn } from "react-icons/fi";
import Link from "next/link";
import React from "react";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const login = useAuthStore((state) => state.login);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Check for registration success
  useEffect(() => {
    const registered = searchParams.get("registered");
    if (registered === "true") {
      setSuccess("Account created successfully! You can now log in.");
    }
  }, [searchParams]);

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setSuccess("");

    try {
      const response = await loginUser(email, password);
      console.log("Login response:", response);
      console.log("User name from response:", response.name);

      login(response.token, response.name);
      console.log("Login function called with token and name");

      router.push("/admin/dashboard");
    } catch (error) {
      setError("Invalid email or password. Please try again.");
      console.error("Login error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const checkAuthStatus = () => {
    // Check if running in browser environment
    if (typeof window !== "undefined") {
      const authToken = localStorage.getItem("authToken");
      if (authToken) {
        router.replace("/admin/dashboard");
      }
    }
  };

  // Call the function when component mounts
  useEffect(() => {
    checkAuthStatus();
  }, [router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-white p-4">
      <Card className="w-full max-w-md shadow-xl border border-gray-200">
        <CardHeader className="space-y-1 pb-2">
          <div className="flex justify-center mb-2">
            <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center">
              <FiLogIn className="w-8 h-8 text-black" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-center text-black">
            Welcome Back
          </h2>
          <p className="text-center text-gray-500 text-sm">
            Enter your credentials to access your account
          </p>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="bg-gray-100 text-gray-800 border border-gray-300 p-3 rounded-md mb-4 text-sm flex items-center">
              <span className="mr-2">⚠️</span> {error}
            </div>
          )}
          {success && (
            <div className="bg-green-50 text-green-800 border border-green-200 p-3 rounded-md mb-4 text-sm flex items-center">
              <span className="mr-2">✅</span> {success}
            </div>
          )}
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <div className="relative">
                <FiMail className="absolute left-3 top-3 text-gray-500" />
                <Input
                  placeholder="Email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 py-6 bg-gray-50 border-gray-200 focus:ring-gray-500"
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <div className="relative">
                <FiLock className="absolute left-3 top-3 text-gray-500" />
                <Input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 py-6 bg-gray-50 border-gray-200 focus:ring-gray-500"
                  required
                />
              </div>
            </div>
            <Button
              className="w-full py-6 bg-black hover:bg-gray-800 text-white font-medium transition-all"
              type="submit"
              disabled={isLoading}
            >
              {isLoading ? "Signing in..." : "Sign In"}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col space-y-2 text-center">
          <Link
            href="/auth/forgot-password"
            className="text-sm text-black hover:underline"
          >
            Forgot your password?
          </Link>
          <p className="text-sm text-gray-600 mt-2">
            Don't have an account?{" "}
            <Link
              href="/auth/register"
              className="text-black hover:underline font-medium"
            >
              Create Account
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}

// Wrap the component that uses useSearchParams in a Suspense boundary
export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-white p-4">
          Loading...
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
