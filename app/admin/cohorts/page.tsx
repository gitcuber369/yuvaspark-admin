"use client";

import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TableHeader,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";

interface Cohort {
  id: string;
  name: string;
  region: string;
  teachers: {
    id: string;
    name: string | null;
  }[];
}

interface Teacher {
  id: string;
  name: string;
}
export default function CohortAdminPage() {
  const [cohorts, setCohorts] = useState<Cohort[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [name, setName] = useState("");
  const [region, setRegion] = useState("");
  const [selectedTeachers, setSelectedTeachers] = useState<string[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null);
  const [teacherSearch, setTeacherSearch] = useState("");

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [cohortRes, teacherRes] = await Promise.all([
        fetch("http://localhost:3000/api/cohort").then((res) => res.json()),
        fetch("http://localhost:3000/api/teachers").then((res) => res.json()),
      ]);
      setCohorts(cohortRes);
      setTeachers(teacherRes);
    } catch (error) {
      toast.error("Failed to load data");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredTeachers = teachers.filter((teacher) =>
    teacher.name.toLowerCase().includes(teacherSearch.toLowerCase())
  );

  const handleCheckboxChange = (teacherId: string) => {
    setSelectedTeachers((prev) => {
      if (prev.includes(teacherId)) {
        return prev.filter((id) => id !== teacherId);
      } else {
        // Check if adding another teacher would exceed the limit
        if (prev.length >= 25) {
          toast.warning("Maximum of 25 teachers allowed per cohort");
          return prev;
        }
        return [...prev, teacherId];
      }
    });
  };

  const handleCreateCohort = async () => {
    if (!name || !region) {
      toast.error("Name and Region are required.");
      return;
    }

    if (selectedTeachers.length > 25) {
      toast.error("Maximum of 25 teachers allowed per cohort.");
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch("http://localhost:3000/api/cohort", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          region,
          teacherIds: selectedTeachers,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success("Cohort created successfully!");
        setName("");
        setRegion("");
        setSelectedTeachers([]);
        setIsDialogOpen(false);
        fetchData();
      } else {
        toast.error(data?.error || "Failed to create cohort");
      }
    } catch (error) {
      toast.error("An error occurred while creating the cohort");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    setDeleteLoading(id);
    try {
      const res = await fetch(`http://localhost:3000/api/cohort/${id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (res.ok) {
        toast.success("Cohort deleted successfully!");
        fetchData();
      } else {
        toast.error(data?.error || "Failed to delete cohort");
      }
    } catch (error) {
      toast.error("An error occurred while deleting the cohort");
    } finally {
      setDeleteLoading(null);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
          Cohort Management
        </h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="default" className="gap-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="lucide lucide-plus"
              >
                <path d="M12 5v14M5 12h14" />
              </svg>
              Create Cohort
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <div className="space-y-4 py-2">
              <h3 className="text-lg font-medium">Create New Cohort</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Fill in the details below to create a new cohort.
              </p>

              <div className="space-y-2">
                <Label htmlFor="cohort-name">Cohort Name</Label>
                <Input
                  id="cohort-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter cohort name"
                  className="focus-visible:ring-1"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="region">Region</Label>
                <Input
                  id="region"
                  value={region}
                  onChange={(e) => setRegion(e.target.value)}
                  placeholder="Enter region"
                  className="focus-visible:ring-1"
                />
              </div>

              <div className="space-y-2">
                <Label>Assign Teachers (Max 25)</Label>
                <div className="flex justify-between items-center mb-2">
                  <Input
                    placeholder="Search teachers..."
                    value={teacherSearch}
                    onChange={(e) => setTeacherSearch(e.target.value)}
                    className="focus-visible:ring-1"
                  />
                  <span className="text-xs text-gray-500 ml-2">
                    {selectedTeachers.length}/25
                  </span>
                </div>
                <div className="border rounded-md p-3 max-h-48 overflow-auto grid grid-cols-2 gap-3">
                  {teachers.length === 0 ? (
                    <p className="text-sm text-gray-500 col-span-2">
                      No teachers available
                    </p>
                  ) : filteredTeachers.length === 0 ? (
                    <p className="text-sm text-gray-500 col-span-2">
                      No teachers match your search
                    </p>
                  ) : (
                    filteredTeachers.map((t) => (
                      <div
                        key={t.id}
                        className="flex items-center gap-2 p-2 hover:bg-gray-50 dark:hover:bg-gray-800 rounded"
                      >
                        <Checkbox
                          id={`teacher-${t.id}`}
                          checked={selectedTeachers.includes(t.id)}
                          onCheckedChange={() => handleCheckboxChange(t.id)}
                          disabled={
                            !selectedTeachers.includes(t.id) &&
                            selectedTeachers.length >= 25
                          }
                        />
                        <Label
                          htmlFor={`teacher-${t.id}`}
                          className={`cursor-pointer ${
                            !selectedTeachers.includes(t.id) &&
                            selectedTeachers.length >= 25
                              ? "text-gray-400"
                              : ""
                          }`}
                        >
                          {t.name}
                        </Label>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button onClick={handleCreateCohort} disabled={isLoading}>
                  {isLoading ? "Creating..." : "Create Cohort"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="shadow-md">
        <CardHeader className="bg-gray-50 dark:bg-gray-800 rounded-t-lg">
          <CardTitle className="text-xl">All Cohorts</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading && !cohorts.length ? (
            <div className="flex items-center justify-center h-48">
              <p className="text-gray-500">Loading cohorts...</p>
            </div>
          ) : cohorts.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 text-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="48"
                height="48"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-gray-400 mb-2"
              >
                <path d="M17 21h-10a2 2 0 0 1 -2 -2v-14a2 2 0 0 1 2 -2h10a2 2 0 0 1 2 2v14a2 2 0 0 1 -2 2z"></path>
                <path d="M9 7h6"></path>
                <path d="M9 11h6"></path>
                <path d="M9 15h4"></path>
              </svg>
              <p className="text-gray-500 dark:text-gray-400">
                No cohorts found
              </p>
              <Button
                variant="link"
                onClick={() => setIsDialogOpen(true)}
                className="mt-2"
              >
                Create your first cohort
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="w-[200px]">Name</TableHead>
                  <TableHead className="w-[200px]">Region</TableHead>
                  <TableHead>Teachers</TableHead>
                  <TableHead className="text-right w-[100px]">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {cohorts.map((cohort) => (
                  <TableRow
                    key={cohort.id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-800/50"
                  >
                    <TableCell className="font-medium">{cohort.name}</TableCell>
                    <TableCell>{cohort.region}</TableCell>
                    <TableCell>
                      {cohort.teachers.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {cohort.teachers.map((t) => (
                            <span
                              key={t.id}
                              className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
                            >
                              {t.name}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-gray-500">
                          No teachers assigned
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDelete(cohort.id)}
                        disabled={deleteLoading === cohort.id}
                      >
                        {deleteLoading === cohort.id ? "Deleting..." : "Delete"}
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
  );
}
