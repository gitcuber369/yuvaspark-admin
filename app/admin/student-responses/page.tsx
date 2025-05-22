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
  createdAt: string;
  student: {
    id: string;
    name: string;
  };
  question: {
    id: string;
    text: string;
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

const formatDate = (dateString: string | null | undefined): string => {
  if (!dateString) return "-";
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "-";
    return format(date, "MMM d, yyyy");
  } catch (error) {
    console.error("Error formatting date:", error);
    return "-";
  }
};

export default function StudentResponsesPage() {
  const { 
    responses, 
    loading, 
    fetchResponses, 
    fetchByStudent,
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
  const [students, setStudents] = useState<Student[]>([]);
  const [deletingResponseId, setDeletingResponseId] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);
  const [loadingStudents, setLoadingStudents] = useState(false);

  // Fetch initial data
  useEffect(() => {
    fetchResponses();
    fetchStudents();
  }, [fetchResponses]);

  // Fetch students for the filter dropdown
  const fetchStudents = async () => {
    setLoadingStudents(true);
    try {
      const response = await fetch("https://api.dreamlaunch.studio/api/students");
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
      default:
        fetchScoredResponses();
    }
  }, [activeTab, studentFilter, fetchResponses, fetchScoredResponses, fetchByStudent]);

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
    fetchScoredResponses();
  };

  const filteredResponses = responses.filter((response) => {
    const matchesSearch = 
      response.student?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      response.question?.text?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      response.response.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCorrectFilter = 
      correctFilter === "all" ||
      (correctFilter === "correct" && response.isCorrect) ||
      (correctFilter === "incorrect" && !response.isCorrect);

    return matchesSearch && matchesCorrectFilter;
  });

  return (
    <div className="container mx-auto py-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <GraduationCap className="h-5 w-5" />
              <span>Student Responses</span>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleExport}
                disabled={exporting}
              >
                {exporting ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <FileDown className="mr-2 h-4 w-4" />
                )}
                Export
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4 flex flex-wrap gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search responses..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-sm"
              />
            </div>
            <div className="flex items-center gap-2">
              <DatePicker
                date={startDate}
                setDate={setStartDate}
              />
              <DatePicker
                date={endDate}
                setDate={setEndDate}
              />
              <Select
                value={correctFilter}
                onValueChange={setCorrectFilter}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by correctness" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Responses</SelectItem>
                  <SelectItem value="correct">Correct Only</SelectItem>
                  <SelectItem value="incorrect">Incorrect Only</SelectItem>
                </SelectContent>
              </Select>
              <Button
                variant="outline"
                size="sm"
                onClick={resetFilters}
              >
                <FilterX className="mr-2 h-4 w-4" />
                Reset Filters
              </Button>
            </div>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="all">All Responses</TabsTrigger>
              <TabsTrigger value="scored">Scored Responses</TabsTrigger>
              <TabsTrigger value="by-student">By Student</TabsTrigger>
            </TabsList>

            <TabsContent value="by-student" className="mt-4">
              <Select
                value={studentFilter}
                onValueChange={setStudentFilter}
              >
                <SelectTrigger className="w-[300px]">
                  <SelectValue placeholder="Select a student" />
                </SelectTrigger>
                <SelectContent>
                  {loadingStudents ? (
                    <div className="p-2 text-sm text-gray-500">Loading students...</div>
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
            </TabsContent>
          </Tabs>

          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : filteredResponses.length === 0 ? (
            <div className="py-8 text-center text-gray-500">
              No responses found matching your criteria
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Question</TableHead>
                  <TableHead>Response</TableHead>
                  <TableHead>Correct</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Score</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredResponses.map((response) => (
                  <TableRow key={response.id}>
                    <TableCell>{response.student?.name || "Unknown"}</TableCell>
                    <TableCell>{response.question?.text || "Unknown"}</TableCell>
                    <TableCell>
                      {response.audioUrl ? (
                        <audio controls className="w-full">
                          <source src={response.audioUrl} type="audio/mpeg" />
                        </audio>
                      ) : (
                        response.response
                      )}
                    </TableCell>
                    <TableCell>
                      {response.isCorrect ? (
                        <CheckCircle2 className="h-5 w-5 text-green-500" />
                      ) : (
                        <XCircle className="h-5 w-5 text-red-500" />
                      )}
                    </TableCell>
                    <TableCell>
                      {formatDate(response.createdAt)}
                    </TableCell>
                    <TableCell>
                      {response.StudentResponseScore?.[0]?.score || "-"}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
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
          )}
        </CardContent>
      </Card>
    </div>
  );
} 