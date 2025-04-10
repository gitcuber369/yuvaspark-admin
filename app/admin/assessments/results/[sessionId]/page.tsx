"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  ArrowLeft,
  CheckCircle,
  Clock,
  Edit,
  ExternalLink,
  FileText,
  Filter,
  ListChecks,
  Loader2,
  School,
  Search,
  Star,
  User,
  Users,
} from "lucide-react";
import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api/";

// API functions
const getAssessmentSessionById = async (id: string) => {
  const res = await axios.get(`${API_URL}assessment-sessions/${id}`);
  return res.data;
};

const getAnganwadis = async () => {
  const res = await axios.get(`${API_URL}anganwadis`);
  return res.data;
};

const getEvaluationsBySession = async (sessionId: string) => {
  const res = await axios.get(`${API_URL}evaluations/session/${sessionId}`);
  return res.data;
};

const getEvaluationDetails = async (evaluationId: string) => {
  const res = await axios.get(`${API_URL}evaluations/${evaluationId}`);
  return res.data;
};

const getResponsesByEvaluation = async (evaluationId: string) => {
  const res = await axios.get(`${API_URL}student-responses/evaluation/${evaluationId}`);
  return res.data;
};

const gradeStudentResponse = async (responseId: string, score: number) => {
  const res = await axios.post(`${API_URL}evaluations/response/${responseId}/grade`, { score });
  return res.data;
};

const completeEvaluationGrading = async (evaluationId: string) => {
  const res = await axios.put(`${API_URL}evaluations/${evaluationId}/complete-grading`);
  return res.data;
};

interface Anganwadi {
  id: string;
  name: string;
  location?: string;
  district?: string;
  state?: string;
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
  status: string;
  submittedAt: string | null;
  gradingComplete: boolean;
}

interface StudentResponse {
  id: string;
  questionId: string;
  question: {
    id: string;
    text: string;
  };
  audioUrl: string;
  StudentResponseScore: Array<{
    id: string;
    score: number;
  }>;
}

