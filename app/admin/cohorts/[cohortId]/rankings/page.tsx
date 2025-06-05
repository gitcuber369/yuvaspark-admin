"use client";

import React, { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Award, ArrowLeft, Trophy, Medal } from "lucide-react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { API_URL } from "@/lib/config";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Assessment {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
  status: string;
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

interface TeacherRanking {
  id: string;
  name: string;
  phone: string;
  anganwadi?: {
    id: string;
    name: string;
  };
  stats: {
    responseCount: number;
    averageScore: number;
    totalStudents: number;
    responsesPerStudent: number;
    anganwadiResponses: number;
    assessmentResponseRate: number;
    weightedScore: number;
  };
}

export default function RankingsPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [rankings, setRankings] = useState<TeacherRanking[]>([]);
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [selectedAssessment, setSelectedAssessment] =
    useState<Assessment | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchAssessments = async () => {
    try {
      const response = await fetch(`${API_URL}global-assessments`);
      if (!response.ok) throw new Error("Failed to fetch assessments");
      const data = await response.json();
      setAssessments(data);

      // If there's an assessmentId in the URL, select that assessment
      const assessmentId = searchParams.get("assessmentId");
      if (assessmentId) {
        const assessment = data.find((a: Assessment) => a.id === assessmentId);
        if (assessment) setSelectedAssessment(assessment);
      }
    } catch (error) {
      console.error("Error fetching assessments:", error);
      toast.error("Failed to load assessments");
    }
  };

  const fetchRankings = async () => {
    setLoading(true);
    try {
      const assessmentId = searchParams.get("assessmentId");
      const url = `${API_URL}cohorts/${params.cohortId}/teacher-rankings${
        assessmentId ? `?assessmentId=${assessmentId}` : ""
      }`;
      const response = await fetch(url);

      if (!response.ok) throw new Error("Failed to fetch rankings");
      const data = await response.json();
      setRankings(data.rankings || []);
    } catch (error) {
      console.error("Error fetching rankings:", error);
      toast.error("Failed to load teacher rankings");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssessments();
  }, []);

  useEffect(() => {
    if (params.cohortId) {
      fetchRankings();
    }
  }, [params.cohortId, searchParams]);

  const handleAssessmentChange = (assessmentId: string) => {
    const assessment = assessments.find((a) => a.id === assessmentId);
    setSelectedAssessment(assessment || null);
    router.push(
      `/admin/cohorts/${params.cohortId}/rankings?assessmentId=${assessmentId}`
    );
  };

  const getRankBadge = (rank: number) => {
    if (rank === 1) return <Trophy className="h-5 w-5 text-yellow-500" />;
    if (rank === 2) return <Medal className="h-5 w-5 text-gray-400" />;
    if (rank === 3) return <Award className="h-5 w-5 text-amber-700" />;
    return rank;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={() => window.history.back()}
          className="gap-1 text-gray-500 hover:text-gray-700"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
      </div>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <h1 className="text-2xl font-bold">Teacher Rankings</h1>
        <div className="w-full md:w-72">
          <Select
            value={selectedAssessment?.id}
            onValueChange={handleAssessmentChange}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select Assessment" />
            </SelectTrigger>
            <SelectContent>
              {assessments.map((assessment) => (
                <SelectItem key={assessment.id} value={assessment.id}>
                  {assessment.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {selectedAssessment && (
        <Card className="mb-8 bg-gray-50">
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center">
                <p className="text-sm text-gray-500">Total Students</p>
                <p className="text-2xl font-bold">
                  {selectedAssessment.stats.totalStudents}
                </p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-500">Completed Students</p>
                <p className="text-2xl font-bold">
                  {selectedAssessment.stats.completedStudents}
                </p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-500">Completion Rate</p>
                <p className="text-2xl font-bold">
                  {selectedAssessment.stats.studentCompletionPercentage}%
                </p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-500">Graded Students</p>
                <p className="text-2xl font-bold">
                  {selectedAssessment.stats.gradedStudents}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Top 3 Teachers Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {rankings.slice(0, 3).map((teacher, index) => (
          <Card key={teacher.id} className="relative overflow-hidden">
            <div className="absolute top-2 right-2">
              {getRankBadge(index + 1)}
            </div>
            <CardContent className="pt-6">
              <div className="text-center space-y-2">
                <h3 className="text-lg font-semibold">
                  {teacher.name || "Unknown Teacher"}
                </h3>
                <p className="text-sm text-gray-500">
                  {teacher.anganwadi?.name || "No Anganwadi Assigned"}
                </p>
                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div>
                    <p className="text-xl font-bold">
                      {teacher.stats?.totalStudents || 0}
                    </p>
                    <p className="text-xs text-gray-500">Total Students</p>
                  </div>
                  <div>
                    <p className="text-xl font-bold">
                      {teacher.stats?.responseCount || 0}
                    </p>
                    <p className="text-xs text-gray-500">Total Responses</p>
                  </div>
                </div>
                <div className="mt-4">
                  <p className="text-lg font-bold">
                    {(teacher.stats?.assessmentResponseRate || 0).toFixed(1)}%
                  </p>
                  <p className="text-xs text-gray-500">Response Rate</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Complete Rankings Table */}
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-16">Rank</TableHead>
              <TableHead>Teacher</TableHead>
              <TableHead>Anganwadi</TableHead>
              <TableHead className="text-right">Response Rate</TableHead>
              <TableHead className="text-right">Total Responses</TableHead>
              <TableHead className="text-right">Students</TableHead>
              <TableHead className="text-right">Score</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rankings.map((teacher, index) => (
              <TableRow key={teacher.id}>
                <TableCell className="font-medium">
                  <div className="flex justify-center">
                    {getRankBadge(index + 1)}
                  </div>
                </TableCell>
                <TableCell>
                  <div>
                    <div className="font-medium">
                      {teacher.name || "Unknown Teacher"}
                    </div>
                    <div className="text-sm text-gray-500">
                      {teacher.phone || "No Phone"}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  {teacher.anganwadi?.name || "Not assigned"}
                </TableCell>
                <TableCell className="text-right">
                  {(teacher.stats?.assessmentResponseRate || 0).toFixed(1)}%
                </TableCell>
                <TableCell className="text-right">
                  {teacher.stats?.responseCount || 0}
                </TableCell>
                <TableCell className="text-right">
                  {teacher.stats?.totalStudents || 0}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    {(teacher.stats?.averageScore || 0).toFixed(1)}
                    <Progress
                      value={teacher.stats?.averageScore || 0}
                      className="w-20 h-2"
                    />
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
