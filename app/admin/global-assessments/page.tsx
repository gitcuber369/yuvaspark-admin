"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getGlobalAssessments, publishGlobalAssessment, completeGlobalAssessment } from "@/app/api/api";
import { toast } from "sonner";
import { PlusCircle, Check, Settings, Calendar, Users, School, AlertTriangle, FileText } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

interface GlobalAssessment {
  id: string;
  name: string;
  description?: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
  status: string;
  topicIds: string[];
  createdAt: string;
  stats: {
    totalAnganwadis: number;
    completedAnganwadis: number;
    anganwadiCompletionPercentage: number;
    totalStudents: number;
    completedStudents: number;
    studentCompletionPercentage: number;
  };
}

export default function GlobalAssessmentsPage() {
  const [assessments, setAssessments] = useState<GlobalAssessment[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const fetchAssessments = async () => {
    setLoading(true);
    try {
      const data = await getGlobalAssessments();
      setAssessments(data);
    } catch (error) {
      console.error("Failed to fetch assessments:", error);
      toast.error("Failed to load assessments");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssessments();
  }, []);

  const handlePublish = async (id: string) => {
    try {
      await publishGlobalAssessment(id);
      toast.success("Assessment published successfully");
      fetchAssessments();
    } catch (error) {
      console.error("Failed to publish assessment:", error);
      toast.error("Failed to publish assessment");
    }
  };

  const handleComplete = async (id: string) => {
    try {
      await completeGlobalAssessment(id);
      toast.success("Assessment marked as completed");
      fetchAssessments();
    } catch (error) {
      console.error("Failed to complete assessment:", error);
      toast.error("Failed to complete assessment");
    }
  };

  // Helper function to format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Helper function to get status badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "DRAFT":
        return <Badge variant="outline">Draft</Badge>;
      case "PUBLISHED":
        return <Badge variant="secondary">Published</Badge>;
      case "COMPLETED":
        return <Badge className="bg-green-100 text-green-800">Completed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Global Assessments</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => router.push("/admin/global-assessments/api-docs")}>
            <FileText className="mr-2 h-4 w-4" />
            API Documentation
          </Button>
          <Button onClick={() => router.push("/admin/global-assessments/new")}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Create New Assessment
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="grid gap-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="space-y-2">
                <div className="h-5 bg-gray-200 rounded w-1/3"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="h-4 bg-gray-200 rounded w-full mb-3"></div>
                <div className="h-4 bg-gray-200 rounded w-full mb-3"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : assessments.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-10">
            <AlertTriangle className="h-10 w-10 text-amber-500 mb-4" />
            <h3 className="text-lg font-medium">No assessments found</h3>
            <p className="text-muted-foreground mt-2 text-center max-w-md">
              You haven't created any global assessments yet. Click the button
              above to create your first assessment.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          {assessments.map((assessment) => (
            <Card key={assessment.id} className="overflow-hidden">
              <CardHeader className="bg-muted/40">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>{assessment.name}</CardTitle>
                    <CardDescription>{assessment.description}</CardDescription>
                  </div>
                  <div>{getStatusBadge(assessment.status)}</div>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Assessment Period</p>
                      <p className="text-sm text-muted-foreground">
                        {formatDate(assessment.startDate)} - {formatDate(assessment.endDate)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <School className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Anganwadis</p>
                      <p className="text-sm text-muted-foreground">
                        {assessment.stats.completedAnganwadis} / {assessment.stats.totalAnganwadis} completed
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Students</p>
                      <p className="text-sm text-muted-foreground">
                        {assessment.stats.completedStudents} / {assessment.stats.totalStudents} evaluated
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between mb-1 text-sm">
                      <span>Anganwadi Completion</span>
                      <span>{assessment.stats.anganwadiCompletionPercentage}%</span>
                    </div>
                    <Progress value={assessment.stats.anganwadiCompletionPercentage} />
                  </div>
                  <div>
                    <div className="flex justify-between mb-1 text-sm">
                      <span>Student Completion</span>
                      <span>{assessment.stats.studentCompletionPercentage}%</span>
                    </div>
                    <Progress value={assessment.stats.studentCompletionPercentage} />
                  </div>
                </div>
              </CardContent>
              <CardFooter className="bg-muted/20 justify-between">
                <Button variant="outline" onClick={() => router.push(`/admin/global-assessments/${assessment.id}`)}>
                  <Settings className="mr-2 h-4 w-4" />
                  View Details
                </Button>
                {assessment.status === "DRAFT" && (
                  <Button onClick={() => handlePublish(assessment.id)}>
                    <Check className="mr-2 h-4 w-4" />
                    Publish Assessment
                  </Button>
                )}
                {assessment.status === "PUBLISHED" && (
                  <Button onClick={() => handleComplete(assessment.id)}>
                    <Check className="mr-2 h-4 w-4" />
                    Mark as Completed
                  </Button>
                )}
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
} 