"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
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
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  getGlobalAssessmentById,
  getAnganwadiSubmissions,
  publishGlobalAssessment,
  completeGlobalAssessment,
} from "@/app/api/api";
import { toast } from "sonner";
import {
  ArrowLeft,
  Check,
  Calendar,
  Users,
  School,
  FileText,
  User,
  ExternalLink,
  Search,
  PlayCircle,
  CheckCircle,
  AlertCircle,
  Clock,
} from "lucide-react";
import React from "react";

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
  topics: Array<{
    id: string;
    name: string;
    questions: Array<{
      id: string;
      text: string;
    }>;
  }>;
  anganwadiAssessments: Array<{
    id: string;
    anganwadiId: string;
    assessmentSessionId: string;
    isComplete: boolean;
    completedStudentCount: number;
    totalStudentCount: number;
    anganwadi: {
      id: string;
      name: string;
      location?: string;
    };
  }>;
  stats: {
    totalAnganwadis: number;
    completedAnganwadis: number;
    anganwadiCompletionPercentage: number;
    totalStudents: number;
    completedStudents: number;
    studentCompletionPercentage: number;
  };
}

interface StudentSubmission {
  id: string;
  assessmentSessionId: string;
  anganwadiId: string;
  studentId: string;
  teacherId: string;
  submissionStatus: string;
  submittedAt: string | null;
  student: {
    id: string;
    name: string;
  };
  teacher: {
    id: string;
    name: string;
  };
  responses: Array<{
    id: string;
    questionId: string;
    audioUrl: string;
    startTime: string;
    endTime: string;
    question: {
      id: string;
      text: string;
    };
    StudentResponseScore: Array<{
      id: string;
      score: number;
    }> | null;
  }>;
}

