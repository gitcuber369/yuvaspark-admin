"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Play, Download } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface Response {
  id: string;
  questionId: string;
  questionText: string;
  startTime: string;
  endTime: string;
  audioUrl: string;
  score?: number;
  feedback?: string;
}

interface Submission {
  id: string;
  student: {
    id: string;
    name: string;
    anganwadiId: string;
  };
  teacher: {
    id: string;
    name: string;
  };
  assessmentSession: {
    id: string;
    name: string;
  };
  responses: Response[];
  createdAt: string;
  status: string;
}

export default function SubmissionDetails({
  params,
}: {
  params: { id: string; submissionId: string };
}) {
  const router = useRouter();
  const [submission, setSubmission] = useState<Submission | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSubmission = async () => {
      try {
        const response = await fetch(
          `http://localhost:3000/api/global-assessments/${params.id}/submissions/${params.submissionId}`
        );
        if (!response.ok) {
          throw new Error("Failed to fetch submission");
        }
        const data = await response.json();
        setSubmission(data);
      } catch (err) {
        setError("Failed to fetch submission details");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchSubmission();
  }, [params.id, params.submissionId]);

  const handlePlayAudio = (audioUrl: string) => {
    // Implement audio playback logic
    console.log("Playing audio:", audioUrl);
  };

  const handleDownloadAudio = (audioUrl: string) => {
    // Implement audio download logic
    window.open(audioUrl, "_blank");
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  if (!submission) {
    return (
      <div className="p-4">
        <p>Submission not found</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-bold">Submission Details</h1>
        </div>
        <Badge
          variant={
            submission.status === "COMPLETED"
              ? "default"
              : submission.status === "IN_PROGRESS"
              ? "secondary"
              : "outline"
          }
        >
          {submission.status}
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Student Info */}
        <Card>
          <CardHeader>
            <CardTitle>Student Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p>
                <span className="font-medium">Name:</span>{" "}
                {submission.student.name}
              </p>
              <p>
                <span className="font-medium">Anganwadi ID:</span>{" "}
                {submission.student.anganwadiId}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Teacher Info */}
        <Card>
          <CardHeader>
            <CardTitle>Teacher Information</CardTitle>
          </CardHeader>
          <CardContent>
            <p>
              <span className="font-medium">Name:</span>{" "}
              {submission.teacher.name}
            </p>
          </CardContent>
        </Card>

        {/* Assessment Info */}
        <Card className="col-span-1 md:col-span-2">
          <CardHeader>
            <CardTitle>Assessment Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p>
                <span className="font-medium">Assessment:</span>{" "}
                {submission.assessmentSession.name}
              </p>
              <p>
                <span className="font-medium">Submitted on:</span>{" "}
                {new Date(submission.createdAt).toLocaleString()}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Responses */}
        <div className="col-span-1 md:col-span-2">
          <h2 className="text-xl font-semibold mb-4">Student Responses</h2>
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Question</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Score</TableHead>
                  <TableHead>Feedback</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {submission.responses.map((response) => (
                  <TableRow key={response.id}>
                    <TableCell>{response.questionText}</TableCell>
                    <TableCell>
                      {Math.round(
                        (new Date(response.endTime).getTime() -
                          new Date(response.startTime).getTime()) /
                          1000
                      )}{" "}
                      seconds
                    </TableCell>
                    <TableCell>
                      {response.score !== undefined ? (
                        <Badge
                          variant={
                            response.score >= 3 ? "default" : "destructive"
                          }
                        >
                          {response.score}
                        </Badge>
                      ) : (
                        "Not Graded"
                      )}
                    </TableCell>
                    <TableCell>{response.feedback || "No feedback"}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() =>
                                  handlePlayAudio(response.audioUrl)
                                }
                              >
                                <Play className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Play Audio</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>

                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() =>
                                  handleDownloadAudio(response.audioUrl)
                                }
                              >
                                <Download className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Download Audio</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    </div>
  );
}
