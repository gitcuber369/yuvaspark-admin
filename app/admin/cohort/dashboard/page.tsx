"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Medal,
  Users,
  BarChart4,
  PieChart,
  Award,
  School,
  ChevronRight,
  Loader2,
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

interface Cohort {
  id: string;
  name: string;
  region: string;
  teachers: Teacher[];
}

interface Teacher {
  id: string;
  name: string;
  phone: string;
  rank?: number;
  anganwadi?: {
    id: string;
    name: string;
  };
  stats?: {
    responseCount: number;
    averageScore: number;
  };
}

export default function CohortDashboardPage() {
  const router = useRouter();
  const [cohorts, setCohorts] = useState<Cohort[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [topTeachers, setTopTeachers] = useState<Teacher[]>([]);
  const [selectedCohort, setSelectedCohort] = useState<string>("all");
  
  useEffect(() => {
    const fetchCohorts = async () => {
      setIsLoading(true);
      try {
        const res = await fetch("https://0dd7-2401-4900-1cd7-672e-f883-6669-8e54-fbef.ngrok-free.app/api/cohorts");
        if (!res.ok) throw new Error("Failed to fetch cohorts");
        const data = await res.json();
        setCohorts(data);
        
        // Fetch top teachers from all cohorts
        await fetchTopTeachers("all");
      } catch (error) {
        console.error("Error loading dashboard:", error);
        toast.error("Failed to load dashboard data");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchCohorts();
  }, []);
  
  const fetchTopTeachers = async (cohortId: string) => {
    try {
      setSelectedCohort(cohortId);
      let teachers: Teacher[] = [];
      
      if (cohortId === "all") {
        // Get top teachers from all cohorts
        const allTeachersPromises = cohorts.map(cohort => 
          fetch(`https://0dd7-2401-4900-1cd7-672e-f883-6669-8e54-fbef.ngrok-free.app/api/cohorts/${cohort.id}/rankings`)
            .then(res => res.ok ? res.json() : [])
        );
        
        const allTeachersResults = await Promise.all(allTeachersPromises);
        teachers = allTeachersResults.flat();
      } else {
        // Get teachers from specific cohort
        const res = await fetch(`https://0dd7-2401-4900-1cd7-672e-f883-6669-8e54-fbef.ngrok-free.app/api/cohorts/${cohortId}/rankings`);
        if (res.ok) {
          teachers = await res.json();
        }
      }
      
      // Filter out unranked teachers (rank = 0) and sort by rank
      const rankedTeachers = teachers
        .filter(t => t.rank !== 0)
        .sort((a, b) => (a.rank || 999) - (b.rank || 999));
      
      // Take top 5
      setTopTeachers(rankedTeachers.slice(0, 5));
    } catch (error) {
      console.error("Error fetching top teachers:", error);
      toast.error("Failed to load teacher rankings");
    }
  };
  
  // Calculate stats
  const totalTeachers = cohorts.reduce((sum, cohort) => sum + cohort.teachers.length, 0);
  const totalAnganwadis = cohorts.reduce((sum, cohort) => {
    // Count unique anganwadis
    const anganwadiIds = new Set(
      cohort.teachers
        .filter(t => t.anganwadi)
        .map(t => t.anganwadi?.id)
    );
    return sum + anganwadiIds.size;
  }, 0);

  return (
    <div className="container mx-auto py-8">
      <div className="flex items-center mb-6">
        <h1 className="text-2xl font-bold flex items-center">
          <BarChart4 className="mr-2 h-6 w-6" /> Cohort Dashboard
        </h1>
      </div>
      
      {isLoading ? (
        <div className="flex justify-center items-center py-16">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <Card>
              <CardContent className="flex items-center justify-between p-6">
                <div className="flex items-center space-x-4">
                  <Users className="h-10 w-10 text-primary/70" />
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Cohorts</p>
                    <h3 className="text-2xl font-bold">{cohorts.length}</h3>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="flex items-center justify-between p-6">
                <div className="flex items-center space-x-4">
                  <Award className="h-10 w-10 text-primary/70" />
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Teachers</p>
                    <h3 className="text-2xl font-bold">{totalTeachers}</h3>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="flex items-center justify-between p-6">
                <div className="flex items-center space-x-4">
                  <School className="h-10 w-10 text-primary/70" />
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Anganwadis</p>
                    <h3 className="text-2xl font-bold">{totalAnganwadis}</h3>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="col-span-1 md:col-span-2">
              <CardHeader>
                <CardTitle>Top Performing Teachers</CardTitle>
                <CardDescription>
                  View top ranked teachers based on student response scores
                </CardDescription>
                <Tabs 
                  value={selectedCohort} 
                  onValueChange={(value) => fetchTopTeachers(value)}
                  className="mt-2"
                >
                  <TabsList className="grid grid-cols-2 md:w-[300px]">
                    <TabsTrigger value="all">All Cohorts</TabsTrigger>
                    <TabsTrigger value="select">Select Cohort</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="select" className="mt-2">
                    <select 
                      onChange={(e) => fetchTopTeachers(e.target.value)}
                      className="w-full p-2 border rounded-md"
                    >
                      <option value="">Select a cohort</option>
                      {cohorts.map(cohort => (
                        <option key={cohort.id} value={cohort.id}>
                          {cohort.name} - {cohort.region}
                        </option>
                      ))}
                    </select>
                  </TabsContent>
                </Tabs>
              </CardHeader>
              <CardContent>
                {topTeachers.length === 0 ? (
                  <div className="text-center py-6">
                    <p className="text-muted-foreground">No ranked teachers available</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {topTeachers.map((teacher, index) => (
                      <div key={teacher.id} className="flex items-center">
                        <div className="flex items-center justify-center h-10 w-10 rounded-full bg-primary/10 mr-4">
                          {index === 0 ? (
                            <Medal className="h-5 w-5 text-yellow-500" />
                          ) : index === 1 ? (
                            <Medal className="h-5 w-5 text-gray-400" />
                          ) : index === 2 ? (
                            <Medal className="h-5 w-5 text-amber-600" />
                          ) : (
                            <span className="text-sm font-medium">{index + 1}</span>
                          )}
                        </div>
                        
                        <div className="flex-1">
                          <div className="flex items-center">
                            <h4 className="font-medium">{teacher.name}</h4>
                            <Badge className="ml-2 bg-gray-100 text-gray-800">
                              Rank #{teacher.rank}
                            </Badge>
                          </div>
                          
                          <div className="text-sm text-muted-foreground">
                            {teacher.anganwadi?.name || "No anganwadi"} • 
                            {teacher.stats?.responseCount || 0} responses
                          </div>
                          
                          <div className="flex items-center mt-2">
                            <Progress 
                              value={teacher.stats?.averageScore || 0} 
                              className="h-2 flex-1" 
                            />
                            <span className="ml-2 text-sm font-medium">
                              {teacher.stats?.averageScore.toFixed(1) || 0}%
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Cohorts</CardTitle>
                <CardDescription>
                  View all cohorts and their rankings
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {cohorts.map(cohort => (
                    <div 
                      key={cohort.id} 
                      className="border rounded-md p-4 hover:bg-gray-50 cursor-pointer"
                      onClick={() => router.push(`/admin/cohort/${cohort.id}/rankings`)}
                    >
                      <div className="flex justify-between items-center">
                        <h3 className="font-medium">{cohort.name}</h3>
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {cohort.region}
                      </p>
                      <div className="flex items-center mt-2 text-sm">
                        <Users className="h-4 w-4 mr-1 text-muted-foreground" />
                        <span>{cohort.teachers.length} teachers</span>
                      </div>
                    </div>
                  ))}
                  
                  <Button 
                    variant="outline" 
                    className="w-full mt-2"
                    onClick={() => router.push("/admin/cohort")}
                  >
                    View All Cohorts
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
} 