// Fixed type definition for Next.js Pages
// @ts-ignore - Next.js type mismatch with params
interface PageProps {
  params: Promise<{
    id: string;
  }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default function GlobalAssessmentDetailPage({ params }: PageProps) {
  const router = useRouter();
  const id = React.use(params).id;

  const [assessment, setAssessment] = useState<GlobalAssessment | null>(null);
  const [submissions, setSubmissions] = useState<StudentSubmission[]>([]);
  const [selectedAnganwadiId, setSelectedAnganwadiId] = useState<string | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [submissionsLoading, setSubmissionsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [anganwadiSearch, setAnganwadiSearch] = useState("");
  const [studentSearch, setStudentSearch] = useState("");

  // Fetch assessment details
  const fetchAssessment = async () => {
    setLoading(true);
    try {
      const data = await getGlobalAssessmentById(id);
      setAssessment(data);
      if (data.anganwadiAssessments.length > 0 && !selectedAnganwadiId) {
        setSelectedAnganwadiId(data.anganwadiAssessments[0].anganwadiId);
      }
    } catch (error) {
      console.error("Failed to fetch assessment:", error);
      toast.error("Failed to load assessment details");
    } finally {
      setLoading(false);
    }
  };

  // Fetch student submissions for selected anganwadi
  const fetchSubmissions = async (anganwadiId: string) => {
    if (!anganwadiId) return;

    setSubmissionsLoading(true);
    try {
      const data = await getAnganwadiSubmissions(id, anganwadiId);
      setSubmissions(data);
    } catch (error) {
      console.error("Failed to fetch submissions:", error);
      toast.error("Failed to load student submissions");
    } finally {
      setSubmissionsLoading(false);
    }
  };

  useEffect(() => {
    fetchAssessment();
  }, [id]);

  useEffect(() => {
    if (selectedAnganwadiId) {
      fetchSubmissions(selectedAnganwadiId);
    }
  }, [selectedAnganwadiId, id]);

  const handlePublish = async () => {
    if (!assessment) return;

    try {
      await publishGlobalAssessment(id);
      toast.success("Assessment published successfully");
      fetchAssessment();
    } catch (error) {
      console.error("Failed to publish assessment:", error);
      toast.error("Failed to publish assessment");
    }
  };

  const handleComplete = async () => {
    if (!assessment) return;

    try {
      await completeGlobalAssessment(id);
      toast.success("Assessment marked as completed");
      fetchAssessment();
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

  // Helper function to get submission status badge
  const getSubmissionStatusBadge = (status: string) => {
    switch (status) {
      case "NOT_STARTED":
        return (
          <Badge variant="outline" className="bg-gray-100">
            Not Started
          </Badge>
        );
      case "IN_PROGRESS":
        return (
          <Badge variant="outline" className="bg-blue-100 text-blue-800">
            In Progress
          </Badge>
        );
      case "COMPLETED":
        return <Badge className="bg-green-100 text-green-800">Completed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  // Filter anganwadis by search term
  const filteredAnganwadis =
    assessment?.anganwadiAssessments.filter((a) =>
      a.anganwadi.name.toLowerCase().includes(anganwadiSearch.toLowerCase())
    ) || [];

  // Filter submissions by student search term
  const filteredSubmissions = submissions.filter((s) =>
    s.student.name.toLowerCase().includes(studentSearch.toLowerCase())
  );

  if (loading) {
    return (
      <div className="container mx-auto py-6">
        <div className="grid gap-4">
          <Card className="animate-pulse">
            <CardHeader className="space-y-2">
              <div className="h-6 bg-gray-200 rounded w-1/3"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </CardHeader>
            <CardContent>
              <div className="h-4 bg-gray-200 rounded w-full mb-3"></div>
              <div className="h-4 bg-gray-200 rounded w-full mb-3"></div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!assessment) {
    return (
      <div className="container mx-auto py-6">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-10">
            <AlertCircle className="h-10 w-10 text-amber-500 mb-4" />
            <h3 className="text-lg font-medium">Assessment not found</h3>
            <p className="text-muted-foreground mt-2 text-center max-w-md">
              The assessment you're looking for could not be found or may have
              been deleted.
            </p>
            <Button
              className="mt-4"
              onClick={() => router.push("/admin/global-assessments")}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Assessments
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center mb-6">
        <Button
          variant="ghost"
          onClick={() => router.push("/admin/global-assessments")}
          className="mr-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold flex items-center">
            {assessment.name} {getStatusBadge(assessment.status)}
          </h1>
          <p className="text-muted-foreground">
            {assessment.description || "No description provided"}
          </p>
        </div>
        <div>
          {assessment.status === "DRAFT" && (
            <Button onClick={handlePublish}>
              <Check className="mr-2 h-4 w-4" />
              Publish Assessment
            </Button>
          )}
          {assessment.status === "PUBLISHED" && (
            <Button onClick={handleComplete}>
              <Check className="mr-2 h-4 w-4" />
              Mark as Completed
            </Button>
          )}
        </div>
      </div>

      <div className="bg-blue-50 p-4 rounded-md border border-blue-100 mb-6">
        <div className="flex items-start">
          <div className="flex-1">
            <h3 className="text-sm font-medium text-blue-800">
              Mobile App Integration
            </h3>
            <p className="text-sm text-blue-700 mt-1">
              Teachers can submit student responses to this assessment through
              the mobile app. Student records will appear in the system after
              submission.
            </p>
          </div>
          <Button
            variant="outline"
            className="text-blue-600 border-blue-200 hover:bg-blue-100"
            onClick={() => router.push("/admin/global-assessments/api-docs")}
          >
            <FileText className="mr-2 h-4 w-4" />
            API Documentation
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card>
          <CardContent className="pt-6 flex items-center gap-4">
            <Calendar className="h-10 w-10 text-primary/70" />
            <div>
              <p className="text-sm font-medium">Assessment Period</p>
              <p className="text-lg">
                {formatDate(assessment.startDate)} -{" "}
                {formatDate(assessment.endDate)}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6 flex items-center gap-4">
            <School className="h-10 w-10 text-primary/70" />
            <div>
              <p className="text-sm font-medium">Anganwadis</p>
              <p className="text-lg">
                {assessment.stats.completedAnganwadis} /{" "}
                {assessment.stats.totalAnganwadis} completed
                <span className="text-sm text-muted-foreground ml-2">
                  ({assessment.stats.anganwadiCompletionPercentage}%)
                </span>
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6 flex items-center gap-4">
            <Users className="h-10 w-10 text-primary/70" />
            <div>
              <p className="text-sm font-medium">Students</p>
              <p className="text-lg">
                {assessment.stats.completedStudents} /{" "}
                {assessment.stats.totalStudents} evaluated
                <span className="text-sm text-muted-foreground ml-2">
                  ({assessment.stats.studentCompletionPercentage}%)
                </span>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="anganwadis">Anganwadis</TabsTrigger>
          <TabsTrigger value="topics">Topics & Questions</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Completion Progress</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <div className="flex justify-between mb-1">
                      <span>Anganwadi Completion</span>
                      <span className="font-medium">
                        {assessment.stats.anganwadiCompletionPercentage}%
                      </span>
                    </div>
                    <Progress
                      value={assessment.stats.anganwadiCompletionPercentage}
                    />
                  </div>
                  <div>
                    <div className="flex justify-between mb-1">
                      <span>Student Completion</span>
                      <span className="font-medium">
                        {assessment.stats.studentCompletionPercentage}%
                      </span>
                    </div>
                    <Progress
                      value={assessment.stats.studentCompletionPercentage}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Assessment Schedule</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <Clock className="h-5 w-5 text-muted-foreground mr-2" />
                      <span>Start Date</span>
                    </div>
                    <span className="font-medium">
                      {formatDate(assessment.startDate)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <Clock className="h-5 w-5 text-muted-foreground mr-2" />
                      <span>End Date</span>
                    </div>
                    <span className="font-medium">
                      {formatDate(assessment.endDate)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <FileText className="h-5 w-5 text-muted-foreground mr-2" />
                      <span>Status</span>
                    </div>
                    <span>{getStatusBadge(assessment.status)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <School className="h-5 w-5 text-muted-foreground mr-2" />
                      <span>Total Topics</span>
                    </div>
                    <span className="font-medium">
                      {assessment.topics.length}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="anganwadis">
          <div className="mb-4 p-4 bg-blue-50 rounded-md border border-blue-100">
            <h3 className="text-sm font-medium text-blue-800 mb-1">
              Important Information
            </h3>
            <p className="text-sm text-blue-700">
              Student-level tracking only appears after teachers submit
              responses through the mobile app. Until then, you'll only see
              anganwadi-level tracking showing the expected number of students.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
            <Card className="md:col-span-1">
              <CardHeader>
                <CardTitle>Anganwadis</CardTitle>
                <CardDescription>
                  Select an anganwadi to view student submissions
                </CardDescription>
                <div className="relative mt-2">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search anganwadis..."
                    className="pl-8"
                    value={anganwadiSearch}
                    onChange={(e) => setAnganwadiSearch(e.target.value)}
                  />
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="h-[500px] overflow-y-auto">
                  {filteredAnganwadis.length === 0 ? (
                    <p className="text-center py-4 text-muted-foreground">
                      No anganwadis found
                    </p>
                  ) : (
                    filteredAnganwadis.map((item) => (
                      <div
                        key={item.anganwadiId}
                        className={`flex items-center justify-between p-4 border-b cursor-pointer hover:bg-muted/50 ${
                          selectedAnganwadiId === item.anganwadiId
                            ? "bg-muted"
                            : ""
                        }`}
                        onClick={() => setSelectedAnganwadiId(item.anganwadiId)}
                      >
                        <div>
                          <p className="font-medium">{item.anganwadi.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {item.anganwadi.location || "No location specified"}
                          </p>
                        </div>
                        <div className="flex flex-col items-end">
                          <div className="flex items-center gap-1">
                            {item.isComplete ? (
                              <CheckCircle className="h-4 w-4 text-green-500" />
                            ) : (
                              <Clock className="h-4 w-4 text-amber-500" />
                            )}
                            <span className="text-sm">
                              {item.completedStudentCount} /{" "}
                              {item.totalStudentCount}
                            </span>
                          </div>
                          <Progress
                            value={
                              item.totalStudentCount
                                ? (item.completedStudentCount /
                                    item.totalStudentCount) *
                                  100
                                : 0
                            }
                            className="w-20 h-1 mt-1"
                          />
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="md:col-span-2">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>
                      Student Submissions
                      {selectedAnganwadiId &&
                        assessment.anganwadiAssessments.find(
                          (a) => a.anganwadiId === selectedAnganwadiId
                        )?.anganwadi.name &&
                        ` - ${
                          assessment.anganwadiAssessments.find(
                            (a) => a.anganwadiId === selectedAnganwadiId
                          )?.anganwadi.name
                        }`}
                    </CardTitle>
                    <CardDescription>
                      {selectedAnganwadiId
                        ? `${
                            assessment.anganwadiAssessments.find(
                              (a) => a.anganwadiId === selectedAnganwadiId
                            )?.completedStudentCount
                          } of ${
                            assessment.anganwadiAssessments.find(
                              (a) => a.anganwadiId === selectedAnganwadiId
                            )?.totalStudentCount
                          } students evaluated`
                        : "Select an anganwadi to view student submissions"}
                    </CardDescription>
                  </div>
                  <div className="w-64">
                    <Input
                      placeholder="Search students..."
                      value={studentSearch}
                      onChange={(e) => setStudentSearch(e.target.value)}
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {!selectedAnganwadiId ? (
                  <div className="text-center py-10 text-muted-foreground">
                    <School className="h-10 w-10 mx-auto mb-2 opacity-20" />
                    <p>
                      Select an anganwadi from the list to view student
                      submissions
                    </p>
                  </div>
                ) : submissionsLoading ? (
                  <div className="text-center py-10">
                    <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full mx-auto mb-2"></div>
                    <p className="text-muted-foreground">
                      Loading submissions...
                    </p>
                  </div>
                ) : filteredSubmissions.length === 0 ? (
                  <div className="text-center py-10 text-muted-foreground">
                    <User className="h-10 w-10 mx-auto mb-2 opacity-20" />
                    <p>No student submissions found</p>
                    <p className="text-sm mt-2">
                      Student records will appear here only after teachers
                      submit responses through the mobile app.
                    </p>
                  </div>
                ) : (
                  <div className="overflow-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Student</TableHead>
                          <TableHead>Teacher</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Submitted</TableHead>
                          <TableHead>Responses</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredSubmissions.map((submission) => (
                          <TableRow key={submission.id}>
                            <TableCell className="font-medium">
                              {submission.student.name}
                            </TableCell>
                            <TableCell>{submission.teacher.name}</TableCell>
                            <TableCell>
                              {getSubmissionStatusBadge(
                                submission.submissionStatus
                              )}
                            </TableCell>
                            <TableCell>
                              {submission.submittedAt
                                ? formatDate(submission.submittedAt)
                                : "-"}
                            </TableCell>
                            <TableCell>
                              {submission.responses.length} /{" "}
                              {
                                assessment.topics.flatMap((t) => t.questions)
                                  .length
                              }
                            </TableCell>
                            <TableCell className="text-right">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() =>
                                  router.push(
                                    `/admin/global-assessments/${id}/submissions/${submission.id}`
                                  )
                                }
                              >
                                <ExternalLink className="h-4 w-4 mr-2" />
                                View
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="topics">
          <div className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Assessment Topics & Questions</CardTitle>
                <CardDescription>
                  {assessment.topics.length} topics and{" "}
                  {assessment.topics.reduce(
                    (sum, topic) => sum + topic.questions.length,
                    0
                  )}{" "}
                  questions in this assessment
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {assessment.topics.map((topic) => (
                    <div key={topic.id} className="border rounded-md p-4">
                      <h3 className="text-lg font-medium mb-2 flex items-center">
                        <FileText className="h-5 w-5 mr-2 text-primary/70" />
                        {topic.name}
                      </h3>
                      <div className="pl-7 space-y-2 mt-4">
                        {topic.questions.map((question, index) => (
                          <div key={question.id} className="flex items-start">
                            <div className="bg-muted rounded-full w-6 h-6 flex items-center justify-center text-xs mr-2 flex-shrink-0 mt-0.5">
                              {index + 1}
                            </div>
                            <p>{question.text}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
