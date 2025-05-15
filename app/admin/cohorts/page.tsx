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
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Teacher {
  id: string;
  name: string;
}

interface Cohort {
  id: string;
  name: string;
  region: string;
  teachers: Teacher[];
}

export default function CohortsPage() {
  const [cohorts, setCohorts] = useState<Cohort[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [name, setName] = useState("");
  const [region, setRegion] = useState("");
  const [selectedTeachers, setSelectedTeachers] = useState<string[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  const fetchCohorts = async () => {
    try {
      const res = await fetch("http://localhost:3000/api/cohorts");
      if (!res.ok) throw new Error("Failed to fetch cohorts");
      const data = await res.json();
      setCohorts(data);
    } catch (error) {
      toast.error("Failed to load cohorts");
      console.error(error);
    }
  };

  const fetchTeachers = async () => {
    try {
      const res = await fetch("http://localhost:3000/api/teachers");
      if (!res.ok) throw new Error("Failed to fetch teachers");
      const data = await res.json();
      setTeachers(data);
    } catch (error) {
      toast.error("Failed to load teachers");
      console.error(error);
    }
  };

  useEffect(() => {
    fetchCohorts();
    fetchTeachers();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const body = {
        name,
        region,
        teacherIds: selectedTeachers,
      };

      const res = await fetch("http://localhost:3000/api/cohorts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const result = await res.json();
      if (res.ok) {
        toast.success("Cohort created successfully");
        fetchCohorts();
        resetForm();
        setIsOpen(false);
      } else {
        toast.error(result.error || "Failed to create cohort");
      }
    } catch (error) {
      toast.error("An error occurred");
      console.error(error);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`http://localhost:3000/api/cohorts/${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        toast.success("Cohort deleted successfully");
        fetchCohorts();
      } else {
        const result = await res.json();
        toast.error(result.error || "Failed to delete cohort");
      }
    } catch (error) {
      toast.error("An error occurred");
      console.error(error);
    }
  };

  const resetForm = () => {
    setName("");
    setRegion("");
    setSelectedTeachers([]);
  };

  const toggleTeacherSelection = (teacherId: string) => {
    setSelectedTeachers((prev) =>
      prev.includes(teacherId)
        ? prev.filter((id) => id !== teacherId)
        : [...prev, teacherId]
    );
  };

  return (
    <div className="max-w-4xl mx-auto py-10">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Cohorts</CardTitle>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => window.location.href = "/admin/cohorts/rankings"}
            >
              View Teacher Rankings
            </Button>
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
              <DialogTrigger asChild>
                <Button variant="default">Add Cohort</Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogTitle>Create New Cohort</DialogTitle>
                <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                  <div className="space-y-2">
                    <label htmlFor="name" className="text-sm font-medium">
                      Name
                    </label>
                    <Input
                      id="name"
                      placeholder="Cohort name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="region" className="text-sm font-medium">
                      Region
                    </label>
                    <Input
                      id="region"
                      placeholder="Region"
                      value={region}
                      onChange={(e) => setRegion(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">
                      Teachers (Optional)
                    </label>
                    <div className="border rounded-md p-3 max-h-40 overflow-y-auto">
                      {teachers.length > 0 ? (
                        teachers.map((teacher) => (
                          <div
                            key={teacher.id}
                            className="flex items-center space-x-2 py-1"
                          >
                            <input
                              type="checkbox"
                              id={`teacher-${teacher.id}`}
                              checked={selectedTeachers.includes(teacher.id)}
                              onChange={() => toggleTeacherSelection(teacher.id)}
                              className="rounded"
                            />
                            <label htmlFor={`teacher-${teacher.id}`}>
                              {teacher.name}
                            </label>
                          </div>
                        ))
                      ) : (
                        <p className="text-sm text-gray-500">
                          No teachers available
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex justify-end pt-4">
                    <Button type="submit">Create Cohort</Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Region</TableHead>
                <TableHead>Teachers</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {cohorts.length > 0 ? (
                cohorts.map((cohort) => (
                  <TableRow key={cohort.id}>
                    <TableCell className="font-medium">{cohort.name}</TableCell>
                    <TableCell>{cohort.region}</TableCell>
                    <TableCell>
                      {cohort.teachers.length > 0
                        ? cohort.teachers.map((t) => t.name).join(", ")
                        : "No teachers assigned"}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDelete(cohort.id)}
                      >
                        Delete
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={4}
                    className="text-center py-6 text-gray-500"
                  >
                    No cohorts found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
