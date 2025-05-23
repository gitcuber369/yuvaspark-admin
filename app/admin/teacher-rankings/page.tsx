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
import { ArrowLeft, RefreshCw, Award, Trophy, Medal } from "lucide-react";
import { API_URL } from "@/lib/config";
import { Progress } from "@/components/ui/progress";

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
  };
}

export default function TeacherRankingsPage() {
  const [rankings, setRankings] = useState<TeacherRanking[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRankings = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}teachers/rankings`);
      if (!response.ok) throw new Error("Failed to fetch rankings");
      const data = await response.json();

      // Sort by response count
      const sortedData = data.sort(
        (a: TeacherRanking, b: TeacherRanking) =>
          b.stats.responseCount - a.stats.responseCount
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
    fetchRankings();
  }, []);

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

  // Calculate highest response count for relative comparison
  const highestResponseCount =
    rankings.length > 0
      ? Math.max(...rankings.map((t) => t.stats.responseCount))
      : 100;

  return (
    <div className="container mx-auto py-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            onClick={() => window.history.back()}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          <h1 className="text-2xl font-bold">Teacher Rankings</h1>
        </div>
        <Button onClick={fetchRankings} disabled={loading} className="gap-2">
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Teacher Response Rankings</CardTitle>
        </CardHeader>
        <CardContent>
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
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                        <h3 className="text-lg font-semibold">
                          {teacher.name}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {teacher.anganwadi?.name || "No Anganwadi"}
                        </p>
                        <div className="mt-4">
                          <p className="text-2xl font-bold">
                            {teacher.stats.responseCount}
                          </p>
                          <p className="text-sm text-gray-500">
                            Total Responses
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Rankings Table */}
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-16">Rank</TableHead>
                    <TableHead>Teacher</TableHead>
                    <TableHead>Anganwadi</TableHead>
                    <TableHead>Response Count</TableHead>
                    <TableHead>Performance</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rankings.map((teacher, index) => (
                    <TableRow key={teacher.id}>
                      <TableCell>{getRankBadge(index + 1)}</TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-medium">{teacher.name}</span>
                          <span className="text-sm text-gray-500">
                            {teacher.phone}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {teacher.anganwadi?.name || "Not assigned"}
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">
                          {teacher.stats.responseCount}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="w-40">
                          <Progress
                            value={
                              (teacher.stats.responseCount /
                                highestResponseCount) *
                              100
                            }
                            className="h-2"
                          />
                        </div>
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
