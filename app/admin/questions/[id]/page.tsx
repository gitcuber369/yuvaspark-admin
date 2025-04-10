"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { getQuestionDetails } from "@/app/api/api";

interface Question {
  id: string;
  text: string;
  imageUrl: string;
  audioUrl: string;
  topicId: string;
  topic?: {
    id: string;
    name: string;
  };
  stats?: {
    totalResponses: number;
    gradedResponses: number;
    averageScore: number;
    gradingPercentage: number;
  };
  responses?: Array<{
    id: string;
    studentId: string;
    audioResponse: string;
    createdAt: string;
    StudentResponseScore?: Array<{
      id: string;
      score: number;
      feedback: string;
      gradedAt: string;
    }>;
  }>;
}

export default function QuestionDetailPage({ params }: { params: { id: string } }) {
  const [question, setQuestion] = useState<Question | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const router = useRouter();

  useEffect(() => {
    const fetchQuestionDetails = async () => {
      setIsLoading(true);
      try {
        console.log("Component: Fetching question with ID:", params.id);
        
        // Fetch the question details
        const data = await getQuestionDetails(params.id);
        console.log("Component: Question data received:", data);
        
        if (!data) {
          console.error("Component: No data returned from API");
          toast.error("No question data found");
          setQuestion(null);
          return;
        }
        
        setQuestion(data);
      } catch (error: any) {
        console.error("Component: Failed to fetch question details:", error);
        console.error("Component: Error message:", error.message);
        console.error("Component: Error response:", error.response?.data);
        
        toast.error(error.response?.data?.message || "Failed to load question details");
        setQuestion(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchQuestionDetails();
  }, [params.id]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p>Loading question details...</p>
      </div>
    );
  }

  if (!question) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <h2 className="text-2xl font-bold mb-4">Question not found</h2>
        <Button onClick={() => router.push("/admin/questions")}>
          Back to Questions
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Question Details</h1>
          <p className="text-muted-foreground">ID: {question.id}</p>
        </div>
        <Button onClick={() => router.push("/admin/questions")}>
          Back to Questions
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Question Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-1">Topic</h3>
              <div className="flex items-center">
                <Badge variant="outline" className="mr-2">
                  {question.topic?.name || "Unknown Topic"}
                </Badge>
                <span className="text-xs text-muted-foreground">
                  (ID: {question.topicId})
                </span>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-1">Question Text</h3>
              <p className="text-lg">{question.text}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-2">Image</h3>
                {question.imageUrl ? (
                  <div className="rounded-md overflow-hidden border h-[200px]">
                    <img
                      src={question.imageUrl}
                      alt="Question visual"
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <p className="text-muted-foreground">No image available</p>
                )}
              </div>

              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-2">Audio</h3>
                {question.audioUrl ? (
                  <div className="p-4 border rounded-md">
                    <audio controls src={question.audioUrl} className="w-full" />
                  </div>
                ) : (
                  <p className="text-muted-foreground">No audio available</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Response Statistics</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-muted rounded-md">
                <h4 className="text-sm font-medium text-muted-foreground">Total Responses</h4>
                <p className="text-2xl font-semibold">{question.stats?.totalResponses || 0}</p>
              </div>
              <div className="p-3 bg-muted rounded-md">
                <h4 className="text-sm font-medium text-muted-foreground">Graded</h4>
                <p className="text-2xl font-semibold">{question.stats?.gradedResponses || 0}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-muted rounded-md">
                <h4 className="text-sm font-medium text-muted-foreground">Average Score</h4>
                <p className="text-2xl font-semibold">
                  {question.stats?.averageScore ? question.stats.averageScore.toFixed(1) : "N/A"}
                </p>
              </div>
              <div className="p-3 bg-muted rounded-md">
                <h4 className="text-sm font-medium text-muted-foreground">Grading %</h4>
                <p className="text-2xl font-semibold">
                  {question.stats?.gradingPercentage
                    ? `${question.stats.gradingPercentage.toFixed(0)}%`
                    : "N/A"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {question.responses && question.responses.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Student Responses</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {question.responses.map((response) => (
                <div key={response.id} className="border rounded-md p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h4 className="font-medium">Student Response</h4>
                      <p className="text-xs text-muted-foreground">
                        ID: {response.id} • Recorded on{" "}
                        {new Date(response.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <Badge>
                      {response.StudentResponseScore &&
                      response.StudentResponseScore.length > 0
                        ? "Graded"
                        : "Pending"}
                    </Badge>
                  </div>

                  <div className="mb-4">
                    <h5 className="text-sm font-medium text-muted-foreground mb-2">
                      Student Audio Response
                    </h5>
                    <audio
                      controls
                      src={response.audioResponse}
                      className="w-full"
                    />
                  </div>

                  {response.StudentResponseScore &&
                    response.StudentResponseScore.length > 0 && (
                      <div className="bg-muted p-3 rounded-md">
                        <h5 className="text-sm font-medium mb-2">
                          Evaluation
                        </h5>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm text-muted-foreground">
                              Score
                            </p>
                            <p className="text-xl font-semibold">
                              {
                                response.StudentResponseScore[0].score
                              }
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">
                              Feedback
                            </p>
                            <p>
                              {response.StudentResponseScore[0].feedback ||
                                "No feedback provided"}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
} 