export default function AssessmentResultsPage() {
  const params = useParams();
  const router = useRouter();
  const sessionId = params.sessionId as string;
  
  const [loading, setLoading] = useState(true);
  const [assessmentSession, setAssessmentSession] = useState<any>(null);
  const [anganwadis, setAnganwadis] = useState<Anganwadi[]>([]);
  const [evaluationsByAnganwadi, setEvaluationsByAnganwadi] = useState<{[key: string]: Evaluation[]}>({});
  const [selectedEvaluation, setSelectedEvaluation] = useState<Evaluation | null>(null);
  const [studentResponses, setStudentResponses] = useState<StudentResponse[]>([]);
  const [scores, setScores] = useState<{[key: string]: number}>({});
  const [gradingLoading, setGradingLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Get session details, anganwadis, and evaluations
        const [sessionData, anganwadisData, evaluationsData] = await Promise.all([
          getAssessmentSessionById(sessionId),
          getAnganwadis(),
          getEvaluationsBySession(sessionId)
        ]);
        
        setAssessmentSession(sessionData);
        setAnganwadis(anganwadisData);
        
        // Group evaluations by anganwadi ID
        const groupedEvaluations: {[key: string]: Evaluation[]} = {};
        
        evaluationsData.forEach((evaluation: Evaluation) => {
          const anganwadiId = evaluation.student?.anganwadiId || "unknown";
          
          if (!groupedEvaluations[anganwadiId]) {
            groupedEvaluations[anganwadiId] = [];
          }
          
          groupedEvaluations[anganwadiId].push(evaluation);
        });
        
        setEvaluationsByAnganwadi(groupedEvaluations);
      } catch (error) {
        console.error("Failed to load data:", error);
        toast.error("Failed to load assessment data");
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [sessionId]);
  
  const handleViewEvaluation = async (evaluation: Evaluation) => {
    try {
      setSelectedEvaluation(evaluation);
      
      // Fetch student responses for this evaluation
      const responses = await getResponsesByEvaluation(evaluation.id);
      setStudentResponses(responses);
      
      // Initialize scores from existing ones
      const initialScores: {[key: string]: number} = {};
      responses.forEach((response: StudentResponse) => {
        if (response.StudentResponseScore && response.StudentResponseScore.length > 0) {
          initialScores[response.id] = response.StudentResponseScore[0].score;
        } else {
          initialScores[response.id] = 0; // Default score
        }
      });
      
      setScores(initialScores);
      
    } catch (error) {
      console.error("Failed to load evaluation details:", error);
      toast.error("Failed to load evaluation details");
    }
  };
  
  const handleScoreChange = (responseId: string, value: string) => {
    const numValue = parseFloat(value);
    if (!isNaN(numValue) && numValue >= 0 && numValue <= 5) {
      setScores({ ...scores, [responseId]: numValue });
    }
  };
  
  const handleGradeResponse = async (responseId: string) => {
    if (!scores[responseId] && scores[responseId] !== 0) return;
    
    try {
      setGradingLoading(true);
      await gradeStudentResponse(responseId, scores[responseId]);
      toast.success("Response graded successfully");
      
      // Update the StudentResponseScore in the UI
      setStudentResponses(prev => 
        prev.map(response => {
          if (response.id === responseId) {
            return {
              ...response,
              StudentResponseScore: [
                { id: "temp-id", score: scores[responseId] }
              ]
            };
          }
          return response;
        })
      );
      
    } catch (error) {
      console.error("Failed to grade response:", error);
      toast.error("Failed to grade response");
    } finally {
      setGradingLoading(false);
    }
  };
  
  const handleCompleteGrading = async () => {
    if (!selectedEvaluation) return;
    
    try {
      setGradingLoading(true);
      await completeEvaluationGrading(selectedEvaluation.id);
      toast.success("Evaluation grading completed");
      
      // Update the selectedEvaluation in the UI
      setSelectedEvaluation(prev => {
        if (!prev) return null;
        return {
          ...prev,
          status: "GRADED",
          gradingComplete: true
        };
      });
      
      // Also update the evaluation in the list
      setEvaluationsByAnganwadi(prev => {
        const updated = { ...prev };
        
        Object.keys(updated).forEach(anganwadiId => {
          updated[anganwadiId] = updated[anganwadiId].map(ev => {
            if (ev.id === selectedEvaluation.id) {
              return {
                ...ev,
                status: "GRADED",
                gradingComplete: true
              };
            }
            return ev;
          });
        });
        
        return updated;
      });
      
    } catch (error) {
      console.error("Failed to complete grading:", error);
      toast.error("Failed to complete grading");
    } finally {
      setGradingLoading(false);
    }
  };
  
  const getSubmissionStatus = (anganwadiId: string) => {
    const evaluations = evaluationsByAnganwadi[anganwadiId] || [];
    
    if (evaluations.length === 0) {
      return <Badge variant="outline">No Submissions</Badge>;
    }
    
    const allGraded = evaluations.every(ev => ev.status === "GRADED");
    const allSubmitted = evaluations.every(ev => ev.status === "SUBMITTED" || ev.status === "GRADED");
    
    if (allGraded) {
      return <Badge className="bg-green-100 text-green-800">All Graded</Badge>;
    } else if (allSubmitted) {
      return <Badge className="bg-blue-100 text-blue-800">Submitted</Badge>;
    } else {
      return <Badge className="bg-yellow-100 text-yellow-800">Partial</Badge>;
    }
  };
  
  const getEvaluationStatusBadge = (status: string) => {
    switch (status) {
      case "DRAFT":
        return <Badge variant="outline">Draft</Badge>;
      case "SUBMITTED":
        return <Badge className="bg-blue-100 text-blue-800">Submitted</Badge>;
      case "GRADED":
        return <Badge className="bg-green-100 text-green-800">Graded</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };
  
  const filteredAnganwadis = anganwadis.filter(
    anganwadi => 
      anganwadi.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (anganwadi.location && anganwadi.location.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (anganwadi.district && anganwadi.district.toLowerCase().includes(searchQuery.toLowerCase()))
  );
  
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin mr-2" />
        <span>Loading assessment results...</span>
      </div>
    );
  }
  
  if (!assessmentSession) {
    return (
      <div className="container mx-auto py-8 text-center">
        <h1 className="text-2xl font-bold mb-4">Assessment Not Found</h1>
        <p className="text-gray-500 mb-4">The assessment session you're looking for doesn't exist or has been removed.</p>
        <Button onClick={() => router.push("/admin/assessments")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Assessments
        </Button>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center mb-6">
        <Button 
          variant="outline" 
          className="mr-4" 
          onClick={() => router.push("/admin/assessments")}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        
        <div>
          <h1 className="text-3xl font-bold">{assessmentSession.name} Results</h1>
          <p className="text-muted-foreground">
            View and grade submissions from anganwadis
          </p>
        </div>
      </div>
      
      {selectedEvaluation ? (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <Button 
              variant="outline" 
              onClick={() => setSelectedEvaluation(null)}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Anganwadis
            </Button>
            
            <div className="flex items-center space-x-2">
              {getEvaluationStatusBadge(selectedEvaluation.status)}
              
              {selectedEvaluation.status === "SUBMITTED" && (
                <Button 
                  onClick={handleCompleteGrading}
                  disabled={gradingLoading}
                >
                  {gradingLoading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <CheckCircle className="mr-2 h-4 w-4" />
                  )}
                  Complete Grading
                </Button>
              )}
            </div>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Student Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label className="text-xs text-muted-foreground">Student</Label>
                  <p className="font-medium flex items-center">
                    <User className="mr-2 h-4 w-4" />
                    {selectedEvaluation.student?.name || "Unknown"}
                  </p>
                </div>
                
                <div>
                  <Label className="text-xs text-muted-foreground">Teacher</Label>
                  <p className="font-medium flex items-center">
                    <Users className="mr-2 h-4 w-4" />
                    {selectedEvaluation.teacher?.name || "Unknown"}
                  </p>
                </div>
                
                <div>
                  <Label className="text-xs text-muted-foreground">Topic</Label>
                  <p className="font-medium flex items-center">
                    <FileText className="mr-2 h-4 w-4" />
                    {selectedEvaluation.topic?.name || "Unknown"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Student Responses</CardTitle>
              <CardDescription>
                Grade each response from the student
              </CardDescription>
            </CardHeader>
            <CardContent>
              {studentResponses.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500">No responses found for this evaluation</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Question</TableHead>
                      <TableHead>Audio Response</TableHead>
                      <TableHead>Score</TableHead>
                      <TableHead>Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {studentResponses.map((response) => (
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
                            "No audio available"
                          )}
                        </TableCell>
                        <TableCell>
                          {selectedEvaluation.status === "SUBMITTED" ? (
                            <div className="flex items-center space-x-2">
                              <Input
                                type="number"
                                min="0"
                                max="5"
                                step="0.5"
                                className="w-20"
                                value={scores[response.id] || 0}
                                onChange={(e) => handleScoreChange(response.id, e.target.value)}
                              />
                              <span className="text-sm">/5</span>
                            </div>
                          ) : (
                            <div className="flex items-center">
                              <span className="font-medium">
                                {response.StudentResponseScore && 
                                response.StudentResponseScore.length > 0
                                  ? response.StudentResponseScore[0].score
                                  : "Not graded"}
                              </span>
                              <span className="text-sm ml-1">/5</span>
                            </div>
                          )}
                        </TableCell>
                        <TableCell>
                          {selectedEvaluation.status === "SUBMITTED" ? (
                            <Button
                              size="sm"
                              onClick={() => handleGradeResponse(response.id)}
                              disabled={gradingLoading}
                            >
                              {gradingLoading ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Star className="h-4 w-4 mr-1" />
                              )}
                              Grade
                            </Button>
                          ) : (
                            <span className="text-sm text-muted-foreground">
                              {selectedEvaluation.status === "GRADED" 
                                ? "Graded" 
                                : "Cannot grade"}
                            </span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div className="relative w-full max-w-md">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                type="search"
                placeholder="Search anganwadis by name, location..."
                className="pl-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <Tabs 
              value={activeTab} 
              onValueChange={setActiveTab}
              className="w-auto"
            >
              <TabsList>
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="submitted">Submitted</TabsTrigger>
                <TabsTrigger value="graded">Graded</TabsTrigger>
                <TabsTrigger value="pending">Pending</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Anganwadi Submissions</CardTitle>
              <CardDescription>
                View and grade submissions from all anganwadis
              </CardDescription>
            </CardHeader>
            <CardContent>
              {filteredAnganwadis.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500">No anganwadis found with the current filters</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Anganwadi</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Submissions Status</TableHead>
                      <TableHead>Students</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredAnganwadis.map((anganwadi) => {
                      const evaluations = evaluationsByAnganwadi[anganwadi.id] || [];
                      
                      // Filter based on active tab
                      let showAnganwadi = true;
                      if (activeTab === "submitted") {
                        showAnganwadi = evaluations.some(ev => ev.status === "SUBMITTED" || ev.status === "GRADED");
                      } else if (activeTab === "graded") {
                        showAnganwadi = evaluations.some(ev => ev.status === "GRADED");
                      } else if (activeTab === "pending") {
                        showAnganwadi = evaluations.length === 0 || evaluations.some(ev => ev.status === "DRAFT");
                      }
                      
                      if (!showAnganwadi) return null;
                      
                      return (
                        <TableRow key={anganwadi.id}>
                          <TableCell className="font-medium">
                            <div className="flex items-center">
                              <School className="h-4 w-4 mr-2" />
                              {anganwadi.name}
                            </div>
                          </TableCell>
                          <TableCell>
                            {anganwadi.location || "Not specified"}
                            {anganwadi.district && `, ${anganwadi.district}`}
                          </TableCell>
                          <TableCell>
                            {getSubmissionStatus(anganwadi.id)}
                          </TableCell>
                          <TableCell>
                            {evaluations.length} students
                          </TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              {evaluations.length > 0 ? (
                                <Dialog>
                                  <DialogTrigger asChild>
                                    <Button variant="outline" size="sm">
                                      <ListChecks className="h-4 w-4 mr-1" />
                                      View
                                    </Button>
                                  </DialogTrigger>
                                  <DialogContent className="sm:max-w-md">
                                    <DialogHeader>
                                      <DialogTitle>{anganwadi.name} - Student Evaluations</DialogTitle>
                                      <DialogDescription>
                                        Select a student evaluation to view and grade their responses
                                      </DialogDescription>
                                    </DialogHeader>
                                    
                                    <div className="py-4">
                                      <Table>
                                        <TableHeader>
                                          <TableRow>
                                            <TableHead>Student</TableHead>
                                            <TableHead>Topic</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead>Action</TableHead>
                                          </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                          {evaluations.map((evaluation) => (
                                            <TableRow key={evaluation.id}>
                                              <TableCell>{evaluation.student?.name || "Unknown"}</TableCell>
                                              <TableCell>{evaluation.topic?.name || "Unknown"}</TableCell>
                                              <TableCell>{getEvaluationStatusBadge(evaluation.status)}</TableCell>
                                              <TableCell>
                                                <Button 
                                                  variant="outline"
                                                  size="sm"
                                                  onClick={() => {
                                                    handleViewEvaluation(evaluation);
                                                  }}
                                                >
                                                  <ExternalLink className="h-4 w-4 mr-1" />
                                                  Open
                                                </Button>
                                              </TableCell>
                                            </TableRow>
                                          ))}
                                        </TableBody>
                                      </Table>
                                    </div>
                                  </DialogContent>
                                </Dialog>
                              ) : (
                                <Button variant="outline" size="sm" disabled>
                                  <Clock className="h-4 w-4 mr-1" />
                                  No Data
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
} 