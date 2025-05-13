"use client";
import { useEffect, useState } from "react";
import {
  LogOut,
  Settings,
  Users,
  LayoutDashboard,
  HomeIcon,
  PanelTopInactive,
  FileQuestion,
  ClipboardList,
  ShieldCheck,
  MessageSquareText,
  FileBarChart2,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

import { useRouter, usePathname } from "next/navigation";
import {
  School,
  GraduationCap,
  ClipboardCheck,
  Users as Cohorts,
  MessagesSquare,
  SettingsIcon,
  UserCircle,
} from "lucide-react";
import { useAuthStore } from "@/app/store/authStore";
import Link from "next/link";
import Image from "next/image";

const adminNav = [
  { title: "Dashboard", icon: LayoutDashboard, url: "/admin/dashboard" },

  { title: "Teachers", icon: School, url: "/admin/teachers" },
  { title: "Students", icon: GraduationCap, url: "/admin/students" },
  { title: "Anganwadi", icon: HomeIcon, url: "/admin/anganwadi" },
  { title: "Cohorts", icon: Cohorts, url: "/admin/cohorts" },
  { title: "Topics", icon: PanelTopInactive, url: "/admin/topic" },
  { title: "Questions", icon: MessagesSquare, url: "/admin/questions" },
  {
    title: "Global Assessments",
    icon: ClipboardList,
    url: "/admin/global-assessments",
  },

  {
    title: "Student Responses",
    icon: MessageSquareText,
    url: "/admin/student-responses",
  },
];

export function AdminSidebar({
  ...props
}: React.ComponentProps<typeof Sidebar>) {
  const router = useRouter();
  const pathname = usePathname();
  const { userName, logout } = useAuthStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Don't render user-specific content until client-side
  const renderProfile = () => {
    if (!mounted) {
      return (
        <div className="px-3 py-2 flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
            <Avatar>
              <AvatarFallback>...</AvatarFallback>
            </Avatar>
          </div>
          <div>
            <p className="text-sm font-medium truncate">Loading...</p>
            <p className="text-xs text-gray-500">Loading...</p>
          </div>
        </div>
      );
    }

    return (
      <div className="px-3 py-2 flex items-center gap-3">
        <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
          <Avatar>
            <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
            <AvatarFallback>CN</AvatarFallback>
          </Avatar>
        </div>
        <div>
          <p className="text-sm font-medium truncate">{userName || "Guest"}</p>
          <p className="text-xs text-gray-500">
            {localStorage.getItem("userRole") || "Role"}
          </p>
        </div>
      </div>
    );
  };

  return (
    <Sidebar {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <a href="/admin/dashboard">
                <div className="flex items-center justify-center rounded-lg text-sidebar-primary-foreground w-full">
                  <Image
                    src="/logo.png"
                    alt="Yuva Spark Logo"
                    width={180}
                    height={180}
                    objectFit="cover"
                  />
                </div>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarMenu>
            {adminNav.map((item) => (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton
                  className={pathname === item.url ? "bg-gray-200" : ""}
                  asChild
                >
                  <Link href={item.url} className="flex items-center gap-2">
                    <item.icon className="size-4" />
                    <span className="font-medium">{item.title}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>

      <div className="mt-auto p-4 border-t">
        <SidebarMenu>
          <SidebarMenuItem>{renderProfile()}</SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <button
                onClick={() => logout()}
                className="flex items-center gap-2"
              >
                <LogOut className="size-4" />
                <span className="font-medium">Logout</span>
              </button>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </div>

      <SidebarRail />
    </Sidebar>
  );
}
