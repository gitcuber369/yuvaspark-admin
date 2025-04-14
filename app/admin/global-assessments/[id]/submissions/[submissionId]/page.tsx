"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getSubmissionById, getStudentResponses, scoreStudentResponse } from "@/app/api/api";
import { toast } from "sonner";
import { ArrowLeft, User, Clock, CheckCircle, AlertCircle, Loader2, Star } from "lucide-react";
import { Input } from "@/components/ui/input";

interface StudentResponse {
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
}

interface StudentSubmission {
  id: string;
  assessmentSessionId: string;
  anganwadiId: string;
  studentId: string;
  teacherId: string;
  submissionStatus: string;
  submittedAt: string;
  student: {
    id: string;
    name: string;
  };
  teacher: {
    id: string;
    name: string;
  };
  responses: StudentResponse[];
}

export default function SubmissionDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const [submission, setSubmission] = useState<StudentSubmission | null>(null);
  const [loading, setLoading] = useState(true);
  const [gradingScores, setGradingScores] = useState<{ [key: string]: string }>(
    {}
  );
  const [submittingGrades, setSubmittingGrades] = useState<{
    [key: string]: boolean;
  }>({});

  useEffect(() => {
    const fetchSubmission = async () => {
      try {
        const data = await getSubmissionById(
          params.id as string,
          params.submissionId as string
        );
        setSubmission(data);
      } catch (error) {
        console.error("Failed to fetch submission:", error);
        toast.error("Failed to load submission details");
      } finally {
        setLoading(false);
      }
    };

    fetchSubmission();
  }, [params.id, params.submissionId]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatDuration = (startTime: string, endTime: string) => {
    const start = new Date(startTime);
    const end = new Date(endTime);
    const durationMs = end.getTime() - start.getTime();
    const seconds = Math.floor(durationMs / 1000);
    const minutes = Math.floor(seconds / 60);
    return `${minutes}m ${seconds % 60}s`;
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return (
          <Badge className="bg-green-500">
            <CheckCircle className="w-3 h-3 mr-1" />
            Completed
          </Badge>
        );
      case "IN_PROGRESS":
        return (
          <Badge variant="secondary">
            <Clock className="w-3 h-3 mr-1" />
            In Progress
          </Badge>
        );
      default:
        return (
          <Badge variant="outline">
            <AlertCircle className="w-3 h-3 mr-1" />
            {status}
          </Badge>
        );
    }
  };

  const handleGradeSubmission = async (responseId: string) => {
    const scoreStr = gradingScores[responseId];
    if (!scoreStr || scoreStr.trim() === "") {
      toast.error("Please enter a score");
      return;
    }

    const score = parseFloat(scoreStr);
    if (isNaN(score)) {
      toast.error("Please enter a valid number");
      return;
    }

    if (score < 0 || score > 10) {
      toast.error("Score must be between 0 and 10");
      return;
    }

    if (!Number.isInteger(score) && score % 0.5 !== 0) {
      toast.error("Score must be a whole number or end in .5");
      return;
    }

    setSubmittingGrades((prev) => ({ ...prev, [responseId]: true }));
    try {
      await scoreStudentResponse(responseId, score);

      // Update the local state to reflect the new score
      setSubmission((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          responses: prev.responses.map((response) => {
            if (response.id === responseId) {
              return {
                ...response,
                StudentResponseScore: [
                  {
                    id: "temp-id",
                    score: score,
                  },
                ],
              };
            }
            return response;
          }),
        };
      });

      toast.success("Response graded successfully");

      // Refresh the submission data to get the updated scores
      const updatedSubmission = await getSubmissionById(
        params.id as string,
        params.submissionId as string
      );
      setSubmission(updatedSubmission);

      // Clear the input field
      setGradingScores((prev) => {
        const newScores = { ...prev };
        delete newScores[responseId];
        return newScores;
      });
    } catch (error) {
      console.error("Failed to grade response:", error);
      toast.error("Failed to grade response");
    } finally {
      setSubmittingGrades((prev) => ({ ...prev, [responseId]: false }));
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 8) return "bg-green-100 text-green-800";
    if (score >= 6) return "bg-blue-100 text-blue-800";
    if (score >= 4) return "bg-yellow-100 text-yellow-800";
    return "bg-red-100 text-red-800";
  };

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

  if (!submission) {
    return (
      <div className="container mx-auto py-6">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-10">
            <AlertCircle className="h-10 w-10 text-amber-500 mb-4" />
            <h3 className="text-lg font-medium">Submission not found</h3>
            <p className="text-muted-foreground mt-2 text-center max-w-md">
              The submission you're looking for could not be found or may have
              been deleted.
            </p>
            <Button
              className="mt-4"
              onClick={() =>
                router.push(`/admin/global-assessments/${params.id}`)
              }
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Assessment
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center gap-4 mb-6">
        <Button
          variant="outline"
          onClick={() => router.push(`/admin/global-assessments/${params.id}`)}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Assessment
        </Button>
        {getStatusBadge(submission.submissionStatus)}
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Student Submission Details</CardTitle>
            <CardDescription>
              Submitted on {formatDate(submission.submittedAt)}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="flex items-center gap-2">
                <User className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Student</p>
                  <p className="text-sm text-muted-foreground">
                    {submission.student.name}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <User className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Teacher</p>
                  <p className="text-sm text-muted-foreground">
                    {submission.teacher.name}
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              {submission.responses.map((response) => (
                <Card key={response.id}>
                  <CardHeader>
                    <CardTitle className="text-base">
                      {response.question.text}
                    </CardTitle>
                    <CardDescription>
                      Duration: {formatDuration(response.startTime, response.endTime)}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <p className="text-sm font-medium mb-2">Audio Response</p>
                        <audio controls className="w-full">
                          <source src={response.audioUrl} type="audio/mpeg" />
                          Your browser does not support the audio element.
                        </audio>
                      </div>
                      <div>
                        <p className="text-sm font-medium mb-2">Score</p>
                        {response.StudentResponseScore && response.StudentResponseScore.length > 0 ? (
                          <div className="flex items-center gap-2">
                            <Badge className={`text-lg ${getScoreColor(response.StudentResponseScore[0].score)}`}>
                              <Star className="h-4 w-4 mr-1" />
                              {response.StudentResponseScore[0].score}/10
                            </Badge>
                            <span className="text-sm text-muted-foreground">
                              {response.StudentResponseScore[0].score >= 8 ? "Excellent" :
                               response.StudentResponseScore[0].score >= 6 ? "Good" :
                               response.StudentResponseScore[0].score >= 4 ? "Fair" : "Needs Improvement"}
                            </span>
                          </div>
                        ) : (
                          <div className="flex gap-2">
                            <Input
                              type="number"
                              min="0"
                              max="10"
                              step="0.5"
                              placeholder="Enter score (0-10)"
                              value={gradingScores[response.id] || ""}
                              onChange={(e) =>
                                setGradingScores((prev) => ({
                                  ...prev,
                                  [response.id]: e.target.value,
                                }))
                              }
                              onKeyPress={(e) => {
                                if (e.key === 'Enter') {
                                  handleGradeSubmission(response.id);
                                }
                              }}
                              className="w-40"
                            />
                            <Button
                              onClick={() => handleGradeSubmission(response.id)}
                              disabled={submittingGrades[response.id]}
                            >
                              {submittingGrades[response.id] ? (
                                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                              ) : (
                                <CheckCircle className="h-4 w-4 mr-2" />
                              )}
                              Grade
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
