"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
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
  ArrowLeft,
  Award,
  RefreshCw,
  School,
  User,
  FileText,
  Loader2,
  Medal,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import React from "react";
import { API_URL } from "@/lib/config";

interface TeacherRanking {
  id: string;
  name: string;
  phone: string;
  rank: number;
  anganwadi?: {
    id: string;
    name: string;
  };
  stats: {
    responseCount: number;
    averageScore: number;
  };
}

interface Cohort {
  id: string;
  name: string;
  region: string;
}

// @ts-ignore - Next.js type mismatch with params
interface PageProps {
  params: Promise<{ cohortId: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default function TeacherRankingsPage({ params }: PageProps) {
  const router = useRouter();
  const { cohortId } = React.use(params);

  const [rankings, setRankings] = useState<TeacherRanking[]>([]);
  const [cohort, setCohort] = useState<Cohort | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);

  const fetchRankings = async () => {
    setIsLoading(true);
    try {
      // Fetch cohort details
      const cohortRes = await fetch(`${API_URL}cohorts/${cohortId}`);
      if (!cohortRes.ok) throw new Error("Failed to fetch cohort");
      const cohortData = await cohortRes.json();
      setCohort(cohortData);

      // Fetch teacher rankings
      const rankingsRes = await fetch(`${API_URL}cohorts/${cohortId}/rankings`);
      if (!rankingsRes.ok) throw new Error("Failed to fetch rankings");
      const rankingsData = await rankingsRes.json();
      setRankings(rankingsData);
    } catch (error) {
      console.error("Error fetching rankings:", error);
      toast.error("Failed to load rankings");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRankings();
  }, [cohortId]);

  const updateRankings = async () => {
    setIsUpdating(true);
    try {
      const response = await fetch(
        `${API_URL}cohorts/${cohortId}/update-rankings`,
        {
          method: "POST",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update rankings");
      }

      const data = await response.json();
      setRankings(data.teachers);
      toast.success("Rankings updated successfully");
    } catch (error) {
      console.error("Error updating rankings:", error);
      toast.error("Failed to update rankings");
    } finally {
      setIsUpdating(false);
    }
  };

  const getRankBadge = (rank: number) => {
    if (rank === 0) {
      return (
        <Badge variant="outline" className="bg-gray-100">
          Not Ranked
        </Badge>
      );
    }

    if (rank === 1) {
      return (
        <Badge className="bg-yellow-100 text-yellow-800 border-yellow-300">
          <Medal className="h-3 w-3 mr-1 text-yellow-600" /> 1st
        </Badge>
      );
    }

    if (rank === 2) {
      return (
        <Badge className="bg-gray-200 text-gray-800 border-gray-300">
          <Medal className="h-3 w-3 mr-1 text-gray-500" /> 2nd
        </Badge>
      );
    }

    if (rank === 3) {
      return (
        <Badge className="bg-amber-100 text-amber-800 border-amber-300">
          <Medal className="h-3 w-3 mr-1 text-amber-600" /> 3rd
        </Badge>
      );
    }

    return <Badge variant="outline">{rank}th</Badge>;
  };

  // Calculate highest score for relative comparison
  const highestAvgScore =
    rankings.length > 0
      ? Math.max(...rankings.map((t) => t.stats.averageScore))
      : 100;

  // Sort rankings by rank (unranked last)
  const sortedRankings = [...rankings].sort((a, b) => {
    if (a.rank === 0) return 1;
    if (b.rank === 0) return -1;
    return a.rank - b.rank;
  });

  return (
    <div className="container mx-auto py-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div className="flex items-center">
          <Button
            variant="ghost"
            onClick={() => router.push("/admin/cohort")}
            className="mr-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold flex items-center">
              <Award className="mr-2 h-6 w-6" />
              Teacher Rankings
            </h1>
            {cohort && (
              <p className="text-muted-foreground">
                {cohort.name} - {cohort.region}
              </p>
            )}
          </div>
        </div>
        <Button
          onClick={updateRankings}
          disabled={isUpdating}
          className="flex-shrink-0"
        >
          {isUpdating ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Updating Rankings...
            </>
          ) : (
            <>
              <RefreshCw className="mr-2 h-4 w-4" />
              Update Rankings
            </>
          )}
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Teacher Performance Rankings</CardTitle>
          <CardDescription>
            Rankings are based on average scores and number of student responses
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center items-center py-8">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : rankings.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">No teacher rankings available</p>
              <p className="text-sm text-muted-foreground mt-2">
                Teachers need to have evaluated responses to be ranked
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Rank</TableHead>
                    <TableHead>Teacher</TableHead>
                    <TableHead>Anganwadi</TableHead>
                    <TableHead>Response Count</TableHead>
                    <TableHead>Average Score</TableHead>
                    <TableHead>Performance</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedRankings.map((teacher) => (
                    <TableRow key={teacher.id}>
                      <TableCell>{getRankBadge(teacher.rank)}</TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <User className="h-4 w-4 mr-2 text-gray-400" />
                          <div>
                            <div className="font-medium">{teacher.name}</div>
                            <div className="text-sm text-muted-foreground">
                              {teacher.phone}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {teacher.anganwadi ? (
                          <div className="flex items-center">
                            <School className="h-4 w-4 mr-2 text-gray-400" />
                            {teacher.anganwadi.name}
                          </div>
                        ) : (
                          <span className="text-gray-400">Not assigned</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <FileText className="h-4 w-4 mr-2 text-gray-400" />
                          {teacher.stats.responseCount}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">
                          {teacher.stats.averageScore.toFixed(1)}%
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="w-40">
                          <Progress
                            value={
                              (teacher.stats.averageScore / highestAvgScore) *
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
