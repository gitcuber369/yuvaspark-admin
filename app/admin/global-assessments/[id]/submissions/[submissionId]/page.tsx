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
import {
  getSubmissionById,
  getStudentResponses,
  scoreStudentResponse,
} from "@/app/api/api";
import { toast } from "sonner";
import {
  ArrowLeft,
  User,
  Clock,
  CheckCircle,
  AlertCircle,
  Loader2,
  Star,
  RefreshCw,
  FileText,
  AlertTriangle,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface AudioMetadata {
  recordingId: string;
  studentId: string;
  studentName: string;
  assessmentId: string;
  assessmentName: string;
  totalDurationMs: number;
  totalDurationFormatted: string;
  recordedAt: string;
  segments: Array<{
    index: number;
    questionId: string;
    questionText: string;
    startTimeMs: number;
    endTimeMs: number;
    durationMs: number;
    startTimeFormatted: string;
    endTimeFormatted: string;
    durationFormatted: string;
  }>;
  totalSegments: number;
  audioUrl?: string;
}

interface StudentResponse {
  id: string;
  questionId: string;
  audioUrl: string;
  startTime: string;
  endTime: string;
  metadataUrl?: string;
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
  const [audioMetadataMap, setAudioMetadataMap] = useState<{
    [responseId: string]: AudioMetadata | null;
  }>({});
  const [loadingMetadata, setLoadingMetadata] = useState<{
    [responseId: string]: boolean;
  }>({});

  useEffect(() => {
    const fetchSubmission = async () => {
      try {
        const data = await getSubmissionById(
          params.id as string,
          params.submissionId as string
        );
        setSubmission(data);

        // Initialize metadata loading state for each response
        const initialLoadingState: { [responseId: string]: boolean } = {};
        data.responses.forEach((response: StudentResponse) => {
          initialLoadingState[response.id] = false;
        });
        setLoadingMetadata(initialLoadingState);

        // Check each response for metadata URL
        data.responses.forEach((response: StudentResponse) => {
          if (response.metadataUrl) {
            loadAudioMetadata(response.id, response.metadataUrl);
          }
        });
      } catch (error) {
        console.error("Failed to fetch submission:", error);
        toast.error("Failed to load submission details");
      } finally {
        setLoading(false);
      }
    };

    fetchSubmission();
  }, [params.id, params.submissionId]);

  const loadAudioMetadata = async (responseId: string, url: string) => {
    setLoadingMetadata((prev) => ({ ...prev, [responseId]: true }));
    try {
      console.log(`Loading metadata for response ${responseId} from ${url}`);
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Failed to fetch metadata: ${response.statusText}`);
      }
      const metadata = await response.json();
      console.log(
        `Metadata loaded successfully for response ${responseId}`,
        metadata
      );
      setAudioMetadataMap((prev) => ({ ...prev, [responseId]: metadata }));
    } catch (error) {
      console.error(
        `Error loading metadata for response ${responseId}:`,
        error
      );
      toast.error(
        `Failed to load audio timeline metadata for response ${responseId}`
      );
      setAudioMetadataMap((prev) => ({ ...prev, [responseId]: null }));
    } finally {
      setLoadingMetadata((prev) => ({ ...prev, [responseId]: false }));
    }
  };

  const seekToTimestamp = (
    audioElement: HTMLAudioElement | null,
    timeMs: number
  ) => {
    if (!audioElement) return;

    const timeSeconds = timeMs / 1000;
    audioElement.currentTime = timeSeconds;
    audioElement
      .play()
      .catch((err) => console.error("Error playing audio:", err));
  };

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
    <div className="container mx-auto py-6 px-4 sm:px-6 max-w-6xl">
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-6">
        <Button
          variant="outline"
          onClick={() => router.push(`/admin/global-assessments/${params.id}`)}
          className="hover:bg-slate-100 transition-colors w-full sm:w-auto"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Assessment
        </Button>
        <div className="mt-2 sm:mt-0">
          {getStatusBadge(submission.submissionStatus)}
        </div>
      </div>

      <div className="grid gap-6">
        <Card className="border-slate-200 shadow-sm">
          <CardHeader className="bg-slate-50 border-b pb-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div>
                <CardTitle className="text-lg sm:text-xl font-semibold text-slate-800">
                  Student Submission Details
                </CardTitle>
                <CardDescription className="mt-1 text-slate-600">
                  Submitted on {formatDate(submission.submittedAt)}
                </CardDescription>
              </div>
              <div className="mt-2 sm:mt-0">
                {getStatusBadge(submission.submissionStatus)}
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mb-6 bg-slate-50 p-4 rounded-md">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                  <User className="h-5 w-5 text-primary" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-slate-600">Student</p>
                  <p className="text-base font-semibold text-slate-800 truncate">
                    {submission.student.name}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                  <User className="h-5 w-5 text-primary" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-slate-600">Teacher</p>
                  <p className="text-base font-semibold text-slate-800 truncate">
                    {submission.teacher.name}
                  </p>
                </div>
              </div>
            </div>

            {/* Single shared audio player */}
            {submission.responses.length > 0 && (
              <Card className="mb-6 border-primary/20 overflow-hidden shadow-sm">
                <CardHeader className="pb-2 bg-gradient-to-r from-primary/5 to-primary/10">
                  <CardTitle className="text-base flex items-center text-slate-800">
                    <div className="h-8 w-8 bg-primary/20 rounded-full flex items-center justify-center mr-2 flex-shrink-0">
                      <FileText className="h-4 w-4 text-primary" />
                    </div>
                    Complete Recording
                  </CardTitle>
                  <CardDescription className="text-slate-600">
                    This recording contains all responses
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-4 bg-gradient-to-b from-slate-50 to-white">
                  <audio
                    controls
                    className="w-full rounded shadow-sm"
                    id="main-audio-player"
                    controlsList="nodownload"
                    preload="metadata"
                  >
                    <source
                      src={submission.responses[0].audioUrl}
                      type="audio/mpeg"
                    />
                    Your browser does not support the audio element.
                  </audio>
                </CardContent>
              </Card>
            )}

            {/* Load metadata button if any response has metadata URL */}
            {submission.responses.some((r) => r.metadataUrl) &&
              !submission.responses.some((r) => loadingMetadata[r.id]) &&
              !submission.responses.some((r) => audioMetadataMap[r.id]) && (
                <div className="mb-6 flex justify-center">
                  <Button
                    variant="outline"
                    className="bg-gradient-to-r from-slate-50 to-white border-primary/20 hover:bg-primary/5 transition-all"
                    onClick={() => {
                      // Find first response with metadata URL
                      const responseWithMetadata = submission.responses.find(
                        (r) => r.metadataUrl
                      );
                      if (responseWithMetadata) {
                        loadAudioMetadata(
                          responseWithMetadata.id,
                          responseWithMetadata.metadataUrl!
                        );
                      }
                    }}
                  >
                    <Clock className="h-4 w-4 mr-2 text-primary" />
                    Load Audio Timeline
                  </Button>
                </div>
              )}

            {/* Loading indicator for metadata */}
            {submission.responses.some(
              (r) => r.metadataUrl && loadingMetadata[r.id]
            ) && (
              <div className="flex flex-col items-center justify-center p-6 sm:p-8 mb-6 bg-slate-50 rounded-md border border-slate-100">
                <Loader2 className="h-8 w-8 animate-spin mb-3 text-primary" />
                <span className="text-sm font-medium text-slate-600">
                  Loading audio timeline...
                </span>
              </div>
            )}

            {/* Timeline display if metadata is available for any response */}
            {submission.responses.some((r) => audioMetadataMap[r.id]) && (
              <Card className="mb-6 border-accent/20 shadow-sm overflow-hidden">
                <CardHeader className="pb-2 bg-gradient-to-r from-blue-50 to-indigo-50 border-b">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                    <CardTitle className="text-base flex items-center text-slate-800">
                      <div className="h-8 w-8 bg-accent/20 rounded-full flex items-center justify-center mr-2 flex-shrink-0">
                        <Clock className="h-4 w-4 text-accent" />
                      </div>
                      Audio Timeline
                    </CardTitle>
                    {Object.values(audioMetadataMap).some(
                      (m) => m?.totalDurationFormatted
                    ) && (
                      <Badge
                        variant="outline"
                        className="bg-white/80 font-normal text-slate-700 self-start sm:self-auto"
                      >
                        Total duration:{" "}
                        {
                          Object.values(audioMetadataMap).find(
                            (m) => m?.totalDurationFormatted
                          )?.totalDurationFormatted
                        }
                      </Badge>
                    )}
                  </div>

                  {/* Add button to view raw metadata - Make it more prominent */}
                  <div className="flex justify-end mt-3">
                    {submission.responses.some((r) => r.metadataUrl) && (
                      <Button variant="outline" size="sm" asChild>
                        <a
                          href={
                            submission.responses.find((r) => r.metadataUrl)
                              ?.metadataUrl
                          }
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center text-sm font-medium"
                        >
                          <FileText className="h-4 w-4 mr-2" />
                          View Raw Metadata
                        </a>
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="divide-y border-0 rounded-b-md overflow-hidden">
                    {submission.responses.map((response, idx) => {
                      const metadata = audioMetadataMap[response.id];
                      if (!metadata) return null;

                      const segment =
                        metadata.segments?.find(
                          (s) => s.questionId === response.questionId
                        ) || metadata.segments?.find((_, i) => i === idx);

                      if (!segment) return null;

                      return (
                        <div
                          key={response.id}
                          className="p-3 sm:p-4 flex flex-col sm:flex-row gap-2 sm:gap-0 sm:justify-between sm:items-center bg-white hover:bg-slate-50 transition-colors"
                        >
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-sm text-slate-700 line-clamp-2">
                              {response.question.text}
                            </div>
                            <div className="text-xs text-slate-500 mt-1">
                              Response {idx + 1} - Duration:{" "}
                              {segment.durationFormatted}
                            </div>
                          </div>
                          <div className="text-xs font-mono bg-slate-100 text-slate-600 px-2 sm:px-3 py-1 rounded-full mx-0 sm:mx-2 self-start sm:self-auto whitespace-nowrap">
                            {segment.startTimeFormatted} -{" "}
                            {segment.endTimeFormatted}
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            className="bg-white hover:bg-primary/5 border-primary/20 transition-colors self-start sm:self-auto mt-2 sm:mt-0"
                            onClick={() => {
                              const audioElement = document.getElementById(
                                "main-audio-player"
                              ) as HTMLAudioElement;
                              seekToTimestamp(
                                audioElement,
                                segment.startTimeMs
                              );
                            }}
                          >
                            <Clock className="h-3 w-3 mr-1 text-primary" />
                            Play
                          </Button>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="space-y-4">
              {submission.responses.map((response, index) => (
                <Card
                  key={response.id}
                  className="overflow-hidden border-slate-200 shadow-sm hover:shadow transition-shadow"
                >
                  <CardHeader className="bg-gradient-to-r from-slate-50 to-white border-b">
                    <CardTitle className="text-base text-slate-800 break-words">
                      <span className="inline-block bg-primary/10 text-primary text-xs px-2 py-1 rounded-full mr-2">
                        Q{index + 1}
                      </span>
                      {response.question.text}
                    </CardTitle>
                    <CardDescription className="mt-1 text-slate-600">
                      Response {index + 1} - Duration:{" "}
                      {formatDuration(response.startTime, response.endTime)}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-4">
                    <div className="space-y-4">
                      {/* Play button for this response using the shared audio player */}
                      <div>
                        <Button
                          variant="outline"
                          className="w-full bg-gradient-to-r from-white to-slate-50 hover:from-primary/5 hover:to-primary/10 transition-all border-primary/20"
                          onClick={() => {
                            const audioElement = document.getElementById(
                              "main-audio-player"
                            ) as HTMLAudioElement;
                            const metadata = Object.values(
                              audioMetadataMap
                            ).find((m) => m?.segments);
                            const segment = metadata?.segments?.find(
                              (s, i) => i === index
                            );

                            if (segment) {
                              seekToTimestamp(
                                audioElement,
                                segment.startTimeMs
                              );
                            } else {
                              // If no metadata, just play from the beginning
                              seekToTimestamp(audioElement, 0);
                            }
                          }}
                        >
                          <Clock className="h-4 w-4 mr-2 text-primary" />
                          Play This Response
                        </Button>
                      </div>

                      <div className="pt-3 border-t">
                        <p className="text-sm font-medium mb-2 text-slate-700">
                          Score
                        </p>
                        {response.StudentResponseScore &&
                        response.StudentResponseScore.length > 0 ? (
                          <div className="flex flex-wrap items-center gap-2 p-2 bg-slate-50 rounded-md">
                            <Badge
                              className={`text-lg ${getScoreColor(
                                response.StudentResponseScore[0].score
                              )}`}
                            >
                              <Star className="h-4 w-4 mr-1" />
                              {response.StudentResponseScore[0].score}/10
                            </Badge>
                            <span className="text-sm text-slate-600">
                              {response.StudentResponseScore[0].score >= 8
                                ? "Excellent"
                                : response.StudentResponseScore[0].score >= 6
                                ? "Good"
                                : response.StudentResponseScore[0].score >= 4
                                ? "Fair"
                                : "Needs Improvement"}
                            </span>
                          </div>
                        ) : (
                          <div className="flex flex-col sm:flex-row gap-2 bg-slate-50 p-3 rounded-md">
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
                                if (e.key === "Enter") {
                                  handleGradeSubmission(response.id);
                                }
                              }}
                              className="w-full sm:w-40 border-slate-200 focus:ring-primary"
                            />
                            <Button
                              onClick={() => handleGradeSubmission(response.id)}
                              disabled={submittingGrades[response.id]}
                              className="bg-primary hover:bg-primary/90 text-white w-full sm:w-auto"
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
