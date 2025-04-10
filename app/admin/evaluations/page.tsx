"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TableHeader,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import {
  PlusCircle,
  ExternalLink,
  FileAudio,
  User,
  Users,
  BookOpen,
  School,
  CalendarClock,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  getAllEvaluations,
  getEvaluationsByStatus,
  getEvaluationsByAnganwadi,
  getEvaluationsBySession,
} from "@/app/api/api";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Evaluation {
  id: string;
  student: {
    id: string;
    name: string;
  } | null;
  teacher: {
    id: string;
    name: string;
  } | null;
  topic: {
    id: string;
    name: string;
  } | null;
  weekNumber: number;
  audioUrl: string;
  status: string;
  submittedAt: string | null;
  gradingComplete: boolean;
  // For student responses tracking
  studentResponses?: Array<{
    id: string;
    StudentResponseScore?: {
      id: string;
      score: number;
    } | null;
  }>;
}

export default function EvaluationsPage() {
  const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");
  const [filterType, setFilterType] = useState<
    "none" | "anganwadi" | "session"
  >("none");
  const [filterId, setFilterId] = useState("");
  const router = useRouter();

  const fetchEvaluations = async (status?: string) => {
    setLoading(true);
    try {
      let data;

      // First check if we're filtering by anganwadi or session
      if (filterType === "anganwadi" && filterId) {
        data = await getEvaluationsByAnganwadi(filterId);
      } else if (filterType === "session" && filterId) {
        data = await getEvaluationsBySession(filterId);
      }
      // Then apply status filter if needed
      else if (status && status !== "all") {
        data = await getEvaluationsByStatus(status);
      } else {
        data = await getAllEvaluations();
      }

      setEvaluations(data);
    } catch (error) {
      console.error("Failed to fetch evaluations:", error);
      toast.error("Failed to load evaluations");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvaluations(activeTab !== "all" ? activeTab : undefined);
  }, [activeTab, filterType, filterId]);

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

  // Function to determine the action button text and icon
  const getActionButton = (evaluation: Evaluation) => {
    switch (evaluation.status) {
      case "DRAFT":
        return (
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push(`/admin/evaluations/${evaluation.id}`)}
          >
            <FileAudio className="mr-2 h-4 w-4" />
            Record
          </Button>
        );
      case "SUBMITTED":
        return (
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push(`/admin/evaluations/${evaluation.id}`)}
          >
            <BookOpen className="mr-2 h-4 w-4" />
            Grade
          </Button>
        );
      case "GRADED":
        return (
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push(`/admin/evaluations/${evaluation.id}`)}
          >
            <ExternalLink className="mr-2 h-4 w-4" />
            View
          </Button>
        );
      default:
        return (
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push(`/admin/evaluations/${evaluation.id}`)}
          >
            <ExternalLink className="mr-2 h-4 w-4" />
            View
          </Button>
        );
    }
  };

  // Clear all filters
  const clearFilters = () => {
    setFilterType("none");
    setFilterId("");
    setActiveTab("all");
  };

  return (
    <div className="max-w-7xl mx-auto p-4 space-y-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Evaluation Management</h1>
        <Button onClick={() => router.push("/admin/evaluations/new")}>
          <PlusCircle className="mr-2 h-4 w-4" />
          New Evaluation
        </Button>
      </div>

      <Card className="shadow-md">
        <CardHeader className="bg-muted/40">
          <CardTitle>All Evaluations</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs
            defaultValue="all"
            value={activeTab}
            onValueChange={setActiveTab}
            className="mb-6"
          >
            <TabsList>
              <TabsTrigger value="all">All Evaluations</TabsTrigger>
              <TabsTrigger value="DRAFT">Drafts</TabsTrigger>
              <TabsTrigger value="SUBMITTED">Submitted</TabsTrigger>
              <TabsTrigger value="GRADED">Graded</TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="space-y-4">
              <div className="flex gap-4 items-center">
                <Select
                  value={filterType}
                  onValueChange={(value: "none" | "anganwadi" | "session") =>
                    setFilterType(value)
                  }
                >
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="Filter by..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No Filter</SelectItem>
                    <SelectItem value="anganwadi">By Anganwadi</SelectItem>
                    <SelectItem value="session">By Session</SelectItem>
                  </SelectContent>
                </Select>

                {filterType !== "none" && (
                  <div className="flex-1">
                    <input
                      type="text"
                      placeholder={`Enter ${
                        filterType === "anganwadi" ? "Anganwadi" : "Session"
                      } ID`}
                      value={filterId}
                      onChange={(e) => setFilterId(e.target.value)}
                      className="w-full p-2 border rounded"
                    />
                  </div>
                )}

                {(filterType !== "none" || activeTab !== "all") && (
                  <Button variant="outline" size="sm" onClick={clearFilters}>
                    Clear Filters
                  </Button>
                )}
              </div>
            </TabsContent>

            <TabsContent value="DRAFT" className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Evaluations in draft status that haven't been submitted yet.
              </p>
            </TabsContent>

            <TabsContent value="SUBMITTED" className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Evaluations that have been submitted and are ready for grading.
              </p>
            </TabsContent>

            <TabsContent value="GRADED" className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Evaluations that have been graded completely.
              </p>
            </TabsContent>
          </Tabs>

          {loading ? (
            <div className="p-4 space-y-3">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : evaluations.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-8 text-center text-muted-foreground">
              <p>No evaluations found</p>
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => router.push("/admin/evaluations/new")}
              >
                Create your first evaluation
              </Button>
            </div>
          ) : (
            <div className="overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student</TableHead>
                    <TableHead>Teacher</TableHead>
                    <TableHead>Topic</TableHead>
                    <TableHead>Week</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Submitted</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {evaluations.map((ev) => (
                    <TableRow key={ev.id} className="hover:bg-muted/50">
                      <TableCell className="font-medium">
                        {ev.student?.name || "Unknown"}
                      </TableCell>
                      <TableCell>{ev.teacher?.name || "Unknown"}</TableCell>
                      <TableCell>{ev.topic?.name || "Unknown"}</TableCell>
                      <TableCell className="text-center">
                        Week {ev.weekNumber}
                      </TableCell>
                      <TableCell>{getStatusBadge(ev.status)}</TableCell>
                      <TableCell>
                        {ev.submittedAt
                          ? new Date(ev.submittedAt).toLocaleDateString()
                          : "-"}
                      </TableCell>
                      <TableCell className="text-right">
                        {getActionButton(ev)}
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
