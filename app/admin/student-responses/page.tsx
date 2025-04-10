"use client";

import { useEffect, useState } from "react";
import { useStudentResponseStore } from "@/app/store/studentResponseStore";
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
import { toast } from "sonner";
import {
  Loader2,
  Search,
  FileDown,
  Trash2,
  CheckCircle2,
  XCircle,
  FilterX,
  CheckSquare,
  GraduationCap,
  ScrollText,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DatePicker } from "@/components/ui/date-picker";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { format } from "date-fns";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";

interface StudentResponse {
  id: string;
  studentId: string;
  questionId: string;
  response: string;
  isCorrect: boolean;
  evaluationId: string;
  createdAt: string;
  student: {
    id: string;
    name: string;
  };
  question: {
    id: string;
    text: string;
  };
  evaluation?: {
    id: string;
    title: string;
  };
  StudentResponseScore?: {
    id: string;
    score: number;
    feedback: string;
    gradedAt: string;
  }[];
  audioUrl?: string;
}

interface Student {
  id: string;
  name: string;
}

interface Evaluation {
  id: string;
  title: string;
}

export default function StudentResponsesPage() {
  const { 
    responses, 
    loading, 
    fetchResponses, 
    fetchByStudent,
    fetchByEvaluation,
    fetchScoredResponses,
    deleteResponse, 
    exportResponses 
  } = useStudentResponseStore();

  const [activeTab, setActiveTab] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const [correctFilter, setCorrectFilter] = useState<string>("all");
  const [studentFilter, setStudentFilter] = useState<string>("");
  const [evaluationFilter, setEvaluationFilter] = useState<string>("");
  const [students, setStudents] = useState<Student[]>([]);
  const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
  const [deletingResponseId, setDeletingResponseId] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [loadingEvaluations, setLoadingEvaluations] = useState(false);

  // Fetch initial data
  useEffect(() => {
    fetchResponses();
    fetchStudents();
    fetchEvaluations();
  }, [fetchResponses]);

  // Fetch students for the filter dropdown
  const fetchStudents = async () => {
    setLoadingStudents(true);
    try {
      const response = await fetch("http://localhost:3000/api/students");
      if (!response.ok) {
        throw new Error("Failed to fetch students");
      }
      const data = await response.json();
      setStudents(data);
    } catch (error) {
      console.error("Error fetching students:", error);
      toast.error("Failed to load students");
    } finally {
      setLoadingStudents(false);
    }
  };

  // Fetch evaluations for the filter dropdown
  const fetchEvaluations = async () => {
    setLoadingEvaluations(true);
    try {
      const response = await fetch("http://localhost:3000/api/evaluations");
      if (!response.ok) {
        throw new Error("Failed to fetch evaluations");
      }
      const data = await response.json();
      setEvaluations(data);
    } catch (error) {
      console.error("Error fetching evaluations:", error);
      toast.error("Failed to load evaluations");
    } finally {
      setLoadingEvaluations(false);
    }
  };

  // Handle tab changes
  useEffect(() => {
    switch (activeTab) {
      case "all":
        fetchScoredResponses();
        break;
      case "scored":
        fetchScoredResponses();
        break;
      case "by-student":
        if (studentFilter) {
          fetchByStudent(studentFilter);
        }
        break;
      case "by-evaluation":
        if (evaluationFilter) {
          fetchByEvaluation(evaluationFilter);
        }
        break;
      default:
        fetchScoredResponses();
    }
  }, [activeTab, studentFilter, evaluationFilter, fetchResponses, fetchScoredResponses, fetchByStudent, fetchByEvaluation]);

  // Apply date filters
  useEffect(() => {
    if (activeTab === "all" && (startDate || endDate)) {
      const filters: any = {};
      
      if (startDate) {
        filters.startDate = format(startDate, 'yyyy-MM-dd');
      }
      
      if (endDate) {
        filters.endDate = format(endDate, 'yyyy-MM-dd');
      }
      
      fetchScoredResponses(filters);
    }
  }, [fetchScoredResponses, startDate, endDate, activeTab]);

  const handleDelete = async (id: string) => {
    setDeletingResponseId(id);
    try {
      await deleteResponse(id);
      toast.success("Response deleted successfully!");
    } catch (err) {
      toast.error("Failed to delete response");
    } finally {
      setDeletingResponseId(null);
    }
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      const filters: any = {};
      
      if (activeTab === "by-student" && studentFilter) {
        filters.studentId = studentFilter;
      } else if (activeTab === "by-evaluation" && evaluationFilter) {
        filters.evaluationId = evaluationFilter;
      } else {
        // For the "all" or "scored" tabs, use date filters
        if (startDate) {
          filters.startDate = format(startDate, 'yyyy-MM-dd');
        }
        
        if (endDate) {
          filters.endDate = format(endDate, 'yyyy-MM-dd');
        }
      }
      
      const downloadUrl = await exportResponses(filters);
      
      // Create a temporary link and trigger download
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = `student-responses-${format(new Date(), 'yyyy-MM-dd')}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(downloadUrl);
      document.body.removeChild(a);
      
      toast.success("Export successful!");
    } catch (err) {
      toast.error("Failed to export responses");
    } finally {
      setExporting(false);
    }
  };

  const resetFilters = () => {
    setStartDate(undefined);
    setEndDate(undefined);
    setCorrectFilter("all");
    setSearchTerm("");
    setStudentFilter("");
    setEvaluationFilter("");
    setActiveTab("all");
    fetchResponses();
  };

  // Handle search filtering with debounce
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  const filteredResponses = responses.filter((response: StudentResponse) => {
    const search = debouncedSearchTerm.toLowerCase();
    const matchesSearch = 
      (response.student?.name?.toLowerCase() || '').includes(search) ||
      (response.question?.text?.toLowerCase() || '').includes(search) ||
      (response.response?.toLowerCase() || '').includes(search) ||
      (response.evaluation?.title?.toLowerCase() || '').includes(search);
    
    if (correctFilter === "correct") {
      return matchesSearch && response.isCorrect === true;
    } else if (correctFilter === "incorrect") {
      return matchesSearch && response.isCorrect === false;
    }
    
    return matchesSearch;
  });

  return (
    <div className="container mx-auto py-8 px-4">
      <Card className="border border-gray-100 shadow-sm rounded-lg overflow-hidden">
        <CardHeader className="border-b border-gray-100 pb-4 bg-white">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
            <CardTitle className="text-xl font-medium text-gray-800">
              Student Responses
            </CardTitle>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                className="flex items-center gap-1 h-9"
                onClick={resetFilters}
              >
                <FilterX className="h-3.5 w-3.5" /> Reset Filters
              </Button>
              <Button
                variant="default"
                size="sm"
                className="flex items-center gap-1 h-9 bg-gray-800 hover:bg-gray-700 text-white"
                onClick={handleExport}
                disabled={exporting}
              >
                {exporting ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <FileDown className="h-3.5 w-3.5" />
                )}
                Export
              </Button>
            </div>
          </div>

          <Tabs 
            className="mt-4" 
            value={activeTab} 
            onValueChange={setActiveTab}
          >
            <TabsList className="w-full grid grid-cols-4">
              <TabsTrigger value="all">Recent Responses</TabsTrigger>
              <TabsTrigger value="scored">Scored Responses</TabsTrigger>
              <TabsTrigger value="by-student">By Student</TabsTrigger>
              <TabsTrigger value="by-evaluation">By Evaluation</TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="mt-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-4 w-4 text-gray-400" />
                  </div>
                  <Input
                    placeholder="Search by student, question or response"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 w-full border-gray-200 focus:border-gray-300"
                  />
                </div>
                <div>
                  <DatePicker
                    date={startDate}
                    setDate={setStartDate}
                    className="w-full border-gray-200"
                  />
                </div>
                <div>
                  <DatePicker
                    date={endDate}
                    setDate={setEndDate}
                    className="w-full border-gray-200"
                  />
                </div>
                <div>
                  <Select
                    value={correctFilter}
                    onValueChange={setCorrectFilter}
                  >
                    <SelectTrigger className="w-full border-gray-200 focus:border-gray-300">
                      <SelectValue placeholder="Filter by correctness" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All responses</SelectItem>
                      <SelectItem value="correct">Correct only</SelectItem>
                      <SelectItem value="incorrect">Incorrect only</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="scored" className="mt-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-4 w-4 text-gray-400" />
                  </div>
                  <Input
                    placeholder="Search scored responses"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 w-full border-gray-200 focus:border-gray-300"
                  />
                </div>
                <div>
                  <Select
                    value={correctFilter}
                    onValueChange={setCorrectFilter}
                  >
                    <SelectTrigger className="w-full border-gray-200 focus:border-gray-300">
                      <SelectValue placeholder="Filter by correctness" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All responses</SelectItem>
                      <SelectItem value="correct">Correct only</SelectItem>
                      <SelectItem value="incorrect">Incorrect only</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="by-student" className="mt-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Select
                    value={studentFilter}
                    onValueChange={setStudentFilter}
                  >
                    <SelectTrigger className="w-full border-gray-200 focus:border-gray-300">
                      <SelectValue placeholder="Select a student" />
                    </SelectTrigger>
                    <SelectContent>
                      {loadingStudents ? (
                        <div className="flex justify-center p-2">
                          <Loader2 className="h-4 w-4 animate-spin" />
                        </div>
                      ) : students.length === 0 ? (
                        <div className="p-2 text-sm text-gray-500">No students found</div>
                      ) : (
                        students.map((student) => (
                          <SelectItem key={student.id} value={student.id}>
                            {student.name}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-4 w-4 text-gray-400" />
                  </div>
                  <Input
                    placeholder="Search in student responses"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 w-full border-gray-200 focus:border-gray-300"
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="by-evaluation" className="mt-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Select
                    value={evaluationFilter}
                    onValueChange={setEvaluationFilter}
                  >
                    <SelectTrigger className="w-full border-gray-200 focus:border-gray-300">
                      <SelectValue placeholder="Select an evaluation" />
                    </SelectTrigger>
                    <SelectContent>
                      {loadingEvaluations ? (
                        <div className="flex justify-center p-2">
                          <Loader2 className="h-4 w-4 animate-spin" />
                        </div>
                      ) : evaluations.length === 0 ? (
                        <div className="p-2 text-sm text-gray-500">No evaluations found</div>
                      ) : (
                        evaluations.map((evaluation) => (
                          <SelectItem key={evaluation.id} value={evaluation.id}>
                            {evaluation.title}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-4 w-4 text-gray-400" />
                  </div>
                  <Input
                    placeholder="Search in evaluation responses"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 w-full border-gray-200 focus:border-gray-300"
                  />
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardHeader>

        <CardContent className="p-0">
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
            </div>
          ) : filteredResponses.length === 0 ? (
            <div className="py-12 text-center text-gray-500">
              {activeTab === "by-student" && !studentFilter ? (
                "Please select a student to view their responses"
              ) : activeTab === "by-evaluation" && !evaluationFilter ? (
                "Please select an evaluation to view responses"
              ) : debouncedSearchTerm || startDate || endDate || (correctFilter !== "all") || studentFilter || evaluationFilter ? (
                "No responses matching your filters"
              ) : (
                "No responses found"
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50">
                    <TableHead className="font-medium">Student</TableHead>
                    {(activeTab === "all" || activeTab === "scored" || activeTab === "by-student") && (
                      <TableHead className="font-medium">Evaluation</TableHead>
                    )}
                    <TableHead className="font-medium">Question</TableHead>
                    <TableHead className="font-medium">Response</TableHead>
                    {activeTab === "scored" && (
                      <TableHead className="font-medium">Score</TableHead>
                    )}
                    <TableHead className="font-medium">Correct</TableHead>
                    <TableHead className="font-medium">Date</TableHead>
                    <TableHead className="font-medium w-20">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredResponses.map((response: StudentResponse) => (
                    <TableRow
                      key={response.id}
                      className="hover:bg-gray-50 border-t border-gray-100"
                    >
                      <TableCell className="py-3">
                        <div className="font-medium text-gray-900 flex items-center gap-2">
                          <GraduationCap className="h-4 w-4 text-gray-500" />
                          {response.student?.name || 'Unknown Student'}
                        </div>
                      </TableCell>
                      {(activeTab === "all" || activeTab === "scored" || activeTab === "by-student") && (
                        <TableCell className="py-3">
                          <div className="text-gray-600 max-w-xs truncate flex items-center gap-2">
                            <ScrollText className="h-4 w-4 text-gray-500" />
                            {response.evaluation?.title || 'Unknown Evaluation'}
                          </div>
                        </TableCell>
                      )}
                      <TableCell className="py-3">
                        <div className="text-gray-600 max-w-xs truncate">
                          {response.question?.text || 'Unknown Question'}
                        </div>
                      </TableCell>
                      <TableCell className="py-3">
                        <div className="text-gray-600 max-w-xs truncate">
                          {response.response || 'No response'}
                          {response.audioUrl && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 ml-2"
                              onClick={() => window.open(response.audioUrl, '_blank')}
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-500">
                                <path d="M12 6v12M6 12h12" />
                              </svg>
                            </Button>
                          )}
                        </div>
                      </TableCell>
                      {activeTab === "scored" && (
                        <TableCell className="py-3">
                          {response.StudentResponseScore && response.StudentResponseScore.length > 0 ? (
                            <div className="font-medium">
                              {response.StudentResponseScore[0].score}%
                            </div>
                          ) : (
                            <div className="text-gray-500">Not scored</div>
                          )}
                        </TableCell>
                      )}
                      <TableCell className="py-3">
                        {response.isCorrect === true ? (
                          <div className="flex items-center">
                            <CheckCircle2 className="h-5 w-5 text-green-500 mr-1" />
                            <span className="text-green-600">Correct</span>
                          </div>
                        ) : response.isCorrect === false ? (
                          <div className="flex items-center">
                            <XCircle className="h-5 w-5 text-red-500 mr-1" />
                            <span className="text-red-600">Incorrect</span>
                          </div>
                        ) : (
                          <div className="text-gray-500">Unknown</div>
                        )}
                      </TableCell>
                      <TableCell className="py-3 text-gray-600">
                        {response.createdAt ? new Date(response.createdAt).toLocaleDateString() : 'No date'}
                      </TableCell>
                      <TableCell className="py-3">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50"
                          onClick={() => handleDelete(response.id)}
                          disabled={deletingResponseId === response.id}
                        >
                          {deletingResponseId === response.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
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
  );
} 