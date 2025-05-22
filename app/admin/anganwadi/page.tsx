"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import API_URL from "@/utils/axiosInstance";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { AnganwadiForm } from "@/components/AnganwadiForm";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import StudentCombobox from "@/components/StudentCombobox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import {
  checkAnganwadiDependencies,
  deleteAnganwadi,
  removeAnganwadiDependencies,
  removeAllStudentsFromAnganwadi,
} from "@/app/api/api";

interface Anganwadi {
  id: string;
  name: string;
  location: string;
  district: string;
  teacher: { name: string; phone: string } | null;
  students: { id: string; name: string }[];
}

export default function AnganwadiPage() {
  const [anganwadis, setAnganwadis] = useState<Anganwadi[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [selectedAnganwadi, setSelectedAnganwadi] = useState<Anganwadi | null>(
    null
  );
  const [showStudentDialog, setShowStudentDialog] = useState(false);
  const [studentIds, setStudentIds] = useState<string[]>([]);
  const [students, setStudents] = useState([{ name: "", gender: "" }]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const fetchAnganwadis = async () => {
    const res = await fetch(`https://api.dreamlaunch.studio/api/anganwadis`);
    const data = await res.json();
    setAnganwadis(data);
  };

  useEffect(() => {
    fetchAnganwadis();
  }, []);

  useEffect(() => {
    // Reset student form when dialog opens
    if (showStudentDialog && selectedAnganwadi) {
      // Initialize with existing student IDs if any
      const ids = selectedAnganwadi.students?.map((s) => s.id) || [];
      setStudentIds(ids);
      setStudents([{ name: "", gender: "" }]);
    }
  }, [showStudentDialog, selectedAnganwadi]);

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent row click navigation

    try {
      // First check if anganwadi has dependencies
      const dependencies = await checkAnganwadiDependencies(id);

      if (dependencies.hasDependencies) {
        const confirmRemoveDependencies = window.confirm(
          `Cannot delete this Anganwadi:\n${dependencies.details}\n\nWould you like to remove all dependencies and then delete this Anganwadi?`
        );

        if (confirmRemoveDependencies) {
          try {
            // Remove all dependencies
            const result = await removeAnganwadiDependencies(id);
            alert(`Dependencies removed: ${JSON.stringify(result.removed)}`);

            // Now try to delete again
            const confirmDeleteAfterCleanup = window.confirm(
              "Dependencies have been removed. Proceed with deleting the Anganwadi?"
            );

            if (confirmDeleteAfterCleanup) {
              await deleteAnganwadi(id);
              fetchAnganwadis();
            }
          } catch (error: any) {
            console.error("Error removing dependencies:", error);
            alert(
              "Failed to remove dependencies: " +
                (error.response?.data?.error || error.message)
            );
          }
        }
        return;
      }

      // If no dependencies, confirm and proceed with deletion
      if (window.confirm("Are you sure you want to delete this Anganwadi?")) {
        await deleteAnganwadi(id);
        fetchAnganwadis();
      }
    } catch (error: any) {
      console.error("Error during Anganwadi deletion:", error);

      // Handle API errors
      const errorMessage =
        error.response?.data?.error ||
        "Failed to delete. This Anganwadi may have assessments or other dependencies.";
      alert(errorMessage);
    }
  };

  const handleStudentChange = (
    index: number,
    field: "name" | "gender",
    value: string
  ) => {
    const newStudents = [...students];
    newStudents[index][field] = value;
    setStudents(newStudents);
  };

  const addStudent = () => {
    setStudents([...students, { name: "", gender: "" }]);
  };

  const removeStudent = (index: number) => {
    if (students.length === 1 && index === 0) return;
    setStudents(students.filter((_, i) => i !== index));
  };

  const handleStudentSubmit = async () => {
    if (!selectedAnganwadi) return;

    const hasInvalidNewStudent =
      students.length > 1 &&
      students.some(
        (s, index) =>
          index > 0 && (s.name.trim() === "" || s.gender.trim() === "")
      );
    const isFirstRowEmpty =
      students.length === 1 &&
      students[0].name.trim() === "" &&
      students[0].gender.trim() === "";

    if (hasInvalidNewStudent) {
      console.error("New students must have a name and gender.");
      alert("New students must have a name and gender.");
      return;
    }

    const validNewStudents = students.filter((s, index) => {
      if (index === 0 && students.length === 1 && isFirstRowEmpty) return false;
      if (s.name.trim() === "" && s.gender.trim() === "") return false;
      return true;
    });

    setLoading(true);
    const res = await fetch(
      `https://api.dreamlaunch.studio/api/anganwadis/${selectedAnganwadi.id}`,
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentIds,
          students: validNewStudents,
        }),
      }
    );
    setLoading(false);

    if (res.ok) {
      setShowStudentDialog(false);
      fetchAnganwadis();
    } else {
      console.error("Failed to add students to Anganwadi");
    }
  };

  return (
    <div className="p-8">
      <Card className="mb-6">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-2xl">Anganwadi Centers</CardTitle>
          <Dialog>
            <DialogTrigger asChild>
              <Button>{showForm ? "Close Form" : "Add New"}</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogTitle>Add New Anganwadi</DialogTitle>
              <DialogDescription>
                Fill in the details below to add a new Anganwadi center.
              </DialogDescription>
              <AnganwadiForm onSuccess={fetchAnganwadis} />
            </DialogContent>
          </Dialog>
        </CardHeader>
      </Card>

      {/* Students Management Dialog */}
      <Dialog open={showStudentDialog} onOpenChange={setShowStudentDialog}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogTitle>Manage Students</DialogTitle>
          <DialogDescription>
            {selectedAnganwadi &&
              `Add or update students for ${selectedAnganwadi.name}`}
          </DialogDescription>

          <Card className="w-full mx-auto border rounded-lg shadow-sm">
            <CardContent className="p-4">
              <div className="space-y-4">
                {/* Connect Existing Students */}
                <div>
                  <h3 className="text-lg font-medium mb-3">
                    Connect Existing Students
                  </h3>
                  <StudentCombobox
                    selected={studentIds}
                    setSelected={setStudentIds}
                  />
                  {selectedAnganwadi &&
                    selectedAnganwadi.students &&
                    selectedAnganwadi.students.length > 0 && (
                      <div className="mt-3">
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-red-600 border-red-300 hover:bg-red-50 hover:text-red-700"
                          onClick={async () => {
                            if (
                              window.confirm(
                                `Are you sure you want to remove all ${selectedAnganwadi.students.length} students from this Anganwadi?`
                              )
                            ) {
                              try {
                                await removeAllStudentsFromAnganwadi(
                                  selectedAnganwadi.id
                                );
                                setStudentIds([]);
                                alert("All students have been removed");
                                fetchAnganwadis();
                              } catch (error: any) {
                                console.error(
                                  "Error removing students:",
                                  error
                                );
                                alert(
                                  "Failed to remove students: " +
                                    (error.response?.data?.error ||
                                      error.message)
                                );
                              }
                            }
                          }}
                        >
                          Remove All Students
                        </Button>
                      </div>
                    )}
                </div>

                {/* Create New Students */}
                <div className="pt-4 border-t">
                  <h3 className="text-lg font-medium mb-4">
                    Create New Students
                  </h3>
                  <ScrollArea className="h-72 w-full rounded-md border p-4 mb-4">
                    <div className="space-y-4">
                      {students.map((student, index) => (
                        <div
                          key={index}
                          className="space-y-3 p-4 border rounded-md"
                        >
                          <div className="flex justify-between items-center mb-2">
                            <p className="text-sm font-medium text-gray-600">
                              New Student {index + 1}
                            </p>
                            {(index > 0 || students.length > 1) && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => removeStudent(index)}
                                className="text-red-600 hover:bg-red-50 hover:text-red-700 h-auto p-1"
                              >
                                Remove
                              </Button>
                            )}
                          </div>

                          <div className="space-y-2">
                            <div>
                              <label className="text-xs font-medium text-gray-600 block mb-1">
                                Name
                              </label>
                              <Input
                                placeholder="Student Name"
                                value={student.name}
                                onChange={(e) =>
                                  handleStudentChange(
                                    index,
                                    "name",
                                    e.target.value
                                  )
                                }
                                className="w-full bg-white"
                              />
                            </div>
                            <div>
                              <label className="text-xs font-medium text-gray-600 block mb-1">
                                Gender
                              </label>
                              <Select
                                onValueChange={(value) =>
                                  handleStudentChange(index, "gender", value)
                                }
                                value={student.gender}
                              >
                                <SelectTrigger className="w-full bg-white">
                                  <SelectValue placeholder="Select Gender" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="MALE">Male</SelectItem>
                                  <SelectItem value="FEMALE">Female</SelectItem>
                                  <SelectItem value="OTHER">Other</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                  <Button
                    variant="outline"
                    onClick={addStudent}
                    className="w-full sm:w-auto"
                  >
                    Add Another New Student
                  </Button>
                </div>

                {/* Submit Button */}
                <div className="pt-6 border-t">
                  <Button
                    onClick={handleStudentSubmit}
                    className="w-full"
                    disabled={loading}
                  >
                    {loading ? "Saving..." : "Save Students"}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </DialogContent>
      </Dialog>

      <Card>
        <CardHeader>
          <CardTitle>All Centers</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Taluk</TableHead>
                <TableHead>District</TableHead>
                <TableHead>Teacher</TableHead>
                <TableHead>Students</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {anganwadis.length > 0 ? (
                anganwadis.map((a) => (
                  <TableRow
                    key={a.id}
                    className="cursor-pointer hover:bg-muted transition"
                  >
                    <TableCell
                      onClick={() => router.push(`/admin/anganwadi/${a.id}`)}
                    >
                      {a.name}
                    </TableCell>
                    <TableCell
                      onClick={() => router.push(`/admin/anganwadi/${a.id}`)}
                    >
                      {a.location}
                    </TableCell>
                    <TableCell
                      onClick={() => router.push(`/admin/anganwadi/${a.id}`)}
                    >
                      {a.district}
                    </TableCell>
                    <TableCell
                      onClick={() => router.push(`/admin/anganwadi/${a.id}`)}
                    >
                      {a.teacher
                        ? `${a.teacher.name} (${a.teacher.phone})`
                        : "Not assigned"}
                    </TableCell>
                    <TableCell
                      onClick={() => router.push(`/admin/anganwadi/${a.id}`)}
                    >
                      {a.students.length > 0
                        ? a.students.map((s) => s.name).join(", ")
                        : "No students"}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedAnganwadi(a);
                            setShowStudentDialog(true);
                          }}
                        >
                          Add Students
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={(e) => handleDelete(a.id, e)}
                        >
                          Delete
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="text-center text-muted-foreground"
                  >
                    No anganwadis found.
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
