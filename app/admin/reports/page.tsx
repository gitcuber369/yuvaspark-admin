"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  BarChart3,
  Users,
  GraduationCap,
  School,
  FileBarChart2,
  TrendingUp,
  Calendar,
  Award,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuthStore } from "@/app/store/authStore";
import { toast } from "sonner";

interface AssessmentStats {
  totalAnganwadis: number;
  completedAnganwadis: number;
  anganwadiCompletionPercentage: number;
  totalStudents: number;
  completedStudents: number;
  studentCompletionPercentage: number;
  gradedStudents: number;
}

interface Assessment {
  id: string;
  name: string;
  description: string | null;
  startDate: string;
  endDate: string;
  isActive: boolean;
  status: string;
  stats: AssessmentStats;
}

export default function ReportsPage() {
  const [timeRange, setTimeRange] = useState("30");
  const [isLoading, setIsLoading] = useState(true);
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const { token } = useAuthStore();

  useEffect(() => {
    fetchAssessments();
  }, [timeRange]);

  const fetchAssessments = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/assessment-sessions`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch assessments");
      }

      const data = await response.json();
      setAssessments(data);
    } catch (error) {
      console.error("Error fetching assessments:", error);
      toast.error("Failed to load assessment data");
    } finally {
      setIsLoading(false);
    }
  };

  const statsData = [
    {
      title: "Total Students",
      value: assessments
        .reduce((sum, assessment) => sum + assessment.stats.totalStudents, 0)
        .toString(),
      icon: <GraduationCap className="h-8 w-8 text-primary/70" />,
      change: "+12%",
      trend: "up",
    },
    {
      title: "Active Teachers",
      value: assessments
        .reduce((sum, assessment) => sum + assessment.stats.totalAnganwadis, 0)
        .toString(),
      icon: <School className="h-8 w-8 text-primary/70" />,
      change: "+5%",
      trend: "up",
    },
    {
      title: "Assessment Completion",
      value: `${Math.round(
        assessments.reduce(
          (sum, assessment) =>
            sum + assessment.stats.studentCompletionPercentage,
          0
        ) / (assessments.length || 1)
      )}%`,
      icon: <FileBarChart2 className="h-8 w-8 text-primary/70" />,
      change: "+3%",
      trend: "up",
    },
    {
      title: "Average Score",
      value: `${Math.round(
        assessments.reduce(
          (sum, assessment) =>
            sum +
            (assessment.stats.gradedStudents / assessment.stats.totalStudents) *
              100,
          0
        ) / (assessments.length || 1)
      )}%`,
      icon: <Award className="h-8 w-8 text-primary/70" />,
      change: "-2%",
      trend: "down",
    },
  ];

  const reportTypes = [
    {
      title: "Student Performance",
      description:
        "Detailed analysis of student assessment scores and progress",
      icon: <GraduationCap className="h-6 w-6" />,
      endpoint: "/api/students/performance",
    },
    {
      title: "Teacher Effectiveness",
      description: "Teacher performance metrics and student outcomes",
      icon: <School className="h-6 w-6" />,
      endpoint: "/api/teachers/performance",
    },
    {
      title: "Attendance Reports",
      description: "Student and teacher attendance tracking",
      icon: <Calendar className="h-6 w-6" />,
      endpoint: "/api/attendance",
    },
    {
      title: "Assessment Analytics",
      description: "Comprehensive assessment results and trends",
      icon: <FileBarChart2 className="h-6 w-6" />,
      endpoint: "/api/assessment-sessions",
    },
  ];

  const handleGenerateReport = async (endpoint: string) => {
    try {
      setIsLoading(true);
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}${endpoint}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to generate report");
      }

      const data = await response.json();
      // Handle the report data (e.g., download as CSV, show in modal, etc.)
      toast.success("Report generated successfully");
    } catch (error) {
      console.error("Error generating report:", error);
      toast.error("Failed to generate report");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold flex items-center">
            <BarChart3 className="mr-3 h-8 w-8 text-primary/70" />
            Reports & Analytics
          </h1>
          <p className="text-muted-foreground mt-1">
            View and analyze educational performance metrics
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select time range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Last 7 days</SelectItem>
              <SelectItem value="30">Last 30 days</SelectItem>
              <SelectItem value="90">Last 90 days</SelectItem>
              <SelectItem value="180">Last 6 months</SelectItem>
              <SelectItem value="365">Last year</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">
            <Calendar className="h-4 w-4 mr-2" />
            Custom Range
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statsData.map((stat) => (
          <Card key={stat.title}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    {stat.title}
                  </p>
                  <h3 className="text-2xl font-bold mt-1">{stat.value}</h3>
                  <p
                    className={`text-sm mt-1 ${
                      stat.trend === "up" ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {stat.change} from last period
                  </p>
                </div>
                <div className="p-3 rounded-full bg-primary/10">
                  {stat.icon}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Report Types */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="attendance">Attendance</TabsTrigger>
          <TabsTrigger value="assessments">Assessments</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {reportTypes.map((report) => (
              <Card key={report.title}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <div className="p-2 rounded-full bg-primary/10">
                      {report.icon}
                    </div>
                    {report.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">
                    {report.description}
                  </p>
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => handleGenerateReport(report.endpoint)}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      "Generate Report"
                    )}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="performance">
          <Card>
            <CardHeader>
              <CardTitle>Performance Reports</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center items-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin" />
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  Select a report type to view detailed performance metrics
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="attendance">
          <Card>
            <CardHeader>
              <CardTitle>Attendance Reports</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center items-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin" />
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  Select a report type to view attendance statistics
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="assessments">
          <Card>
            <CardHeader>
              <CardTitle>Assessment Reports</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center items-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin" />
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  Select a report type to view assessment analytics
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
