"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { 
  getEvaluationById, 
  submitEvaluation, 
  gradeStudentResponse, 
  completeEvaluationGrading 
} from "@/app/api/api";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { 
  BookOpen, 
  Check, 
  CheckCircle, 
  FileAudio, 
  Loader2,
  Send,
  User,
  Users
} from "lucide-react";
import { toast } from "sonner";
import {
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

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
    gradedAt: string;
  }>;
}

interface Evaluation {
  id: string;
  student: {
    id: string;
    name: string;
  };
  teacher: {
    id: string;
    name: string;
  };
  topic: {
    id: string;
    name: string;
  };
  weekNumber: number;
  metadataUrl: string;
  audioUrl: string;
  status: string;
  submittedAt: string | null;
  gradingComplete: boolean;
  studentResponses: StudentResponse[];
}

export default function EvaluationDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [evaluation, setEvaluation] = useState<Evaluation | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [grading, setGrading] = useState(false);
  const [scores, setScores] = useState<{[key: string]: number}>({});

  const fetchEvaluation = async () => {
    setLoading(true);
    try {
      const data = await getEvaluationById(params.id as string);
      setEvaluation(data);
      
      // Initialize scores from existing grades
      const initialScores: {[key: string]: number} = {};
      data.studentResponses.forEach((response: StudentResponse) => {
        if (response.StudentResponseScore && response.StudentResponseScore.length > 0) {
          // Use the most recent score
          const latestScore = response.StudentResponseScore.reduce((latest, current) => {
            return new Date(current.gradedAt) > new Date(latest.gradedAt) ? current : latest;
          }, response.StudentResponseScore[0]);
          
          initialScores[response.id] = latestScore.score;
        } else {
          initialScores[response.id] = 0; // Default score
        }
      });
      
      setScores(initialScores);
    } catch (error) {
      console.error("Failed to fetch evaluation:", error);
      toast.error("Failed to load evaluation details");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (params.id) {
      fetchEvaluation();
    }
  }, [params.id]);

  // Handle submitting the evaluation
  const handleSubmitEvaluation = async () => {
    if (!evaluation) return;
    
    setSubmitting(true);
    try {
      await submitEvaluation(evaluation.id);
      toast.success("Evaluation submitted successfully");
      fetchEvaluation(); // Refresh data
    } catch (error) {
      console.error("Failed to submit evaluation:", error);
      toast.error("Failed to submit evaluation");
    } finally {
      setSubmitting(false);
    }
  };

  // Handle grading a response
  const handleGradeResponse = async (responseId: string) => {
    if (!scores[responseId]) return;
    
    setGrading(true);
    try {
      await gradeStudentResponse(responseId, scores[responseId]);
      toast.success("Response graded successfully");
    } catch (error) {
      console.error("Failed to grade response:", error);
      toast.error("Failed to grade response");
    } finally {
      setGrading(false);
    }
  };

  // Handle score change
  const handleScoreChange = (responseId: string, value: string) => {
    const numValue = parseFloat(value);
    if (!isNaN(numValue) && numValue >= 0 && numValue <= 5) {
      setScores({ ...scores, [responseId]: numValue });
    }
  };

  // Complete the entire evaluation grading
  const handleCompleteGrading = async () => {
    if (!evaluation) return;
    
    setGrading(true);
    try {
      await completeEvaluationGrading(evaluation.id);
      toast.success("Evaluation grading completed");
      fetchEvaluation(); // Refresh data
    } catch (error) {
      console.error("Failed to complete grading:", error);
      toast.error("Failed to complete grading");
    } finally {
      setGrading(false);
    }
  };

  // Function to render the appropriate action button based on status
  const renderActionButton = () => {
    if (!evaluation) return null;
    
    switch (evaluation.status) {
      case "DRAFT":
        return (
          <Button 
            onClick={handleSubmitEvaluation} 
            disabled={submitting}
            className="w-full md:w-auto"
          >
            {submitting ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Send className="mr-2 h-4 w-4" />
            )}
            Submit Evaluation
          </Button>
        );
      case "SUBMITTED":
        return (
          <Button 
            onClick={handleCompleteGrading} 
            disabled={grading}
            className="w-full md:w-auto"
          >
            {grading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <CheckCircle className="mr-2 h-4 w-4" />
            )}
            Complete Grading
          </Button>
        );
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-black" />
        <span className="ml-2">Loading evaluation details...</span>
      </div>
    );
  }

  if (!evaluation) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-medium">Evaluation not found</h2>
        <Button 
          variant="outline" 
          onClick={() => router.push('/admin/evaluations')}
          className="mt-4"
        >
          Back to Evaluations
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-4 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">Evaluation Details</h1>
          <p className="text-muted-foreground">
            {evaluation.topic?.name} - Week {evaluation.weekNumber}
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          {getStatusBadge(evaluation.status)}
          {renderActionButton()}
          <Button 
            variant="outline" 
            onClick={() => router.push('/admin/evaluations')}
          >
            Back to List
          </Button>
        </div>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Student</h3>
                <p className="text-base font-medium flex items-center">
                  <User className="mr-2 h-4 w-4" />
                  {evaluation.student?.name || "Unknown"}
                </p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Teacher</h3>
                <p className="text-base font-medium flex items-center">
                  <Users className="mr-2 h-4 w-4" />
                  {evaluation.teacher?.name || "Unknown"}
                </p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Topic</h3>
                <p className="text-base font-medium flex items-center">
                  <BookOpen className="mr-2 h-4 w-4" />
                  {evaluation.topic?.name || "Unknown"}
                </p>
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Audio Recording</h3>
                {evaluation.audioUrl ? (
                  <audio controls className="w-full mt-1">
                    <source src={evaluation.audioUrl} type="audio/mpeg" />
                    Your browser does not support the audio element.
                  </audio>
                ) : (
                  <p className="text-sm text-muted-foreground">No audio available</p>
                )}
              </div>
              
              {evaluation.metadataUrl && (
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Metadata</h3>
                  <a 
                    href={evaluation.metadataUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-sm text-blue-500 hover:underline"
                  >
                    View Metadata
                  </a>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Student Responses Section */}
      {evaluation.studentResponses && evaluation.studentResponses.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Student Responses</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Question</TableHead>
                  <TableHead>Audio</TableHead>
                  <TableHead>Score</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {evaluation.studentResponses.map((response) => (
                  <TableRow key={response.id}>
                    <TableCell className="font-medium">
                      {response.question?.text || "Question text not available"}
                    </TableCell>
                    <TableCell>
                      {response.audioUrl ? (
                        <audio controls className="w-full">
                          <source src={response.audioUrl} type="audio/mpeg" />
                          Your browser does not support the audio element.
                        </audio>
                      ) : (
                        "No audio"
                      )}
                    </TableCell>
                    <TableCell>
                      {evaluation.status === "SUBMITTED" ? (
                        <div className="flex items-center gap-2">
                          <div className="w-24">
                            <Label htmlFor={`score-${response.id}`} className="sr-only">
                              Score
                            </Label>
                            <Input
                              id={`score-${response.id}`}
                              type="number"
                              min={0}
                              max={5}
                              step={0.5}
                              value={scores[response.id] || 0}
                              onChange={(e) => handleScoreChange(response.id, e.target.value)}
                              className="w-full"
                            />
                          </div>
                          <span className="text-sm font-medium">/5</span>
                        </div>
                      ) : (
                        <div>
                          {response.StudentResponseScore && 
                           response.StudentResponseScore.length > 0 ? (
                            <span className="font-medium">
                              {response.StudentResponseScore[0].score}
                            </span>
                          ) : (
                            <span className="text-muted-foreground">Not graded</span>
                          )}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      {evaluation.status === "SUBMITTED" && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleGradeResponse(response.id)}
                          disabled={grading}
                        >
                          {grading ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Check className="h-4 w-4 mr-1" />
                          )}
                          Grade
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
          {evaluation.status === "SUBMITTED" && (
            <CardFooter className="flex justify-end">
              <Button onClick={handleCompleteGrading} disabled={grading}>
                {grading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <CheckCircle className="mr-2 h-4 w-4" />
                )}
                Complete Grading
              </Button>
            </CardFooter>
          )}
        </Card>
      )}
    </div>
  );
}

// Function to get appropriate badge color based on status
const getStatusBadge = (status: string) => {
  switch (status) {
    case "DRAFT":
      return <Badge variant="outline">Draft</Badge>;
    case "SUBMITTED":
      return <Badge variant="secondary">Submitted</Badge>;
    case "GRADED":
      return <Badge className="bg-green-100 text-green-800">Graded</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
}; 