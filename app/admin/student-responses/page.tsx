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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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
    anganwadi?: {
      id: string;
      name: string;
    };
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
  anganwadi?: {
    id: string;
    name: string;
  };
}

interface Anganwadi {
  id: string;
  name: string;
  location?: string;
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
    exportResponses,
  } = useStudentResponseStore();

  const [activeTab, setActiveTab] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const [correctFilter, setCorrectFilter] = useState<string>("all");
  const [studentFilter, setStudentFilter] = useState<string>("");
  const [anganwadiFilter, setAnganwadiFilter] = useState<string>("all");
  const [students, setStudents] = useState<Student[]>([]);
  const [anganwadis, setAnganwadis] = useState<Anganwadi[]>([]);
  const [deletingResponseId, setDeletingResponseId] = useState<string | null>(
    null
  );
  const [exporting, setExporting] = useState(false);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [loadingAnganwadis, setLoadingAnganwadis] = useState(false);

  // Fetch initial data
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        await fetchResponses();
        await Promise.all([fetchStudents(), fetchAnganwadis()]);
      } catch (error) {
        console.error("Error fetching initial data:", error);
        toast.error("Failed to load initial data");
      }
    };
    fetchInitialData();
  }, [fetchResponses]);

  // Handle tab changes
  useEffect(() => {
    const fetchData = async () => {
      try {
        switch (activeTab) {
          case "all":
          case "scored":
            // Apply filters if they exist
            const filters: any = {
              ...(startDate && { startDate: format(startDate, "yyyy-MM-dd") }),
              ...(endDate && { endDate: format(endDate, "yyyy-MM-dd") }),
              ...(anganwadiFilter !== "all" && { anganwadiId: anganwadiFilter })
            };
            await fetchScoredResponses(Object.keys(filters).length > 0 ? filters : undefined);
            break;
          case "by-student":
            if (studentFilter) {
              await fetchByStudent(studentFilter);
            }
            break;
          default:
            await fetchScoredResponses();
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error("Failed to load responses");
      }
    };
    fetchData();
  }, [activeTab, studentFilter, startDate, endDate, anganwadiFilter, fetchScoredResponses, fetchByStudent]);

  // Fetch students for the filter dropdown
  const fetchStudents = async () => {
    setLoadingStudents(true);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "https://api.dreamlaunch.studio/api"}/students`
      );
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

  // Fetch anganwadis for the filter dropdown
  const fetchAnganwadis = async () => {
    setLoadingAnganwadis(true);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "https://api.dreamlaunch.studio/api"}/anganwadis`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch anganwadis");
      }
      const data = await response.json();
      setAnganwadis(data);
    } catch (error) {
      console.error("Error fetching anganwadis:", error);
      toast.error("Failed to load anganwadis");
    } finally {
      setLoadingAnganwadis(false);
    }
  };

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
          filters.startDate = format(startDate, "yyyy-MM-dd");
        }

        if (endDate) {
          filters.endDate = format(endDate, "yyyy-MM-dd");
        }
      }

      const downloadUrl = await exportResponses(filters);

      // Create a temporary link and trigger download
      const a = document.createElement("a");
      a.href = downloadUrl;
      a.download = `student-responses-${format(new Date(), "yyyy-MM-dd")}.csv`;
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
    setAnganwadiFilter("all");
    fetchScoredResponses();
  };

  const filteredResponses = (responses as Array<StudentResponse>).filter(
    (response: StudentResponse) => {
      const searchTermMatch = searchTerm.toLowerCase();
      const matchesSearch = !searchTerm || [
        response.student?.name,
        response.question?.text,
        response.response,
        response.student?.anganwadi?.name
      ].some(field => field?.toLowerCase().includes(searchTermMatch));

      const matchesCorrectFilter =
        correctFilter === "all" ||
        (correctFilter === "correct" && response.isCorrect) ||
        (correctFilter === "incorrect" && !response.isCorrect);

      return matchesSearch && matchesCorrectFilter;
    }
  );

  return (
    <div className="container mx-auto py-6 px-4 sm:px-6">
      <Card className="overflow-hidden">
        <CardHeader>
          <CardTitle className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
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
          <div className="mb-6 space-y-4">
            {/* Search Bar and Export */}
            <div className="flex flex-col sm:flex-row justify-between gap-4">
              <div className="relative w-full sm:w-[300px]">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                <Input
                  placeholder="Search responses..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
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

            {/* Filters */}
            <div className="flex flex-wrap gap-2">
              <DatePicker date={startDate} setDate={setStartDate} />
              <DatePicker date={endDate} setDate={setEndDate} />
              <Select value={correctFilter} onValueChange={setCorrectFilter}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Correctness" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Responses</SelectItem>
                  <SelectItem value="correct">Correct Only</SelectItem>
                  <SelectItem value="incorrect">Incorrect Only</SelectItem>
                </SelectContent>
              </Select>
              <Select
                value={anganwadiFilter}
                onValueChange={setAnganwadiFilter}
              >
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="Anganwadi" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Anganwadis</SelectItem>
                  {loadingAnganwadis ? (
                    <div className="p-2 text-sm text-gray-500">
                      Loading anganwadis...
                    </div>
                  ) : anganwadis.length === 0 ? (
                    <div className="p-2 text-sm text-gray-500">
                      No anganwadis found
                    </div>
                  ) : (
                    anganwadis.map((anganwadi) => (
                      <SelectItem key={anganwadi.id} value={anganwadi.id}>
                        {anganwadi.name}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              <Button
                variant="outline"
                size="sm"
                onClick={resetFilters}
                className="shrink-0"
              >
                <FilterX className="mr-2 h-4 w-4" />
                Reset
              </Button>
            </div>
          </div>

          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <TabsList className="w-full sm:w-auto">
              <TabsTrigger value="all" className="flex-1 sm:flex-none">
                All Responses
              </TabsTrigger>
              <TabsTrigger value="scored" className="flex-1 sm:flex-none">
                Scored Responses
              </TabsTrigger>
              <TabsTrigger value="by-student" className="flex-1 sm:flex-none">
                By Student
              </TabsTrigger>
            </TabsList>

            <TabsContent value="by-student" className="mt-4">
              <Select value={studentFilter} onValueChange={setStudentFilter}>
                <SelectTrigger className="w-full sm:w-[300px]">
                  <SelectValue placeholder="Select a student" />
                </SelectTrigger>
                <SelectContent>
                  {loadingStudents ? (
                    <div className="p-2 text-sm text-gray-500">
                      Loading students...
                    </div>
                  ) : students.length === 0 ? (
                    <div className="p-2 text-sm text-gray-500">
                      No students found
                    </div>
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
              <div className="flex flex-col items-center gap-2">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-sm text-muted-foreground">Loading responses...</p>
              </div>
            </div>
          ) : filteredResponses.length === 0 ? (
            <div className="py-8 text-center text-gray-500">
              <div className="flex flex-col items-center gap-2">
                <p>No responses found matching your criteria</p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={resetFilters}
                  className="mt-2"
                >
                  <FilterX className="mr-2 h-4 w-4" />
                  Reset Filters
                </Button>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto -mx-6 px-6">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="whitespace-nowrap">Student</TableHead>
                    <TableHead className="whitespace-nowrap">
                      Question
                    </TableHead>
                    <TableHead className="whitespace-nowrap">
                      Response
                    </TableHead>
                    <TableHead className="whitespace-nowrap">Correct</TableHead>
                    <TableHead className="whitespace-nowrap">Date</TableHead>
                    <TableHead className="whitespace-nowrap">Score</TableHead>
                    <TableHead className="whitespace-nowrap">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredResponses.map((response) => (
                    <TableRow key={response.id}>
                      <TableCell className="whitespace-nowrap">
                        {response.student?.name || "Unknown"}
                      </TableCell>
                      <TableCell className="max-w-[200px] truncate">
                        {response.question?.text || "Unknown"}
                      </TableCell>
                      <TableCell>
                        {response.audioUrl ? (
                          <audio controls className="w-full max-w-[200px]">
                            <source src={response.audioUrl} type="audio/mpeg" />
                          </audio>
                        ) : (
                          <span className="max-w-[200px] block truncate">
                            {response.response}
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        {response.isCorrect ? (
                          <CheckCircle2 className="h-5 w-5 text-green-500" />
                        ) : (
                          <XCircle className="h-5 w-5 text-red-500" />
                        )}
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        {formatDate(response.createdAt)}
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        {response.StudentResponseScore?.[0]?.score || "-"}
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
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
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
