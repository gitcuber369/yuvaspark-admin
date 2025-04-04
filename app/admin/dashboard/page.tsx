// app/admin/dashboard/page.tsx
import Link from "next/link";
import { School, GraduationCap, ClipboardCheck, FileBarChart2, Users, Calendar, Bell, Settings, BarChart3, TrendingUp, Activity, Home, BookOpen, Award } from "lucide-react";

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
    title: "Exams",
    count: 6,
    icon: <Award className="w-6 h-6 text-white" />,
    link: "/admin/exams",
    color: "bg-gradient-to-r from-amber-600 to-amber-400",
  },
];

const quickActions = [
  { title: "Add New Teacher", link: "/admin/teachers/new", icon: <Users className="w-5 h-5" />, color: "bg-blue-100 text-blue-600" },
  { title: "Add New Student", link: "/admin/students/new", icon: <GraduationCap className="w-5 h-5" />, color: "bg-green-100 text-green-600" },
  { title: "Anganwadi Settings", link: "/admin/anganwadi/settings", icon: <Home className="w-5 h-5" />, color: "bg-purple-100 text-purple-600" },
  { title: "Publish Exam", link: "/admin/exams/publish", icon: <Award className="w-5 h-5" />, color: "bg-amber-100 text-amber-600" },
  { title: "System Settings", link: "/admin/settings", icon: <Settings className="w-5 h-5" />, color: "bg-gray-100 text-gray-600" },
  { title: "View Reports", link: "/admin/reports", icon: <FileBarChart2 className="w-5 h-5" />, color: "bg-red-100 text-red-600" },
];

const recentActivities = [
  { user: "John Doe", action: "Added a new student", time: "10 minutes ago" },
  { user: "Jane Smith", action: "Updated Anganwadi details", time: "1 hour ago" },
  { user: "Mike Johnson", action: "Published exam results", time: "3 hours ago" },
  { user: "Sarah Williams", action: "Added new teacher", time: "Yesterday" },
];

export default function DashboardPage() {
  return (
    <div className="p-6 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 flex items-center">
          <BarChart3 className="mr-3 h-8 w-8 text-indigo-600" />
          Admin Dashboard
        </h1>
        <p className="text-gray-600 ml-11">Welcome back! Here's what's happening today.</p>
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
                  <div className={`p-3 rounded-full ${action.color} mb-2 group-hover:scale-110 transition-transform duration-300`}>
                    {action.icon}
                  </div>
                  <span className="text-sm font-medium text-gray-700">{action.title}</span>
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-xl shadow-lg lg:col-span-2 overflow-hidden border border-gray-100">
          <div className="p-6 border-b bg-gradient-to-r from-green-50 to-emerald-50">
            <h2 className="text-xl font-semibold flex items-center text-gray-800">
              <TrendingUp className="w-5 h-5 mr-2 text-green-600" />
              Recent Activity
            </h2>
          </div>
          <div className="p-5">
            <ul className="divide-y">
              {recentActivities.map((activity, index) => (
                <li key={index} className="py-4 first:pt-0 last:pb-0">
                  <div className="flex items-center">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center text-white font-medium shadow-md">
                      {activity.user.charAt(0)}
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-900">{activity.user}</p>
                      <p className="text-sm text-gray-500">{activity.action}</p>
                    </div>
                    <div className="ml-auto text-xs font-medium px-2 py-1 bg-gray-100 rounded-full text-gray-600">{activity.time}</div>
                  </div>
                </li>
              ))}
            </ul>
            <div className="mt-6 text-center">
              <Link 
                href="/admin/activities" 
                className="text-indigo-600 hover:text-indigo-800 text-sm font-medium px-4 py-2 rounded-md border border-indigo-200 hover:bg-indigo-50 transition-colors inline-block"
              >
                View All Activities
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
