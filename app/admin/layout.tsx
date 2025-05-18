"use client";
import React, { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuthStore } from "@/app/store/authStore";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { AdminSidebar } from "@/components/Sidebar";
import { Separator } from "@/components/ui/separator";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { token } = useAuthStore();

  // Generate breadcrumb items from pathname
  const getBreadcrumbItems = () => {
    if (!pathname) return [];
    
    const segments = pathname.split('/').filter(Boolean);
    // Remove 'admin' from segments since it's already in the main breadcrumb
    if (segments[0] === 'admin') segments.shift();
    
    return segments.map(segment => {
      // Capitalize and replace hyphens with spaces
      return segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, ' ');
    });
  };
  
  const breadcrumbItems = getBreadcrumbItems();

  useEffect(() => {
    // Check if running in browser environment
    if (typeof window !== "undefined") {
      const storedToken = localStorage.getItem("token");

      if (!storedToken) {
        router.push("/auth/login");
      }
    }
  }, [router]);

  return (
    <SidebarProvider>
      <AdminSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b">
          <div className="flex items-center gap-2 px-3">
            <SidebarTrigger />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink href="/admin/dashboard">
                    YuvaSpark Admin
                  </BreadcrumbLink>
                </BreadcrumbItem>
                {breadcrumbItems.map((item, index) => (
                  <React.Fragment key={index}>
                    <BreadcrumbSeparator className="hidden md:block" />
                    <BreadcrumbItem>
                      {index === breadcrumbItems.length - 1 ? (
                        <BreadcrumbPage>{item}</BreadcrumbPage>
                      ) : (
                        <BreadcrumbLink href={`/admin/${breadcrumbItems.slice(0, index + 1).join('/')}`}>
                          {item}
                        </BreadcrumbLink>
                      )}
                    </BreadcrumbItem>
                  </React.Fragment>
                ))}
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>
        <div className="flex">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}
