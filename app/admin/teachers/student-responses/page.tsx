"use client";

import { useEffect, useState } from "react";
import { useTeacherResponseStore } from "@/app/store/teacherResponseStore";
import { useTeacherStore } from "@/app/store/teacherStore";
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
  FilterX,
  GraduationCap,
  ScrollText,
  Play,
  ListFilter,
  UserCircle2
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import Image from "next/image";

export default function TeacherStudentResponsesPage() {
  const {
    responses,
    loading,
    fetchTeacherResponses,
    fetchByStudent,
    exportResponses,
  } = useTeacherResponseStore();
  
  const {
    teachers,
    loading: teachersLoading,
    fetchTeachers,
  } = useTeacherStore();

  const [searchTerm, setSearchTerm] = useState("");
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const [studentFilter, setStudentFilter] = useState<string>("");
  const [evaluationFilter, setEvaluationFilter] = useState<string>("");
  const [teacherFilter, setTeacherFilter] = useState<string>("");
  const [students, setStudents] = useState<any[]>([]);
  const [evaluations, setEvaluations] = useState<any[]>([]);
  const [exporting, setExporting] = useState(false);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [loadingEvaluations, setLoadingEvaluations] = useState(false);
  
  // For audio playback in modal
  const [audioModalOpen, setAudioModalOpen] = useState(false);
  const [selectedAudioUrl, setSelectedAudioUrl] = useState("");
  const [selectedResponseTitle, setSelectedResponseTitle] = useState("");

  // Fetch initial data
  useEffect(() => {
    fetchTeachers();
  }, [fetchTeachers]);
  
  // Handle teacher selection
  const handleTeacherFilterChange = async (selectedTeacherId: string) => {
    setTeacherFilter(selectedTeacherId === "all" ? "" : selectedTeacherId);
    setStudentFilter("");
    setEvaluationFilter("");
    
    if (selectedTeacherId && selectedTeacherId !== "all") {
      await fetchTeacherResponses(selectedTeacherId);
      fetchStudentsForTeacher(selectedTeacherId);
      fetchEvaluationsForTeacher(selectedTeacherId);
    } else {
      setStudents([]);
      setEvaluations([]);
    }
  };

  // Fetch students for the selected teacher
  const fetchStudentsForTeacher = async (teacherId: string) => {
    setLoadingStudents(true);
    try {
      const response = await fetch(`http://localhost:3000/api/teachers/${teacherId}/students`);
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

  // Fetch evaluations for the selected teacher
  const fetchEvaluationsForTeacher = async (teacherId: string) => {
    setLoadingEvaluations(true);
    try {
      const response = await fetch(`http://localhost:3000/api/teachers/${teacherId}/evaluations`);
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

  const handleStudentFilterChange = async (selectedStudentId: string) => {
    setStudentFilter(selectedStudentId === "all-students" ? "" : selectedStudentId);
    if (selectedStudentId && selectedStudentId !== "all-students" && teacherFilter) {
      await fetchByStudent(teacherFilter, selectedStudentId);
    } else if (teacherFilter) {
      await fetchTeacherResponses(teacherFilter);
    }
  };

  const handleEvaluationFilterChange = async (selectedEvaluationId: string) => {
    setEvaluationFilter(selectedEvaluationId === "all-evaluations" ? "" : selectedEvaluationId);
    
    if (teacherFilter) {
      // Use the main fetchTeacherResponses with filters instead of the missing method
      const filters: any = {};
      
      if (selectedEvaluationId && selectedEvaluationId !== "all-evaluations") {
        filters.evaluationId = selectedEvaluationId;
      }
      
      // Keep student filter if it exists
      if (studentFilter) {
        filters.studentId = studentFilter;
      }
      
      await fetchTeacherResponses(teacherFilter, filters);
    }
  };

  const handleExport = async () => {
    if (!teacherFilter) {
      toast.error("Please select a teacher first");
      return;
    }
    
    setExporting(true);
    try {
      const filters: any = {};
      
      if (studentFilter) {
        filters.studentId = studentFilter;
      }
      
      if (evaluationFilter) {
        filters.evaluationId = evaluationFilter;
      }
      
      if (startDate) {
        filters.startDate = format(startDate, 'yyyy-MM-dd');
      }
      
      if (endDate) {
        filters.endDate = format(endDate, 'yyyy-MM-dd');
      }
      
      const downloadUrl = await exportResponses(teacherFilter, filters);
      
      // Create a temporary link and trigger download
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = `teacher-responses-${format(new Date(), 'yyyy-MM-dd')}.csv`;
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
    setSearchTerm("");
    setStudentFilter("");
    setEvaluationFilter("");
    
    if (teacherFilter) {
      fetchTeacherResponses(teacherFilter);
    }
  };

  // Play audio in modal
  const handlePlayAudio = (audioUrl: string, responseTitle: string) => {
    setSelectedAudioUrl(audioUrl);
    setSelectedResponseTitle(responseTitle);
    setAudioModalOpen(true);
  };

  // Handle search filtering with debounce
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Apply client-side filtering when needed
  const filteredResponses = responses.filter((response) => {
    const search = debouncedSearchTerm.toLowerCase();
    return (
      response.student?.name?.toLowerCase().includes(search) ||
      response.question?.text?.toLowerCase().includes(search) ||
      (response.evaluation?.topic?.name || "").toLowerCase().includes(search)
    );
  });

  return (
    <div className="container mx-auto py-8 px-4">
      <Card className="border border-gray-100 shadow-sm">
        <CardHeader className="border-b border-gray-100 pb-4 bg-white">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
            <div className="flex items-center gap-3">
              <Image 
                src="/logo.png" 
                alt="Yuva Spark Logo" 
                width={40} 
                height={40}
                className="rounded-md"
              />
              <div>
                <CardTitle className="text-xl font-medium text-gray-800">
                  Yuva Spark
                </CardTitle>
                <p className="text-sm text-gray-500">Student Responses Dashboard</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                className="flex items-center gap-1 h-9"
                onClick={resetFilters}
                disabled={!teacherFilter}
              >
                <FilterX className="h-3.5 w-3.5" /> Reset Filters
              </Button>
              <Button
                variant="default"
                size="sm"
                className="flex items-center gap-1 h-9 bg-gray-800 hover:bg-gray-700 text-white"
                onClick={handleExport}
                disabled={exporting || !teacherFilter}
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

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4">
            <div>
              <Select
                value={teacherFilter}
                onValueChange={handleTeacherFilterChange}
              >
                <SelectTrigger
                  className="border-gray-200 focus:border-gray-300"
                  disabled={teachersLoading}
                >
                  <SelectValue placeholder="Select a teacher" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Teachers</SelectItem>
                  {teachers.map((teacher) => (
                    <SelectItem key={teacher.id} value={teacher.id}>
                      {teacher.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-gray-400" />
              </div>
              <Input
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 border-gray-200 focus:border-gray-300"
                disabled={!teacherFilter}
              />
            </div>

            <div>
              <Select
                value={studentFilter}
                onValueChange={handleStudentFilterChange}
                disabled={!teacherFilter}
              >
                <SelectTrigger
                  className="border-gray-200 focus:border-gray-300"
                  disabled={loadingStudents || !teacherFilter}
                >
                  <SelectValue placeholder="Filter by student" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all-students">All Students</SelectItem>
                  {students.map((student) => (
                    <SelectItem key={student.id} value={student.id}>
                      {student.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Select
                value={evaluationFilter}
                onValueChange={handleEvaluationFilterChange}
                disabled={!teacherFilter}
              >
                <SelectTrigger
                  className="border-gray-200 focus:border-gray-300"
                  disabled={loadingEvaluations || !teacherFilter}
                >
                  <SelectValue placeholder="Filter by evaluation" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all-evaluations">All Evaluations</SelectItem>
                  {evaluations.map((evaluation) => (
                    <SelectItem key={evaluation.id} value={evaluation.id}>
                      {evaluation.topic?.name || "Unnamed Evaluation"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-2 md:col-span-2">
              <div className="w-1/2">
                <DatePicker
                  date={startDate}
                  setDate={setStartDate}
                />
              </div>
              <div className="w-1/2">
                <DatePicker
                  date={endDate}
                  setDate={setEndDate}
                />
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {!teacherFilter ? (
            <div className="text-center py-16 px-4">
              <UserCircle2 className="h-12 w-12 mx-auto text-gray-300" />
              <h3 className="mt-4 text-base font-medium text-gray-700">
                Please select a teacher
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Select a teacher from the dropdown to view their student responses
              </p>
            </div>
          ) : loading ? (
            <div className="flex justify-center items-center py-16">
              <div className="text-center">
                <Loader2 className="h-8 w-8 animate-spin text-gray-500 mx-auto" />
                <p className="mt-3 text-sm text-gray-500">
                  Loading responses...
                </p>
              </div>
            </div>
          ) : filteredResponses.length === 0 ? (
            <div className="text-center py-16 px-4">
              <ListFilter className="h-12 w-12 mx-auto text-gray-300" />
              <h3 className="mt-4 text-base font-medium text-gray-700">
                No responses found
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Try adjusting your filters or search criteria
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50">
                    <TableHead className="font-medium">Student</TableHead>
                    <TableHead className="font-medium">Topic</TableHead>
                    <TableHead className="font-medium">Question</TableHead>
                    <TableHead className="font-medium">Response</TableHead>
                    <TableHead className="font-medium">Score</TableHead>
                    <TableHead className="font-medium">Date</TableHead>
                    <TableHead className="font-medium w-20">Audio</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredResponses.map((response) => (
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
                      <TableCell className="py-3">
                        <div className="text-gray-600 max-w-xs truncate flex items-center gap-2">
                          <ScrollText className="h-4 w-4 text-gray-500" />
                          {response.evaluation?.topic?.name || 'Unknown Topic'}
                        </div>
                      </TableCell>
                      <TableCell className="py-3">
                        <div className="text-gray-600 max-w-xs truncate">
                          {response.question?.text || 'Unknown Question'}
                        </div>
                      </TableCell>
                      <TableCell className="py-3">
                        <Badge 
                          variant="outline" 
                          className="text-xs bg-blue-50 text-blue-700 border-blue-200"
                        >
                          Audio Response
                        </Badge>
                      </TableCell>
                      <TableCell className="py-3">
                        {response.StudentResponseScore && response.StudentResponseScore.length > 0 ? (
                          <div className="font-medium">
                            {response.StudentResponseScore[0].score}%
                          </div>
                        ) : (
                          <div className="text-gray-500">Not scored</div>
                        )}
                      </TableCell>
                      <TableCell className="py-3 whitespace-nowrap">
                        {new Date(response.startTime).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="py-3">
                        {response.audioUrl ? (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="flex items-center gap-1 h-8"
                            onClick={() => handlePlayAudio(response.audioUrl, response.question?.text || 'Audio Response')}
                          >
                            <Play className="h-3.5 w-3.5 text-gray-500" />
                            Play
                          </Button>
                        ) : (
                          <span className="text-gray-400 text-xs">No audio</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Audio Playback Modal */}
      <Dialog open={audioModalOpen} onOpenChange={setAudioModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{selectedResponseTitle}</DialogTitle>
          </DialogHeader>
          <div className="p-4">
            <audio controls className="w-full" autoPlay>
              <source src={selectedAudioUrl} type="audio/mpeg" />
              Your browser does not support the audio element.
            </audio>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
} 