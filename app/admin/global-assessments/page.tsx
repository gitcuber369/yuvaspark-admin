"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Input } from "@/components/ui/input";
import { getGlobalAssessments, publishGlobalAssessment, completeGlobalAssessment } from "@/app/api/api";
import { toast } from "sonner";
import { 
  PlusCircle, 
  Check, 
  Settings, 
  Calendar, 
  Users, 
  School, 
  AlertTriangle, 
  FileText, 
  HelpCircle,
  RefreshCw,
  Search,
  Filter,
  AlertCircle
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

interface GlobalAssessment {
  id: string;
  name: string;
  description?: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
  status: string;
  topicIds: string[];
  createdAt: string;
  stats: {
    totalAnganwadis: number;
    completedAnganwadis: number;
    anganwadiCompletionPercentage: number;
    totalStudents: number;
    completedStudents: number;
    studentCompletionPercentage: number;
    gradedStudents: number;
  };
}

export default function GlobalAssessmentsPage() {
  const [assessments, setAssessments] = useState<GlobalAssessment[]>([]);
  const [filteredAssessments, setFilteredAssessments] = useState<GlobalAssessment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("date");
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();

  const fetchAssessments = async (showToast = false) => {
    try {
      setError(null);
      if (showToast) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      
      const data = await getGlobalAssessments();
      setAssessments(data);
      if (showToast) {
        toast.success("Assessments refreshed");
      }
    } catch (error) {
      console.error("Failed to fetch assessments:", error);
      setError("Failed to load assessments. Please try again.");
      toast.error("Failed to load assessments");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAssessments();
  }, []);

  useEffect(() => {
    let filtered = [...assessments];

    // Apply status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter(assessment => assessment.status === statusFilter);
    }

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(assessment => 
        assessment.name.toLowerCase().includes(query) ||
        assessment.description?.toLowerCase().includes(query)
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "date":
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case "name":
          return a.name.localeCompare(b.name);
        case "completion":
          return b.stats.studentCompletionPercentage - a.stats.studentCompletionPercentage;
        default:
          return 0;
      }
    });

    setFilteredAssessments(filtered);
  }, [assessments, searchQuery, statusFilter, sortBy]);

  const handlePublish = async (id: string) => {
    try {
      await publishGlobalAssessment(id);
      toast.success("Assessment published successfully");
      fetchAssessments();
    } catch (error) {
      console.error("Failed to publish assessment:", error);
      toast.error("Failed to publish assessment");
    }
  };

  const handleComplete = async (id: string) => {
    try {
      await completeGlobalAssessment(id);
      toast.success("Assessment marked as completed");
      fetchAssessments();
    } catch (error) {
      console.error("Failed to complete assessment:", error);
      toast.error("Failed to complete assessment");
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "DRAFT":
        return <Badge variant="outline">Draft</Badge>;
      case "PUBLISHED":
        return <Badge variant="secondary">Published</Badge>;
      case "COMPLETED":
        return <Badge className="bg-green-100 text-green-800">Completed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (error) {
    return (
      <div className="container mx-auto py-6">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-10">
            <AlertTriangle className="h-10 w-10 text-red-500 mb-4" />
            <h3 className="text-lg font-medium">Error Loading Assessments</h3>
            <p className="text-muted-foreground mt-2 text-center max-w-md mb-4">
              {error}
            </p>
            <Button onClick={() => fetchAssessments()}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-4 px-4 sm:px-6 sm:py-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-2 mb-6">
        <h1 className="text-xl sm:text-2xl font-bold">Global Assessments</h1>
        <div className="flex flex-wrap gap-2 w-full sm:w-auto">
          <Button 
            variant="outline" 
            size="icon"
            onClick={() => fetchAssessments(true)}
            disabled={refreshing}
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
          </Button>
          <Button variant="outline" className="flex-1 sm:flex-none" onClick={() => router.push("/admin/global-assessments/api-docs")}>
            <FileText className="mr-2 h-4 w-4" />
            API Documentation
          </Button>
          <Button className="flex-1 sm:flex-none" onClick={() => router.push("/admin/global-assessments/new")}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Create New Assessment
          </Button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search assessments..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex flex-wrap gap-2 w-full sm:w-auto">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <Filter className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="DRAFT">Draft</SelectItem>
              <SelectItem value="PUBLISHED">Published</SelectItem>
              <SelectItem value="COMPLETED">Completed</SelectItem>
            </SelectContent>
          </Select>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="date">Latest First</SelectItem>
              <SelectItem value="name">Name</SelectItem>
              <SelectItem value="completion">Completion</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {loading ? (
        <div className="grid gap-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="space-y-2">
                <div className="h-5 bg-gray-200 rounded w-1/3"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6">
                  {[1, 2, 3].map((j) => (
                    <div key={j} className="h-12 bg-gray-200 rounded"></div>
                  ))}
                </div>
                <div className="space-y-3">
                  <div className="h-6 bg-gray-200 rounded"></div>
                  <div className="h-6 bg-gray-200 rounded"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredAssessments.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-8 sm:py-10">
            <AlertTriangle className="h-10 w-10 text-amber-500 mb-4" />
            <h3 className="text-lg font-medium text-center">
              {assessments.length === 0 ? "No assessments found" : "No matching assessments"}
            </h3>
            <p className="text-muted-foreground mt-2 text-center max-w-md px-4">
              {assessments.length === 0 
                ? "You haven't created any global assessments yet. Click the button above to create your first assessment."
                : "Try adjusting your search or filters to find what you're looking for."}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:gap-6">
          {filteredAssessments.map((assessment) => (
            <Card key={assessment.id} className="overflow-hidden">
              <CardHeader className="bg-muted/40">
                <div className="flex flex-col sm:flex-row justify-between items-start gap-2 sm:items-center">
                  <div>
                    <CardTitle className="text-lg sm:text-xl break-words">{assessment.name}</CardTitle>
                    <CardDescription className="break-words">{assessment.description}</CardDescription>
                  </div>
                  <div className="self-start">{getStatusBadge(assessment.status)}</div>
                </div>
              </CardHeader>
              <CardContent className="pt-4 sm:pt-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium">Assessment Period</p>
                      <p className="text-sm text-muted-foreground">
                        {formatDate(assessment.startDate)} - {formatDate(assessment.endDate)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <School className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium">Anganwadis</p>
                      <p className="text-sm text-muted-foreground">
                        {assessment.stats.completedAnganwadis} / {assessment.stats.totalAnganwadis} completed
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                    <div className="w-full">
                      <p className="text-sm font-medium">Students</p>
                      <div className="flex flex-col gap-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <div className="text-sm font-medium">
                            {assessment.stats.completedStudents} out of {assessment.stats.totalStudents} submitted
                          </div>
                          {assessment.stats.gradedStudents > 0 && (
                            <Badge variant="outline" className="text-xs">
                              {assessment.stats.gradedStudents} graded
                            </Badge>
                          )}
                        </div>
                        <div className="relative w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className="absolute top-0 left-0 h-full bg-blue-200"
                            style={{
                              width: `${assessment.stats.studentCompletionPercentage}%`,
                            }}
                          />
                          <div
                            className="absolute top-0 left-0 h-full bg-blue-500"
                            style={{
                              width: `${(assessment.stats.gradedStudents / assessment.stats.completedStudents) * assessment.stats.studentCompletionPercentage}%`,
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <div className="flex flex-wrap justify-between mb-1 text-sm gap-2">
                      <div className="flex items-center gap-1">
                        <span>Anganwadi Completion</span>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger>
                              <HelpCircle className="h-4 w-4 text-muted-foreground" />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Percentage of Anganwadis that have completed all student assessments</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                      <span>{assessment.stats.anganwadiCompletionPercentage}%</span>
                    </div>
                    <Progress 
                      value={assessment.stats.anganwadiCompletionPercentage} 
                      className="h-2"
                    />
                  </div>
                  <div>
                    <div className="flex flex-col sm:flex-row justify-between mb-1 text-sm gap-2">
                      <div className="flex items-center gap-1">
                        <span>Student Completion</span>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger>
                              <HelpCircle className="h-4 w-4 text-muted-foreground" />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Percentage of students who have completed their assessments. Graded submissions are shown in darker shade.</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span>{assessment.stats.studentCompletionPercentage}%</span>
                        <span className="text-xs text-muted-foreground">
                          ({assessment.stats.completedStudents}/{assessment.stats.totalStudents})
                        </span>
                        {assessment.stats.gradedStudents > 0 && (
                          <Badge variant="outline" className="text-xs">
                            {assessment.stats.gradedStudents} graded ({Math.round((assessment.stats.gradedStudents / assessment.stats.completedStudents) * 100)}%)
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="relative">
                      <Progress 
                        value={assessment.stats.studentCompletionPercentage} 
                        className="h-2 bg-muted"
                      />
                      {assessment.stats.gradedStudents > 0 && (
                        <Progress 
                          value={(assessment.stats.gradedStudents / assessment.stats.completedStudents) * assessment.stats.studentCompletionPercentage}
                          className="h-2 absolute top-0 left-0 bg-primary/70"
                        />
                      )}
                    </div>
                  </div>
                </div>

                <div className="mt-4 text-sm text-muted-foreground">
                  {assessment.status === "PUBLISHED" && assessment.stats.completedStudents < assessment.stats.totalStudents && (
                    <div className="flex items-start sm:items-center gap-2">
                      <AlertCircle className="h-4 w-4 text-amber-500 flex-shrink-0 mt-1 sm:mt-0" />
                      <span>
                        {assessment.stats.totalStudents - assessment.stats.completedStudents} students still need to complete their assessments
                      </span>
                    </div>
                  )}
                  {assessment.stats.completedStudents > assessment.stats.gradedStudents && (
                    <div className="flex items-start sm:items-center gap-2 mt-1">
                      <AlertCircle className="h-4 w-4 text-blue-500 flex-shrink-0 mt-1 sm:mt-0" />
                      <span>
                        {assessment.stats.completedStudents - assessment.stats.gradedStudents} completed {assessment.stats.completedStudents - assessment.stats.gradedStudents === 1 ? 'assessment needs' : 'assessments need'} grading
                      </span>
                    </div>
                  )}
                </div>
              </CardContent>
              <CardFooter className="bg-muted/20 flex flex-col sm:flex-row gap-2 justify-between">
                <Button variant="outline" className="w-full sm:w-auto" onClick={() => router.push(`/admin/global-assessments/${assessment.id}`)}>
                  <Settings className="mr-2 h-4 w-4" />
                  View Details
                </Button>
                {assessment.status === "DRAFT" && (
                  <Button className="w-full sm:w-auto" onClick={() => handlePublish(assessment.id)}>
                    <Check className="mr-2 h-4 w-4" />
                    Publish Assessment
                  </Button>
                )}
                {assessment.status === "PUBLISHED" && (
                  <Button className="w-full sm:w-auto" onClick={() => handleComplete(assessment.id)}>
                    <Check className="mr-2 h-4 w-4" />
                    Mark as Completed
                  </Button>
                )}
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
} 