"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { registerUser } from "@/app/api/api";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardFooter,
} from "@/components/ui/card";
import { FiMail, FiLock, FiUser, FiUserPlus } from "react-icons/fi";
import Link from "next/link";
import React from "react";
import axios from "axios";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState("ADMIN");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      setIsLoading(false);
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long");
      setIsLoading(false);
      return;
    }

    try {
      // Use the registerUser function from the API helper
      await registerUser(name, email, password, role);
      
      // Show success message before redirecting
      setError("");
      
      // Redirect to login page after successful registration
      setTimeout(() => {
        router.push("/auth/login?registered=true");
      }, 1000);
    } catch (error) {
      console.error("Registration error:", error);
      
      // Handle different types of errors
      if (axios.isAxiosError(error)) {
        // Handle Axios errors (API errors)
        if (error.response) {
          // The request was made and the server responded with an error status
          if (error.response.status === 409) {
            setError("Email already exists. Please use a different email address.");
          } else if (error.response.data?.error) {
            setError(error.response.data.error);
          } else if (error.response.data?.message) {
            setError(error.response.data.message);
          } else {
            setError(`Registration failed: ${error.response.status} ${error.response.statusText}`);
          }
        } else if (error.request) {
          // The request was made but no response was received
          setError("No response from server. Please check your connection and try again.");
        } else {
          // Something happened in setting up the request
          setError("Error setting up the request. Please try again.");
        }
      } else {
        // Handle non-Axios errors
        setError("Registration failed. Please try again.");
      }
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
              <FiUserPlus className="w-8 h-8 text-black" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-center text-black">
            Create Account
          </h2>
          <p className="text-center text-gray-500 text-sm">
            Enter your information to create an account
          </p>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="bg-gray-100 text-gray-800 border border-gray-300 p-3 rounded-md mb-4 text-sm flex items-center">
              <span className="mr-2">⚠️</span> {error}
            </div>
          )}
          <form onSubmit={handleRegister} className="space-y-4">
            <div className="space-y-2">
              <div className="relative">
                <FiUser className="absolute left-3 top-3 text-gray-500" />
                <Input
                  placeholder="Full Name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="pl-10 py-6 bg-gray-50 border-gray-200 focus:ring-gray-500"
                  required
                />
              </div>
            </div>
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
              <Select
                value={role}
                onValueChange={setRole}
              >
                <SelectTrigger className="py-6 bg-gray-50 border-gray-200 focus:ring-gray-500">
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ADMIN">Admin</SelectItem>
                  <SelectItem value="REGIONAL_COORDINATOR">Regional Coordinator</SelectItem>
                  <SelectItem value="TEACHER">Teacher</SelectItem>
                </SelectContent>
              </Select>
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
                  minLength={6}
                />
              </div>
            </div>
            <div className="space-y-2">
              <div className="relative">
                <FiLock className="absolute left-3 top-3 text-gray-500" />
                <Input
                  type="password"
                  placeholder="Confirm Password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="pl-10 py-6 bg-gray-50 border-gray-200 focus:ring-gray-500"
                  required
                  minLength={6}
                />
              </div>
            </div>
            <Button
              className="w-full py-6 bg-black hover:bg-gray-800 text-white font-medium transition-all"
              type="submit"
              disabled={isLoading}
            >
              {isLoading ? "Creating Account..." : "Create Account"}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col space-y-2 text-center">
          <p className="text-sm text-gray-600">
            Already have an account?{" "}
            <Link href="/auth/login" className="text-black hover:underline font-medium">
              Sign In
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
} 