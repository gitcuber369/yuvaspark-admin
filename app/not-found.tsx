"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Home, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-b from-background to-secondary/10">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="w-full max-w-md shadow-lg border-2">
          <CardContent className="pt-10 pb-8 px-8">
            <div className="flex flex-col items-center text-center space-y-6">
              {/* 404 Text */}
              <div className="space-y-3">
                <motion.h1
                  className="text-8xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent"
                  initial={{ scale: 0.5 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                >
                  404
                </motion.h1>
                <h2 className="text-2xl font-semibold tracking-tight text-foreground/90">
                  Page Not Found
                </h2>
              </div>

              {/* Description */}
              <p className="text-muted-foreground text-lg max-w-sm">
                The page you're looking for doesn't exist or has been moved.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-col-reverse sm:flex-row-reverse gap-3 w-full pt-6">
                <Link href="/admin/dashboard" className="w-full sm:w-2/3">
                  <Button
                    size="lg"
                    className="w-full bg-primary hover:bg-primary/90 transition-all duration-200 shadow-md hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]"
                  >
                    <Home className="mr-2 h-5 w-5" />
                    Return to Dashboard
                  </Button>
                </Link>
                <Button
                  variant="outline"
                  size="lg"
                  className="w-full sm:w-1/3 hover:bg-secondary/80 transition-colors border-2"
                  onClick={() => window.history.back()}
                >
                  <ArrowLeft className="mr-2 h-5 w-5" />
                  Back
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
