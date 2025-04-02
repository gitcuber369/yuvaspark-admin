"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { loginUser } from "@/app/api/auth";
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

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      await loginUser(email, password);
      router.push("/dashboard");
    } catch {
      setError("Invalid email or password. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

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
          <div className="text-sm text-gray-500">
            Don't have an account?{" "}
            <Link
              href="/auth/register"
              className="text-black hover:underline font-medium"
            >
              Sign up
            </Link>
          </div>
          <Link
            href="/auth/forgot-password"
            className="text-sm text-black hover:underline"
          >
            Forgot your password?
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}
