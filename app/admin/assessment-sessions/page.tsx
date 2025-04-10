"use client";

import { useEffect, useState } from "react";
import { useAssessmentSessionStore } from "@/app/store/assessmentSessionStore";
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
  ClipboardList,
  Calendar,
  User,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface AssessmentSession {
  id: string;
  evaluationId: string;
  studentId: string;
  teacherId: string;
  startTime: string;
  endTime: string | null;
  status: string;
  score: number | null;
  student: {
    id: string;
    name: string;
  };
  teacher: {
    id: string;
    name: string;
  };
  evaluation: {
    id: string;
    title: string;
  };
}

export default function AssessmentSessionsPage() {
  const { sessions, loading, fetchSessions, exportSessions } =
    useAssessmentSessionStore();

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [exporting, setExporting] = useState(false);

  // Fetch initial data
  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  const handleExport = async () => {
    setExporting(true);
    try {
      const filters: any = {};

      if (statusFilter && statusFilter !== "all") {
        filters.status = statusFilter;
      }

      const downloadUrl = await exportSessions(filters);

      // Create a temporary link and trigger download
      const a = document.createElement("a");
      a.href = downloadUrl;
      a.download = `assessment-sessions-${format(
        new Date(),
        "yyyy-MM-dd"
      )}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(downloadUrl);
      document.body.removeChild(a);

      toast.success("Export successful!");
    } catch (err) {
      toast.error("Failed to export assessment sessions");
    } finally {
      setExporting(false);
    }
  };

  const resetFilters = () => {
    setStatusFilter("all");
    setSearchTerm("");
    fetchSessions();
  };

  // Handle search filtering with debounce
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  const filteredSessions = sessions.filter((session: AssessmentSession) => {
    const search = debouncedSearchTerm.toLowerCase();
    const matchesSearch =
      (session.student?.name?.toLowerCase() || '').includes(search) ||
      (session.teacher?.name?.toLowerCase() || '').includes(search) ||
      (session.evaluation?.title?.toLowerCase() || '').includes(search);

    if (statusFilter && statusFilter !== "all") {
      return (
        matchesSearch &&
        (session.status?.toLowerCase() || '') === statusFilter.toLowerCase()
      );
    }

    return matchesSearch;
  });

  const getStatusBadgeColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "completed":
        return "bg-green-100 text-green-800 border-green-200";
      case "in_progress":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "cancelled":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const formatDateTimeRange = (startTime: string, endTime: string | null) => {
    const start = new Date(startTime);
    const formattedStart = format(start, "MMM d, yyyy h:mm a");

    if (!endTime) {
      return formattedStart;
    }

    const end = new Date(endTime);
    const sameDay = start.toDateString() === end.toDateString();

    if (sameDay) {
      return `${format(start, "MMM d, yyyy")} (${format(
        start,
        "h:mm a"
      )} - ${format(end, "h:mm a")})`;
    } else {
      return `${formattedStart} - ${format(end, "MMM d, yyyy h:mm a")}`;
    }
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <Card className="border border-gray-100 shadow-sm rounded-lg overflow-hidden">
        <CardHeader className="border-b border-gray-100 pb-4 bg-white">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
            <CardTitle className="text-xl font-medium flex items-center gap-2 text-gray-800">
              <ClipboardList className="h-5 w-5 text-gray-600" /> Assessment
              Sessions
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
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-gray-400" />
              </div>
              <Input
                placeholder="Search by student, teacher or evaluation"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-full border-gray-200 focus:border-gray-300"
              />
            </div>
            <div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full border-gray-200 focus:border-gray-300">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All statuses</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
            </div>
          ) : filteredSessions.length === 0 ? (
            <div className="py-12 text-center text-gray-500">
              {debouncedSearchTerm || (statusFilter !== "all")
                ? "No sessions matching your filters"
                : "No assessment sessions found"}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50">
                    <TableHead className="font-medium">Student</TableHead>
                    <TableHead className="font-medium">Teacher</TableHead>
                    <TableHead className="font-medium">Evaluation</TableHead>
                    <TableHead className="font-medium">Status</TableHead>
                    <TableHead className="font-medium">Duration</TableHead>
                    <TableHead className="font-medium">Score</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSessions.map((session: AssessmentSession) => (
                    <TableRow
                      key={session.id}
                      className="hover:bg-gray-50 border-t border-gray-100"
                    >
                      <TableCell className="py-3">
                        <div className="flex items-center">
                          <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center mr-2">
                            <User className="h-4 w-4 text-gray-600" />
                          </div>
                          <div className="font-medium text-gray-900">
                            {session.student?.name || 'Unknown Student'}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="py-3 text-gray-700">
                        {session.teacher?.name || 'Unknown Teacher'}
                      </TableCell>
                      <TableCell className="py-3">
                        <div className="text-gray-600 max-w-xs truncate">
                          {session.evaluation?.title || 'Unknown Evaluation'}
                        </div>
                      </TableCell>
                      <TableCell className="py-3">
                        <Badge
                          className={cn(
                            "font-normal py-0.5",
                            getStatusBadgeColor(session.status || '')
                          )}
                        >
                          {(session.status || 'Unknown').replace("_", " ")}
                        </Badge>
                      </TableCell>
                      <TableCell className="py-3">
                        <div className="flex items-center text-gray-600">
                          <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                          {session.startTime ? 
                            formatDateTimeRange(session.startTime, session.endTime) : 
                            'No date information'}
                        </div>
                      </TableCell>
                      <TableCell className="py-3">
                        {session.score !== null && session.score !== undefined ? (
                          <div className="font-medium text-gray-900">
                            {session.score}%
                          </div>
                        ) : (
                          <div className="text-gray-500">N/A</div>
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
    </div>
  );
}
