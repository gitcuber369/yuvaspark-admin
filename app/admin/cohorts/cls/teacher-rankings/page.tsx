"use client";

import { useEffect, useState } from "react";
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
import { toast } from "sonner";
import { ArrowLeft, RefreshCw, Award } from "lucide-react";
import { API_URL } from "@/lib/config";

interface Teacher {
  id: string;
  name: string;
  anganwadiId: string;
  anganwadiName: string;
}

interface TeacherResponse {
  teacherId: string;
  teacherName: string;
  anganwadiId: string;
  anganwadiName: string;
  totalStudents: number;
  totalResponses: number;
  responsesPerStudent: number;
  rank: number;
}

export default function TeacherRankingsPage() {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [responseData, setResponseData] = useState<TeacherResponse[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchTeachers = async () => {
    try {
      const res = await fetch(`${API_URL}teachers`);
      if (!res.ok) throw new Error("Failed to fetch teachers");
      const data = await res.json();
      setTeachers(data);
      fetchTeacherResponses(data);
    } catch (error) {
      toast.error("Failed to load teachers");
      console.error(error);
    }
  };

  const fetchTeacherResponses = async (teacherList: Teacher[]) => {
    setLoading(true);
    try {
      const responses = await Promise.all(
        teacherList.map(async (teacher) => {
          try {
            const res = await fetch(
              `${API_URL}student-responses/teacher/${teacher.id}/count`
            );
            if (!res.ok) {
              throw new Error(`Failed to fetch for ${teacher.name}`);
            }
            const data = await res.json();
            return {
              ...data,
              teacherName: teacher.name,
              anganwadiName: teacher.anganwadiName,
              responsesPerStudent:
                data.totalStudents > 0
                  ? data.totalResponses / data.totalStudents
                  : 0,
            };
          } catch (error) {
            console.error(`Error fetching data for ${teacher.name}:`, error);
            return {
              teacherId: teacher.id,
              teacherName: teacher.name,
              anganwadiId: teacher.anganwadiId,
              anganwadiName: teacher.anganwadiName,
              totalStudents: 0,
              totalResponses: 0,
              responsesPerStudent: 0,
            };
          }
        })
      );

      // Sort by total responses (highest first)
      const sortedResponses = responses.sort(
        (a, b) => b.totalResponses - a.totalResponses
      );

      // Add rank to each teacher
      const rankedResponses = sortedResponses.map((response, index) => ({
        ...response,
        rank: index + 1,
      }));

      setResponseData(rankedResponses);
    } catch (error) {
      toast.error("Failed to load teacher responses");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeachers();
  }, []);

  // Function to render top 3 ranks with visual indicator
  const renderRankBadge = (rank: number) => {
    if (rank === 1) return <Award className="h-5 w-5 text-yellow-500" />;
    if (rank === 2) return <Award className="h-5 w-5 text-gray-400" />;
    if (rank === 3) return <Award className="h-5 w-5 text-amber-700" />;
    return rank;
  };

  return (
    <div className="max-w-4xl mx-auto py-10">
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={() => (window.location.href = "/admin/cohorts")}
          className="gap-1 text-gray-500 hover:text-gray-700"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Cohorts
        </Button>
      </div>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Teacher Rankings</CardTitle>
          <Button
            variant="outline"
            onClick={fetchTeachers}
            disabled={loading}
            className="flex items-center gap-1"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            Refresh Rankings
          </Button>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-10">
              <p>Loading teacher rankings...</p>
            </div>
          ) : responseData.length > 0 ? (
            <div className="space-y-6">
              <div className="grid grid-cols-3 gap-4 mb-6">
                {responseData.slice(0, 3).map((response, index) => (
                  <Card
                    key={response.teacherId}
                    className={`overflow-hidden ${
                      index === 0
                        ? "border-yellow-500"
                        : index === 1
                        ? "border-gray-400"
                        : "border-amber-700"
                    } border-2`}
                  >
                    <div
                      className={`py-1 px-4 text-center text-white ${
                        index === 0
                          ? "bg-yellow-500"
                          : index === 1
                          ? "bg-gray-400"
                          : "bg-amber-700"
                      }`}
                    >
                      Rank {response.rank}
                    </div>
                    <CardContent className="pt-4">
                      <div className="text-center space-y-2">
                        <h3 className="text-lg font-semibold">
                          {response.teacherName}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {response.anganwadiName}
                        </p>
                        <div className="grid grid-cols-2 gap-2 mt-2">
                          <div>
                            <p className="text-xl font-bold">
                              {response.totalStudents}
                            </p>
                            <p className="text-xs text-gray-500">Students</p>
                          </div>
                          <div>
                            <p className="text-xl font-bold">
                              {response.totalResponses}
                            </p>
                            <p className="text-xs text-gray-500">Responses</p>
                          </div>
                        </div>
                        <div className="mt-2">
                          <p className="text-lg font-bold">
                            {response.responsesPerStudent.toFixed(1)}
                          </p>
                          <p className="text-xs text-gray-500">
                            Responses per Student
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-16">Rank</TableHead>
                    <TableHead>Teacher Name</TableHead>
                    <TableHead>Anganwadi</TableHead>
                    <TableHead className="text-right">Students</TableHead>
                    <TableHead className="text-right">Responses</TableHead>
                    <TableHead className="text-right">
                      Responses per Student
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {responseData.map((response) => (
                    <TableRow
                      key={response.teacherId}
                      className={response.rank <= 3 ? "bg-gray-50" : ""}
                    >
                      <TableCell className="font-medium text-center">
                        <div className="flex justify-center">
                          {renderRankBadge(response.rank)}
                        </div>
                      </TableCell>
                      <TableCell>{response.teacherName}</TableCell>
                      <TableCell>{response.anganwadiName}</TableCell>
                      <TableCell className="text-right">
                        {response.totalStudents}
                      </TableCell>
                      <TableCell className="text-right">
                        {response.totalResponses}
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {response.responsesPerStudent.toFixed(1)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              <div className="text-xs text-gray-500 text-center mt-4">
                <p>
                  Teachers are ranked by total number of student responses.
                  Higher response counts indicate more active student
                  participation and engagement.
                </p>
              </div>
            </div>
          ) : (
            <div className="text-center py-10 text-gray-500">
              <p>No teacher data found.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
