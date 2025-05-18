"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  School,
  GraduationCap,
  ClipboardCheck,
  FileBarChart2,
  Users,
  Calendar,
  Bell,
  Settings,
  BarChart3,
  TrendingUp,
  Activity,
  Home,
  BookOpen,
  Award,
  BookText,
  MessageSquareText,
  ClipboardList,
  FileCheck2,
} from "lucide-react";
import { useAnganwadiStore } from "@/app/store/anganwadiStore";

const statsData = [
  {
    title: "Teachers",
    count: 42,
    icon: <School className="w-6 h-6 text-white" />,
    link: "/admin/teachers",
    color: "bg-gradient-to-r from-blue-600 to-blue-400",
  },
  {
    title: "Students",
    count: 128,
    icon: <GraduationCap className="w-6 h-6 text-white" />,
    link: "/admin/students",
    color: "bg-gradient-to-r from-green-600 to-green-400",
  },
  {
    title: "Anganwadi",
    count: 15,
    icon: <Home className="w-6 h-6 text-white" />,
    link: "/admin/anganwadi",
    color: "bg-gradient-to-r from-purple-600 to-purple-400",
  },
  {
    title: "Assessments",
    count: 6,
    icon: <ClipboardList className="w-6 h-6 text-white" />,
    link: "/admin/global-assessments",
    color: "bg-gradient-to-r from-amber-600 to-amber-400",
  },
];

const quickActions = [
  {
    title: "Add New Teacher",
    link: "/admin/teachers",
    icon: <Users className="w-5 h-5" />,
    color: "bg-blue-100 text-blue-600",
  },
  {
    title: "Add New Student",
    link: "/admin/students",
    icon: <GraduationCap className="w-5 h-5" />,
    color: "bg-green-100 text-green-600",
  },
  {
    title: "Anganwadi Settings",
    link: "/admin/anganwadi",
    icon: <Home className="w-5 h-5" />,
    color: "bg-purple-100 text-purple-600",
  },
  {
    title: "Manage Assessments",
    link: "/admin/global-assessments",
    icon: <ClipboardList className="w-5 h-5" />,
    color: "bg-amber-100 text-amber-600",
  },
  {
    title: "Manage Topics",
    link: "/admin/topic",
    icon: <BookText className="w-5 h-5" />,
    color: "bg-indigo-100 text-indigo-600",
  },
  {
    title: "View Reports",
    // @ts-ignore
    link: "/admin/reports",
    icon: <FileBarChart2 className="w-5 h-5" />,
    color: "bg-red-100 text-red-600",
  },
];

export default function DashboardPage() {
  const { anganwadis, loading, error, fetchAnganwadis } = useAnganwadiStore();

  useEffect(() => {
    fetchAnganwadis();
  }, [fetchAnganwadis]);

  return (
    <div className="p-6 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 flex items-center">
          <BarChart3 className="mr-3 h-8 w-8 text-indigo-600" />
          Admin Dashboard
        </h1>
        <p className="text-gray-600 ml-11">
          Welcome back! Here's what's happening today.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statsData.map((item) => (
          <Link
            key={item.title}
            href={item.link}
            className={`rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 ${item.color} text-white overflow-hidden transform hover:-translate-y-1`}
          >
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium opacity-90">{item.title}</p>
                  <p className="text-3xl font-bold mt-1">{item.count}</p>
                </div>
                <div className="p-3 rounded-full bg-white/20 shadow-inner">
                  {item.icon}
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Quick Actions */}
        <div className="bg-white rounded-xl shadow-lg lg:col-span-1 overflow-hidden border border-gray-100">
          <div className="p-6 border-b bg-gradient-to-r from-indigo-50 to-blue-50">
            <h2 className="text-xl font-semibold flex items-center text-gray-800">
              <Activity className="w-5 h-5 mr-2 text-indigo-600" />
              Quick Actions
            </h2>
          </div>
          <div className="p-5">
            <div className="grid grid-cols-2 gap-4">
              {quickActions.map((action) => (
                <Link
                  key={action.title}
                  href={action.link}
                  className="p-4 border rounded-lg hover:bg-gray-50 transition-all duration-300 flex flex-col items-center justify-center text-center shadow-sm hover:shadow group"
                >
                  <div
                    className={`p-3 rounded-full ${action.color} mb-2 group-hover:scale-110 transition-transform duration-300`}
                  >
                    {action.icon}
                  </div>
                  <span className="text-sm font-medium text-gray-700">
                    {action.title}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Anganwadi List */}
        <div className="bg-white rounded-xl shadow-lg lg:col-span-2 overflow-hidden border border-gray-100">
          <div className="p-6 border-b bg-gradient-to-r from-purple-50 to-pink-50">
            <h2 className="text-xl font-semibold flex items-center text-gray-800">
              <Home className="w-5 h-5 mr-2 text-purple-600" />
              All Anganwadis
            </h2>
          </div>
          <div className="p-5">
            {loading ? (
              <div className="flex justify-center items-center py-10">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-purple-600"></div>
              </div>
            ) : error ? (
              <div className="text-center py-10">
                <p className="text-red-500 mb-2">Failed to load anganwadis</p>
                <button
                  onClick={() => fetchAnganwadis()}
                  className="px-4 py-2 bg-purple-100 text-purple-600 rounded-md hover:bg-purple-200 transition-colors"
                >
                  Try Again
                </button>
              </div>
            ) : anganwadis.length === 0 ? (
              <div className="text-center py-10">
                <p className="text-gray-500 mb-4">No anganwadis found.</p>
                <Link
                  href="/admin/anganwadi"
                  className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
                >
                  Add Anganwadi
                </Link>
              </div>
            ) : (
              <div className="overflow-hidden overflow-y-auto max-h-[400px] pr-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                <ul className="divide-y">
                  {anganwadis.map((a) => (
                    <li
                      key={a._id}
                      className="py-4 first:pt-0 last:pb-0 hover:bg-gray-50 transition-colors rounded-md px-2"
                    >
                      <div className="flex items-center">
                        <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 font-medium shadow">
                          {a.name?.charAt(0) || "A"}
                        </div>
                        <div className="ml-4 flex-grow">
                          <p className="text-sm font-medium text-gray-900">
                            {a.name}
                          </p>
                          <p className="text-xs text-gray-500">
                            {a.location || "No location"},{" "}
                            {a.district || "No district"}
                          </p>
                        </div>
                        <Link
                          href={`/admin/anganwadi/${a._id}`}
                          className="text-xs font-medium px-3 py-1.5 bg-purple-100 rounded-full text-purple-600 hover:bg-purple-200 transition-colors"
                        >
                          View
                        </Link>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
