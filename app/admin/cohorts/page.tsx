"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
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
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import {
  Users,
  Plus,
  Trash2,
  Award,
  ChevronRight,
  Loader2,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import API from "@/utils/axiosInstance";
import { API_URL } from "@/lib/config";

interface Teacher {
  id: string;
  name: string;
  phone: string;
  anganwadi?: {
    id: string;
    name: string;
  };
}

interface Cohort {
  id: string;
  name: string;
  region: string;
  teachers: Teacher[];
}

export default function CohortPage() {
  const router = useRouter();
  const [cohorts, setCohorts] = useState<Cohort[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    region: "",
    teacherIds: [] as string[],
  });

  // Fetch cohorts and teachers
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [cohortsRes, teachersRes] = await Promise.all([
          fetch(`${API_URL}cohorts`),
          fetch(`${API_URL}teachers`),
        ]);

        if (!cohortsRes.ok || !teachersRes.ok) {
          throw new Error("Failed to fetch data");
        }

        const cohortsData = await cohortsRes.json();
        const teachersData = await teachersRes.json();

        setCohorts(cohortsData);
        setTeachers(teachersData);
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error("Failed to load data");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const resetForm = () => {
    setFormData({
      name: "",
      region: "",
      teacherIds: [],
    });
  };

  const handleCreateCohort = async () => {
    if (!formData.name || !formData.region) {
      toast.error("Name and region are required");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch(`${API_URL}cohorts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create cohort");
      }

      toast.success("Cohort created successfully");

      // Refresh cohorts data
      const cohortsRes = await fetch(`${API_URL}cohorts`);
      const cohortsData = await cohortsRes.json();
      setCohorts(cohortsData);

      // Reset form and close dialog
      resetForm();
      setShowForm(false);
    } catch (error: any) {
      console.error("Error creating cohort:", error);
      toast.error(error.message || "Failed to create cohort");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteCohort = async (id: string) => {
    if (!confirm("Are you sure you want to delete this cohort?")) {
      return;
    }

    try {
      const response = await fetch(`${API_URL}cohorts/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete cohort");
      }

      toast.success("Cohort deleted successfully");
      setCohorts(cohorts.filter((cohort) => cohort.id !== id));
    } catch (error) {
      console.error("Error deleting cohort:", error);
      toast.error("Failed to delete cohort");
    }
  };

  const handleTeacherSelection = (teacherId: string) => {
    setFormData((prev) => {
      // If the teacher is already selected, remove them
      if (prev.teacherIds.includes(teacherId)) {
        return {
          ...prev,
          teacherIds: prev.teacherIds.filter((id) => id !== teacherId),
        };
      }
      // Otherwise, add them
      return {
        ...prev,
        teacherIds: [...prev.teacherIds, teacherId],
      };
    });
  };

  const viewTeacherRankings = (cohortId: string) => {
    router.push(`/admin/cohorts/${cohortId}/rankings`);
  };

  // Filter teachers that are not already assigned to a cohort
  const availableTeachers = teachers.filter(
    (teacher) =>
      !cohorts.some((cohort) =>
        cohort.teachers.some((t) => t.id === teacher.id)
      )
  );

  return (
    <div className="container mx-auto px-4 py-4 md:py-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h1 className="text-xl md:text-2xl font-bold flex items-center">
          <Users className="mr-2 h-5 md:h-6 w-5 md:w-6" /> Cohort Management
        </h1>
        <Dialog open={showForm} onOpenChange={setShowForm}>
          <DialogTrigger asChild>
            <Button className="w-full sm:w-auto flex items-center">
              <Plus className="mr-2 h-4 w-4" /> Add Cohort
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-[95vw] sm:max-w-md p-4 md:p-6">
            <DialogHeader>
              <DialogTitle>Create New Cohort</DialogTitle>
              <DialogDescription>
                Add a new cohort and assign teachers
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <label htmlFor="name" className="text-sm font-medium">
                  Cohort Name
                </label>
                <Input
                  id="name"
                  placeholder="Enter cohort name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                />
              </div>

              <div className="grid gap-2">
                <label htmlFor="region" className="text-sm font-medium">
                  Region
                </label>
                <Input
                  id="region"
                  placeholder="Enter region"
                  value={formData.region}
                  onChange={(e) =>
                    setFormData({ ...formData, region: e.target.value })
                  }
                />
              </div>

              <div className="grid gap-2">
                <label className="text-sm font-medium">Assign Teachers</label>
                {availableTeachers.length === 0 ? (
                  <p className="text-sm text-gray-500">
                    No available teachers to assign
                  </p>
                ) : (
                  <div className="max-h-40 overflow-y-auto border rounded-md p-2">
                    {availableTeachers.map((teacher) => (
                      <div
                        key={teacher.id}
                        className="flex items-center gap-2 p-2 hover:bg-gray-50 border-b last:border-b-0"
                      >
                        <input
                          type="checkbox"
                          id={`teacher-${teacher.id}`}
                          checked={formData.teacherIds.includes(teacher.id)}
                          onChange={() => handleTeacherSelection(teacher.id)}
                          className="h-4 w-4 rounded border-gray-300"
                        />
                        <label
                          htmlFor={`teacher-${teacher.id}`}
                          className="text-sm flex-1 min-w-0"
                        >
                          <span className="block truncate">{teacher.name}</span>
                          {teacher.anganwadi && (
                            <span className="text-xs text-gray-500 block truncate">
                              {teacher.anganwadi.name}
                            </span>
                          )}
                        </label>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <DialogFooter>
              <Button 
                onClick={handleCreateCohort} 
                disabled={isSubmitting}
                className="w-full sm:w-auto"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Create Cohort"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Cohorts</CardTitle>
        </CardHeader>
        <CardContent className="p-0 sm:p-6">
          {isLoading ? (
            <div className="flex justify-center items-center py-8">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : cohorts.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">No cohorts found</p>
              <Button
                variant="link"
                onClick={() => setShowForm(true)}
                className="mt-2"
              >
                Create your first cohort
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead className="hidden sm:table-cell">Region</TableHead>
                    <TableHead className="hidden md:table-cell">Teachers</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {cohorts.map((cohort) => (
                    <TableRow key={cohort.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{cohort.name}</div>
                          <div className="sm:hidden text-sm text-gray-500">
                            {cohort.region}
                          </div>
                          <div className="md:hidden text-sm text-gray-500 mt-1">
                            {cohort.teachers.length > 0 ? (
                              <div className="flex flex-wrap gap-1">
                                {cohort.teachers.map((teacher) => (
                                  <Badge
                                    key={teacher.id}
                                    variant="outline"
                                    className="bg-gray-100 text-xs"
                                  >
                                    {teacher.name}
                                  </Badge>
                                ))}
                              </div>
                            ) : (
                              <span className="text-gray-500 text-sm">
                                No teachers
                              </span>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">
                        {cohort.region}
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <div className="flex flex-wrap gap-1">
                          {cohort.teachers.length > 0 ? (
                            cohort.teachers.map((teacher) => (
                              <Badge
                                key={teacher.id}
                                variant="outline"
                                className="bg-gray-100"
                              >
                                {teacher.name}
                              </Badge>
                            ))
                          ) : (
                            <span className="text-gray-500 text-sm">
                              No teachers assigned
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex flex-col sm:flex-row justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => viewTeacherRankings(cohort.id)}
                            className="w-full sm:w-auto text-xs sm:text-sm"
                          >
                            <Award className="h-4 w-4 mr-2" />
                            <span className="hidden sm:inline">Rankings</span>
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDeleteCohort(cohort.id)}
                            className="w-full sm:w-auto text-xs sm:text-sm"
                          >
                            <Trash2 className="h-4 w-4 sm:mr-2" />
                            <span className="hidden sm:inline">Delete</span>
                          </Button>
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
