"use client";

import React, { useEffect, useState } from "react";
import { getTeacherRankings, updateTeacherRankings } from "@/app/api/api";
import { useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowUpDown, Medal, RefreshCw, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

// Define interface for teacher data
interface Teacher {
  id: string;
  name: string;
  phone: string;
  rank: number;
  anganwadi?: {
    id: string;
    name: string;
    location: string;
  };
  stats: {
    responseCount: number;
    averageScore: number;
  };
}

export default function TeacherRankingsPage() {
  const { cohortId } = useParams();
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Function to calculate ranks if API doesn't provide them
  const calculateRanks = (teacherList: Teacher[]): Teacher[] => {
    // Only calculate for teachers with responses
    const activeTeachers = teacherList.filter(t => t.stats.responseCount > 0);
    const unrankedTeachers = teacherList.filter(t => t.stats.responseCount === 0);
    
    // Sort by average score (highest first)
    const sortedTeachers = [...activeTeachers].sort((a, b) => 
      b.stats.averageScore - a.stats.averageScore
    );
    
    // Assign ranks
    const rankedTeachers = sortedTeachers.map((teacher, index) => ({
      ...teacher,
      rank: teacher.rank || (index + 1) // Use existing rank if available, otherwise calculate
    }));
    
    // Return combined list (ranked teachers first, then unranked)
    return [
      ...rankedTeachers,
      ...unrankedTeachers
    ];
  };

  const fetchRankings = async () => {
    setIsLoading(true);
    try {
      console.log(`Fetching rankings for cohort ID: ${cohortId}`);
      const data = await getTeacherRankings(cohortId as string);
      console.log("Received data:", data);
      
      // Check if the data is in the expected format
      if (Array.isArray(data)) {
        // Check if we need to calculate ranks ourselves
        const allUnranked = data.every(teacher => teacher.rank === 0);
        const hasResponses = data.some(teacher => teacher.stats.responseCount > 0);
        
        if (allUnranked && hasResponses) {
          // If API returned all teachers with rank 0 but some have responses,
          // we can calculate ranks ourselves
          console.log("Calculating ranks locally as API returned all unranked teachers");
          const rankedTeachers = calculateRanks(data);
          setTeachers(rankedTeachers);
        } else {
          setTeachers(data);
        }
        
        // Log if teachers have no ranks
        const unrankedTeachers = data.filter(teacher => teacher.rank === 0);
        if (unrankedTeachers.length > 0) {
          console.log(`Warning: ${unrankedTeachers.length} teachers have rank 0:`, 
            unrankedTeachers.map(t => t.name));
        }
      } else {
        console.error("Unexpected data format:", data);
        setError("Received invalid data format from server");
        setTeachers([]);
      }
    } catch (err) {
      console.error("Error fetching teacher rankings:", err);
      setError("Failed to load teacher rankings. Please try again later.");
      setTeachers([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (cohortId) {
      fetchRankings();
    }
  }, [cohortId]);

  const handleUpdateRankings = async () => {
    if (!cohortId) return;
    
    setIsUpdating(true);
    try {
      console.log(`Updating rankings for cohort ID: ${cohortId}`);
      const result = await updateTeacherRankings(cohortId as string);
      console.log("Update result:", result);
      toast.success("Teacher rankings updated successfully");
      await fetchRankings(); // Refresh the data
    } catch (err) {
      console.error("Error updating rankings:", err);
      toast.error("Failed to update rankings. Please try again.");
    } finally {
      setIsUpdating(false);
    }
  };

  // Function to render medal based on rank
  const getRankBadge = (rank: number) => {
    if (rank === 1) return <Medal className="h-5 w-5 text-yellow-500" />;
    if (rank === 2) return <Medal className="h-5 w-5 text-gray-400" />;
    if (rank === 3) return <Medal className="h-5 w-5 text-amber-700" />;
    return rank;
  };

  // Function to format score as percentage with 2 decimal places
  const formatScore = (score: number) => {
    return (score * 100).toFixed(2) + "%";
  };

  // Function to get reason for no ranking
  const getUnrankedReason = (teacher: Teacher) => {
    if (teacher.stats.responseCount === 0) {
      return "No student responses";
    } else if (teacher.stats.averageScore === 0) {
      return "Zero average score";
    } else {
      return "Needs ranking update";
    }
  };

  return (
    <div className="container mx-auto py-6">
      <Card className="w-full">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-2xl font-bold">Teacher Rankings</CardTitle>
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleUpdateRankings}
            disabled={isUpdating}
            className="flex items-center gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${isUpdating ? 'animate-spin' : ''}`} />
            {isUpdating ? 'Updating...' : 'Update Rankings'}
          </Button>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            // Loading skeleton
            <div className="space-y-3">
              {Array(5)
                .fill(0)
                .map((_, i) => (
                  <Skeleton key={i} className="w-full h-12" />
                ))}
            </div>
          ) : error ? (
            // Error state
            <div className="text-center py-8 text-red-500">{error}</div>
          ) : teachers.length === 0 ? (
            // Empty state
            <div className="text-center py-8 text-gray-500">
              No teachers with rankings found in this cohort.
            </div>
          ) : (
            // Rankings table
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-16">Rank</TableHead>
                  <TableHead>Teacher</TableHead>
                  <TableHead>Anganwadi</TableHead>
                  <TableHead className="text-right">
                    <div className="flex items-center justify-end">
                      Responses
                      <ArrowUpDown className="ml-2 h-4 w-4" />
                    </div>
                  </TableHead>
                  <TableHead className="text-right">
                    <div className="flex items-center justify-end">
                      Avg. Score
                      <ArrowUpDown className="ml-2 h-4 w-4" />
                    </div>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {/* Sort teachers: ranked teachers first, then unranked teachers */}
                {[...teachers]
                  .sort((a, b) => {
                    // If both have rank 0 or both have non-zero rank, sort by averageScore
                    if ((a.rank === 0 && b.rank === 0) || (a.rank > 0 && b.rank > 0)) {
                      return b.stats.averageScore - a.stats.averageScore;
                    }
                    // Put teachers with rank 0 at the bottom
                    return a.rank === 0 ? 1 : b.rank === 0 ? -1 : a.rank - b.rank;
                  })
                  .map((teacher, index) => (
                    <TableRow key={teacher.id}>
                      <TableCell className="font-medium">
                        {teacher.rank === 0 ? (
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <div className="flex items-center">
                                  <Badge variant="outline" className="mr-1">Unranked</Badge>
                                  <Info className="h-4 w-4 text-gray-400" />
                                </div>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>{getUnrankedReason(teacher)}</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        ) : (
                          <div className="flex items-center">
                            {getRankBadge(teacher.rank)}
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">{teacher.name}</div>
                        <div className="text-sm text-gray-500">{teacher.phone}</div>
                      </TableCell>
                      <TableCell>{teacher.anganwadi?.name || "Not assigned"}</TableCell>
                      <TableCell className="text-right">
                        {teacher.stats.responseCount}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className={`font-medium ${
                          teacher.stats.averageScore >= 0.8
                            ? "text-green-600"
                            : teacher.stats.averageScore >= 0.6
                            ? "text-yellow-600"
                            : "text-red-600"
                        }`}>
                          {formatScore(teacher.stats.averageScore)}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Add a troubleshooting section if needed */}
      {!isLoading && teachers.length > 0 && teachers.every(t => t.rank === 0) && (
        <Card className="w-full mt-4">
          <CardHeader>
            <CardTitle className="text-xl text-amber-600">No Rankings Available</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-2">
              All teachers are currently unranked. This may happen if:
            </p>
            <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
              <li>Teachers haven't submitted any evaluations yet</li>
              <li>No student responses have been graded</li>
              <li>There was an error calculating ranks on the server</li>
            </ul>
            <div className="mt-4">
              <Button 
                onClick={handleUpdateRankings} 
                variant="default"
                disabled={isUpdating}
              >
                Recalculate Rankings
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
