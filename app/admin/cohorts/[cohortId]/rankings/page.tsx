"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { ArrowLeft, RefreshCw, Trophy, Medal, Award } from "lucide-react";
import { API_URL } from "@/lib/config";

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
  };
}

export default function CohortTeacherRankingsPage() {
  const params = useParams();
  const cohortId = params.cohortId as string;
  const [rankings, setRankings] = useState<TeacherRanking[]>([]);
  const [loading, setLoading] = useState(true);
  const [cohortName, setCohortName] = useState("");

  const fetchCohortData = async () => {
    try {
      const response = await fetch(`${API_URL}cohorts/${cohortId}`);
      if (!response.ok) throw new Error("Failed to fetch cohort data");
      const data = await response.json();
      setCohortName(data.name);
    } catch (error) {
      console.error("Error fetching cohort data:", error);
      toast.error("Failed to load cohort information");
    }
  };

  const fetchRankings = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}cohorts/${cohortId}/rankings`);
      if (!response.ok) throw new Error("Failed to fetch rankings");
      const data = await response.json();

      // Get student responses for each teacher
      const teachersWithResponses = await Promise.all(
        data.map(async (teacher: any) => {
          const responsesResponse = await fetch(
            `${API_URL}teachers/${teacher.id}/student-responses`
          );
          if (!responsesResponse.ok)
            throw new Error("Failed to fetch student responses");
          const studentResponses = await responsesResponse.json();

          return {
            ...teacher,
            stats: {
              responseCount: studentResponses.length,
              averageScore: teacher.stats.averageScore,
              totalStudents: teacher.stats.totalStudents,
              responsesPerStudent:
                teacher.stats.totalStudents > 0
                  ? studentResponses.length / teacher.stats.totalStudents
                  : 0,
            },
          };
        })
      );

      // Sort by response count and average score
      const sortedData = teachersWithResponses.sort(
        (a: TeacherRanking, b: TeacherRanking) => {
          const scoreA =
            a.stats.responseCount * 0.7 + a.stats.averageScore * 0.3;
          const scoreB =
            b.stats.responseCount * 0.7 + b.stats.averageScore * 0.3;
          return scoreB - scoreA;
        }
      );

      setRankings(sortedData);
    } catch (error) {
      console.error("Error fetching rankings:", error);
      toast.error("Failed to load teacher rankings");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCohortData();
    fetchRankings();
  }, [cohortId]);

  const getRankBadge = (rank: number) => {
    if (rank === 1) {
      return (
        <div className="flex items-center justify-center">
          <Trophy className="h-5 w-5 text-yellow-500" />
        </div>
      );
    }
    if (rank === 2) {
      return (
        <div className="flex items-center justify-center">
          <Medal className="h-5 w-5 text-gray-400" />
        </div>
      );
    }
    if (rank === 3) {
      return (
        <div className="flex items-center justify-center">
          <Award className="h-5 w-5 text-amber-700" />
        </div>
      );
    }
    return <div className="text-center">{rank}</div>;
  };

  // Calculate highest values for relative comparison
  const highestResponseCount =
    rankings.length > 0
      ? Math.max(...rankings.map((t) => t.stats.responseCount))
      : 100;
  const highestAverageScore =
    rankings.length > 0
      ? Math.max(...rankings.map((t) => t.stats.averageScore))
      : 100;

  return (
    <div className="container mx-auto px-4 py-4 md:py-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4">
          <Button
            variant="ghost"
            onClick={() => window.history.back()}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          <div>
            <h1 className="text-xl md:text-2xl font-bold">Teacher Rankings</h1>
            <p className="text-sm text-gray-500">{cohortName}</p>
          </div>
        </div>
        <Button 
          onClick={fetchRankings} 
          disabled={loading} 
          className="w-full sm:w-auto gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Top Performing Teachers</CardTitle>
        </CardHeader>
        <CardContent className="p-3 sm:p-6">
          {loading ? (
            <div className="flex justify-center items-center py-8">
              <RefreshCw className="h-8 w-8 animate-spin" />
            </div>
          ) : rankings.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">No teacher rankings available</p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Top 3 Teachers Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {rankings.slice(0, 3).map((teacher, index) => (
                  <Card key={teacher.id} className="relative overflow-hidden">
                    <div
                      className={`absolute top-0 left-0 w-full h-1 ${
                        index === 0
                          ? "bg-yellow-500"
                          : index === 1
                          ? "bg-gray-400"
                          : "bg-amber-700"
                      }`}
                    />
                    <CardContent className="pt-6">
                      <div className="text-center space-y-2">
                        <div className="flex justify-center mb-2">
                          {getRankBadge(index + 1)}
                        </div>
                        <h3 className="text-base sm:text-lg font-semibold truncate px-2">
                          {teacher.name}
                        </h3>
                        <p className="text-sm text-gray-500 truncate px-2">
                          {teacher.anganwadi?.name || "No Anganwadi"}
                        </p>
                        <div className="grid grid-cols-2 gap-4 mt-4">
                          <div>
                            <p className="text-xl sm:text-2xl font-bold">
                              {teacher.stats.responseCount}
                            </p>
                            <p className="text-xs sm:text-sm text-gray-500">
                              Total Responses
                            </p>
                          </div>
                          <div>
                            <p className="text-xl sm:text-2xl font-bold">
                              {teacher.stats.averageScore.toFixed(1)}%
                            </p>
                            <p className="text-xs sm:text-sm text-gray-500">Avg. Score</p>
                          </div>
                        </div>
                        <div className="mt-2">
                          <p className="text-xs sm:text-sm text-gray-500">
                            {teacher.stats.totalStudents} Students
                          </p>
                          <p className="text-xs sm:text-sm text-gray-500">
                            {teacher.stats.responsesPerStudent.toFixed(1)}{" "}
                            responses/student
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Rankings Table */}
              <div className="overflow-x-auto -mx-3 sm:mx-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-16">Rank</TableHead>
                      <TableHead>Teacher</TableHead>
                      <TableHead className="hidden md:table-cell">Anganwadi</TableHead>
                      <TableHead className="hidden sm:table-cell text-right">Students</TableHead>
                      <TableHead className="text-right">Responses</TableHead>
                      <TableHead className="hidden lg:table-cell text-right">
                        Responses/Student
                      </TableHead>
                      <TableHead className="text-right">Score</TableHead>
                      <TableHead className="hidden md:table-cell text-right">Performance</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {rankings.map((teacher, index) => (
                      <TableRow key={teacher.id}>
                        <TableCell>{getRankBadge(index + 1)}</TableCell>
                        <TableCell>
                          <div className="flex flex-col min-w-[140px]">
                            <span className="font-medium truncate">{teacher.name}</span>
                            <span className="text-xs text-gray-500 truncate">
                              {teacher.phone}
                            </span>
                            <div className="md:hidden text-xs text-gray-500 mt-1">
                              {teacher.anganwadi?.name || "No Anganwadi"}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          <span className="truncate block max-w-[200px]">
                            {teacher.anganwadi?.name || "Not assigned"}
                          </span>
                        </TableCell>
                        <TableCell className="hidden sm:table-cell text-right">
                          {teacher.stats.totalStudents}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="font-medium">
                            {teacher.stats.responseCount}
                          </div>
                          <div className="sm:hidden text-xs text-gray-500">
                            ({teacher.stats.totalStudents} students)
                          </div>
                        </TableCell>
                        <TableCell className="hidden lg:table-cell text-right">
                          <Badge variant="secondary">
                            {teacher.stats.responsesPerStudent.toFixed(1)}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Badge variant="secondary">
                            {teacher.stats.averageScore.toFixed(1)}%
                          </Badge>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-gray-500 w-16">
                                Responses
                              </span>
                              <Progress
                                value={
                                  (teacher.stats.responseCount /
                                    highestResponseCount) *
                                  100
                                }
                                className="h-2 flex-1"
                              />
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-gray-500 w-16">Score</span>
                              <Progress
                                value={
                                  (teacher.stats.averageScore /
                                    highestAverageScore) *
                                  100
                                }
                                className="h-2 flex-1"
                              />
                            </div>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              <div className="text-xs text-gray-500 text-center mt-4 px-4">
                <p>
                  Teachers are ranked based on a combination of response count
                  (70%) and average score (30%). Higher rankings indicate better
                  overall performance and student engagement.
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
