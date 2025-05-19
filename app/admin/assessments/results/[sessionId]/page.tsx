"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { ArrowLeft, School, Search, Loader2 } from "lucide-react";
import axios from "axios";
import React from "react";
import { API_URL } from "@/lib/config";

// API functions
const getAssessmentSessionById = async (id: string) => {
  const res = await axios.get(`${API_URL}assessment-sessions/${id}`);
  return res.data;
};

const getAnganwadis = async () => {
  const res = await axios.get(`${API_URL}anganwadis`);
  return res.data;
};

interface Anganwadi {
  id: string;
  name: string;
  location?: string;
  district?: string;
  state?: string;
}

// Type definition for params
interface PageParams {
  sessionId: string;
}

// Fixed type definition for Next.js 15.4 Pages
// @ts-ignore - Next.js type mismatch with searchParams
interface PageProps {
  params: Promise<PageParams>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

// @ts-ignore - Suppressing type error between Next.js PageProps types
export default function AssessmentResultsPage({ params }: PageProps) {
  const router = useRouter();

  // Use React.use() to unwrap the params
  const { sessionId } = React.use(params);

  const [loading, setLoading] = useState(true);
  const [assessmentSession, setAssessmentSession] = useState<any>(null);
  const [anganwadis, setAnganwadis] = useState<Anganwadi[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Get session details and anganwadis
        const [sessionData, anganwadisData] = await Promise.all([
          getAssessmentSessionById(sessionId),
          getAnganwadis(),
        ]);

        setAssessmentSession(sessionData);
        setAnganwadis(anganwadisData);
      } catch (error) {
        console.error("Failed to load data:", error);
        toast.error("Failed to load assessment data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [sessionId]);

  const filteredAnganwadis = anganwadis.filter(
    (anganwadi) =>
      anganwadi.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (anganwadi.location &&
        anganwadi.location.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (anganwadi.district &&
        anganwadi.district.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin mr-2" />
        <span>Loading assessment results...</span>
      </div>
    );
  }

  if (!assessmentSession) {
    return (
      <div className="container mx-auto py-8 text-center">
        <h1 className="text-2xl font-bold mb-4">Assessment Not Found</h1>
        <p className="text-gray-500 mb-4">
          The assessment session you're looking for doesn't exist or has been
          removed.
        </p>
        <Button onClick={() => router.push("/admin/assessments")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Assessments
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center mb-6">
        <Button
          variant="outline"
          className="mr-4"
          onClick={() => router.push("/admin/assessments")}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>

        <div>
          <h1 className="text-3xl font-bold">
            {assessmentSession.name} Results
          </h1>
          <p className="text-muted-foreground">
            View assessment results from anganwadis
          </p>
        </div>
      </div>

      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              type="search"
              placeholder="Search anganwadis by name, location..."
              className="pl-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Anganwadi Results</CardTitle>
            <CardDescription>
              View assessment results from all anganwadis
            </CardDescription>
          </CardHeader>
          <CardContent>
            {filteredAnganwadis.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">
                  No anganwadis found with the current filters
                </p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Anganwadi</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAnganwadis.map((anganwadi) => (
                    <TableRow key={anganwadi.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center">
                          <School className="h-4 w-4 mr-2" />
                          {anganwadi.name}
                        </div>
                      </TableCell>
                      <TableCell>
                        {anganwadi.location || "Not specified"}
                        {anganwadi.district && `, ${anganwadi.district}`}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">Pending</Badge>
                      </TableCell>
                      <TableCell>
                        <Button variant="outline" size="sm" disabled>
                          No Data
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
