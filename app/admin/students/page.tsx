"use client";

import { useEffect, useState } from "react";
import { useStudentStore } from "@/app/store/studentStore";
import { useAnganwadiStore } from "@/app/store/anganwadiStore";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Loader2,
  Trash2,
  UserPlus,
  Users,
  Search,
  ChevronRight,
  FileUp,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import CsvImportForm from "@/components/CsvImportForm";
import Link from "next/link";
import { toast } from "sonner";

interface Student {
  id: string;
  name: string;
  gender?: string;
  status?: string;
  anganwadiId?: string;
  anganwadi?: {
    id: string;
    name: string;
  };
}

export default function StudentDashboard() {
  const {
    students,
    loading,
    error,
    fetchStudents,
    addStudent,
    removeStudent,
    updateStudent,
    assignToAnganwadi,
    batchAssignToAnganwadi,
  } = useStudentStore();
  const { anganwadis, fetchAnganwadis } = useAnganwadiStore();

  const [newStudent, setNewStudent] = useState({
    name: "",
    gender: "MALE",
    status: "ACTIVE",
    anganwadiId: "",
  });

  const [searchQuery, setSearchQuery] = useState("");
  const [sortByAnganwadi, setSortByAnganwadi] = useState("none");
  const [anganwadiFilter, setAnganwadiFilter] = useState("all");
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [batchAssignDialogOpen, setBatchAssignDialogOpen] = useState(false);
  const [targetAnganwadiId, setTargetAnganwadiId] = useState("");

  useEffect(() => {
    fetchStudents();
    fetchAnganwadis();
  }, [fetchStudents, fetchAnganwadis]);

  const handleAddStudent = async () => {
    if (!newStudent.name) return;
    try {
      await addStudent({
        name: newStudent.name,
        gender: newStudent.gender,
        status: newStudent.status,
        anganwadiId: newStudent.anganwadiId || undefined,
      });
      toast.success("Student added successfully");
      setNewStudent({
        name: "",
        gender: "MALE",
        status: "ACTIVE",
        anganwadiId: "",
      });
    } catch (error) {
      toast.error("Failed to add student");
      console.error("Error adding student:", error);
    }
  };

  // Get unique anganwadi IDs for filtering
  const uniqueAnganwadis = Array.from(
    students
      .filter((student) => student.anganwadiId)
      .reduce((acc, student) => {
        if (student.anganwadiId && !acc.has(student.anganwadiId)) {
          acc.set(student.anganwadiId, {
            id: student.anganwadiId,
            name: student.anganwadi?.name || student.anganwadiId,
          });
        }
        return acc;
      }, new Map())
      .values()
  );

  const filteredStudents = students.filter((student) => {
    const nameMatch =
      student.name?.toLowerCase().includes(searchQuery.toLowerCase()) || false;
    const anganwadiMatch =
      anganwadiFilter === "all" || student.anganwadiId === anganwadiFilter;
    return nameMatch && anganwadiMatch;
  });

  const sortedStudents =
    sortByAnganwadi === "none"
      ? filteredStudents
      : [...filteredStudents].sort((a, b) =>
          sortByAnganwadi === "asc"
            ? (a.anganwadiId || "").localeCompare(b.anganwadiId || "")
            : (b.anganwadiId || "").localeCompare(a.anganwadiId || "")
        );

  // Handle batch assignment of students to anganwadi
  const handleBatchAssign = async () => {
    if (!targetAnganwadiId || selectedStudents.length === 0) return;

    try {
      await batchAssignToAnganwadi(selectedStudents, targetAnganwadiId);
      toast.success(
        `${selectedStudents.length} students assigned to anganwadi`
      );
      setSelectedStudents([]);
      setBatchAssignDialogOpen(false);
      setTargetAnganwadiId("");
    } catch (error) {
      toast.error("Failed to assign students to anganwadi");
      console.error("Error assigning students:", error);
    }
  };

  // Toggle selection of a student
  const toggleStudentSelection = (studentId: string) => {
    setSelectedStudents((prev) =>
      prev.includes(studentId)
        ? prev.filter((id) => id !== studentId)
        : [...prev, studentId]
    );
  };

  // Select or deselect all visible students
  const toggleSelectAll = () => {
    if (selectedStudents.length === sortedStudents.length) {
      setSelectedStudents([]);
    } else {
      setSelectedStudents(sortedStudents.map((student) => student.id));
    }
  };

  const handleRemoveStudent = async (studentId: string) => {
    try {
      await removeStudent(studentId);
      toast.success("Student removed successfully");
    } catch (error) {
      toast.error("Failed to remove student");
      console.error("Error removing student:", error);
    }
  };

  const handleUpdateStudent = async (
    studentId: string,
    data: Partial<Student>
  ) => {
    try {
      await updateStudent(studentId, data);
      toast.success("Student updated successfully");
    } catch (error) {
      toast.error("Failed to update student");
      console.error("Error updating student:", error);
    }
  };

  const handleAssignToAnganwadi = async (
    studentId: string,
    anganwadiId: string
  ) => {
    try {
      await assignToAnganwadi(studentId, anganwadiId);
      toast.success("Student assigned to anganwadi");
    } catch (error) {
      toast.error("Failed to assign student to anganwadi");
      console.error("Error assigning student:", error);
    }
  };

  return (
    <div className="bg-white min-h-screen">
      <div className="container mx-auto px-4 py-4 md:p-6 space-y-4 md:space-y-6">
        <header className="flex flex-col gap-4 mb-6 pb-4 border-b">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
              Student Management
            </h1>
            <p className="text-sm md:text-base text-gray-500 mt-1">
              Register and manage student records
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Badge className="bg-black text-white h-8 flex items-center">
              {students.length} Students
            </Badge>
            <Button
              variant="outline"
              size="sm"
              onClick={() => fetchStudents()}
              className="border-black text-black hover:bg-gray-100"
            >
              Refresh
            </Button>

            <Link href="/admin/imports">
              <Button
                variant="outline"
                size="sm"
                className="border-black text-black hover:bg-gray-100"
              >
                <FileUp className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Imports</span>
              </Button>
            </Link>

            {selectedStudents.length > 0 && (
              <Button
                size="sm"
                className="bg-blue-600 text-white hover:bg-blue-700 w-full sm:w-auto mt-2 sm:mt-0"
                onClick={() => setBatchAssignDialogOpen(true)}
              >
                Assign {selectedStudents.length} Students
              </Button>
            )}

            <Dialog>
              <DialogTrigger asChild>
                <Button
                  size="sm"
                  className="bg-black text-white hover:bg-gray-800 w-full sm:w-auto mt-2 sm:mt-0"
                >
                  <UserPlus className="h-4 w-4 mr-2" />
                  Add Student
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Add New Student</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      placeholder="Enter student name"
                      value={newStudent.name}
                      onChange={(e) =>
                        setNewStudent({ ...newStudent, name: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="gender">Gender</Label>
                    <Select
                      value={newStudent.gender}
                      onValueChange={(value) =>
                        setNewStudent({ ...newStudent, gender: value })
                      }
                    >
                      <SelectTrigger id="gender">
                        <SelectValue placeholder="Select gender" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="MALE">Male</SelectItem>
                        <SelectItem value="FEMALE">Female</SelectItem>
                        <SelectItem value="OTHER">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="status">Status</Label>
                    <Select
                      value={newStudent.status}
                      onValueChange={(value) =>
                        setNewStudent({ ...newStudent, status: value })
                      }
                    >
                      <SelectTrigger id="status">
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ACTIVE" className="text-green-600">
                          <div className="flex items-center gap-2">
                            <CheckCircle className="w-4 h-4" />
                            <span>Active</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="INACTIVE" className="text-red-600">
                          <div className="flex items-center gap-2">
                            <XCircle className="w-4 h-4" />
                            <span>Inactive</span>
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="anganwadi">Anganwadi</Label>
                    <Select
                      value={newStudent.anganwadiId || "none"}
                      onValueChange={(value) =>
                        setNewStudent({
                          ...newStudent,
                          anganwadiId: value === "none" ? "" : value,
                        })
                      }
                    >
                      <SelectTrigger id="anganwadi">
                        <SelectValue placeholder="Select anganwadi" />
                      </SelectTrigger>
                      <SelectContent className="max-h-60">
                        <SelectItem value="none">None</SelectItem>
                        {anganwadis.map((anganwadi) => (
                          <SelectItem
                            key={anganwadi._id?.toString() || anganwadi.id}
                            value={anganwadi._id?.toString() || anganwadi.id}
                          >
                            {anganwadi.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <DialogFooter className="mt-4">
                  <Button
                    onClick={handleAddStudent}
                    className="w-full bg-black text-white hover:bg-gray-800"
                    disabled={!newStudent.name}
                  >
                    Add Student
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            {/* Batch Assign Dialog */}
            <Dialog
              open={batchAssignDialogOpen}
              onOpenChange={setBatchAssignDialogOpen}
            >
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Assign Students to Anganwadi</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="batch-anganwadi">Select Anganwadi</Label>
                    <Select
                      value={targetAnganwadiId}
                      onValueChange={setTargetAnganwadiId}
                    >
                      <SelectTrigger id="batch-anganwadi">
                        <SelectValue placeholder="Select anganwadi" />
                      </SelectTrigger>
                      <SelectContent className="max-h-60">
                        {anganwadis.map((anganwadi) => (
                          <SelectItem
                            key={anganwadi._id?.toString() || anganwadi.id}
                            value={anganwadi._id?.toString() || anganwadi.id}
                          >
                            {anganwadi.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-md">
                    <p className="text-sm text-gray-600">
                      Selected {selectedStudents.length} student
                      {selectedStudents.length !== 1 ? "s" : ""}
                    </p>
                  </div>
                </div>
                <DialogFooter className="mt-4">
                  <Button
                    variant="outline"
                    onClick={() => setBatchAssignDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleBatchAssign}
                    className="bg-black text-white hover:bg-gray-800"
                    disabled={
                      !targetAnganwadiId ||
                      selectedStudents.length === 0 ||
                      loading
                    }
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Assigning...
                      </>
                    ) : (
                      "Assign Students"
                    )}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </header>

        <Tabs defaultValue="students" className="w-full">
          <TabsList className="mb-6 w-full flex">
            <TabsTrigger value="students" className="flex-1">
              Students Directory
            </TabsTrigger>
            <TabsTrigger value="import" className="flex-1">
              CSV Import
            </TabsTrigger>
          </TabsList>

          <TabsContent value="students">
            <Card className="border shadow-sm">
              <CardHeader className="pb-3">
                <div className="flex flex-col gap-4">
                  <div className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    <CardTitle className="text-lg md:text-xl font-semibold">
                      Students Directory
                    </CardTitle>
                  </div>
                  <div className="flex flex-col gap-2 w-full">
                    <div className="relative w-full">
                      <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
                      <Input
                        className="pl-8 w-full"
                        placeholder="Search students..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                    </div>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <Select
                        value={anganwadiFilter}
                        onValueChange={(val) => setAnganwadiFilter(val)}
                      >
                        <SelectTrigger className="w-full sm:w-48">
                          <SelectValue placeholder="Filter by Anganwadi" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Anganwadis</SelectItem>
                          {uniqueAnganwadis.map((anganwadi) => (
                            <SelectItem key={anganwadi.id} value={anganwadi.id}>
                              {anganwadi.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Select
                        value={sortByAnganwadi}
                        onValueChange={(val) => setSortByAnganwadi(val)}
                      >
                        <SelectTrigger className="w-full sm:w-48">
                          <SelectValue placeholder="Sort by Anganwadi" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">None</SelectItem>
                          <SelectItem value="asc">Anganwadi (A → Z)</SelectItem>
                          <SelectItem value="desc">
                            Anganwadi (Z → A)
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                {/* Batch selection controls */}
                {sortedStudents.length > 0 && (
                  <div className="flex items-center gap-2 mt-4">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="select-all"
                        className="h-4 w-4 rounded border-gray-300 text-black focus:ring-black"
                        checked={
                          selectedStudents.length === sortedStudents.length &&
                          sortedStudents.length > 0
                        }
                        onChange={toggleSelectAll}
                      />
                      <label
                        htmlFor="select-all"
                        className="ml-2 text-sm text-gray-600"
                      >
                        Select All ({sortedStudents.length})
                      </label>
                    </div>
                    {selectedStudents.length > 0 && (
                      <span className="text-sm text-gray-500 ml-4">
                        {selectedStudents.length} student
                        {selectedStudents.length !== 1 ? "s" : ""} selected
                      </span>
                    )}
                  </div>
                )}
              </CardHeader>
              <Separator />
              <CardContent className="p-4 md:p-6">
                {loading ? (
                  <div className="flex justify-center items-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-black" />
                    <span className="ml-2 text-gray-600">
                      Loading students...
                    </span>
                  </div>
                ) : error ? (
                  <div className="text-red-500 bg-red-50 border border-red-100 p-4 rounded-md">
                    {error}
                  </div>
                ) : sortedStudents.length === 0 ? (
                  <div className="text-center py-8 md:py-12 border-2 border-dashed rounded-lg">
                    {searchQuery ? (
                      <>
                        <p className="text-gray-500">
                          No students match your search.
                        </p>
                        <Button
                          variant="link"
                          onClick={() => setSearchQuery("")}
                          className="text-black mt-2"
                        >
                          Clear search
                        </Button>
                      </>
                    ) : (
                      <div className="text-gray-500">
                        <p>No students found.</p>
                        <p className="text-sm mt-1">
                          Add your first student using the button above.
                        </p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="max-h-[600px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                    <ul className="grid gap-3 sm:gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                      {sortedStudents.map((student) => (
                        <li
                          key={student.id}
                          className="border rounded-lg p-3 sm:p-4 shadow-sm hover:shadow-md transition-all bg-white"
                        >
                          {/* Student Header */}
                          <div className="flex flex-col gap-2 sm:gap-3">
                            <div className="flex items-start justify-between">
                              <div className="flex items-start gap-2 min-w-0 flex-1">
                                <input
                                  type="checkbox"
                                  id={`student-${student.id}`}
                                  className="h-4 w-4 mt-1 rounded border-gray-300 text-black focus:ring-black shrink-0"
                                  checked={selectedStudents.includes(
                                    student.id
                                  )}
                                  onChange={() =>
                                    toggleStudentSelection(student.id)
                                  }
                                />
                                <div className="min-w-0 flex-1">
                                  <h3 className="text-base sm:text-lg font-medium truncate">
                                    {student.name}
                                  </h3>
                                  <p className="text-sm text-gray-600 mt-0.5">
                                    Gender: {student.gender || "Not specified"}
                                  </p>
                                </div>
                              </div>
                              <Button
                                size="icon"
                                variant="ghost"
                                onClick={() => handleRemoveStudent(student.id)}
                                className="shrink-0 -mt-1"
                              >
                                <Trash2 className="w-4 h-4 text-red-500 hover:text-red-700" />
                              </Button>
                            </div>

                            {/* Status Section */}
                            <div className="flex items-center justify-between gap-2 mt-1">
                              <span className="text-sm text-gray-500">
                                Status:
                              </span>
                              <Select
                                value={student.status || "INACTIVE"}
                                onValueChange={(value) => {
                                  handleUpdateStudent(student.id, {
                                    status: value,
                                  });
                                }}
                              >
                                <SelectTrigger className="w-32 h-8">
                                  <SelectValue placeholder="Select status" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem
                                    value="ACTIVE"
                                    className="text-green-600"
                                  >
                                    <div className="flex items-center gap-2">
                                      <CheckCircle className="w-4 h-4" />
                                      <span>Active</span>
                                    </div>
                                  </SelectItem>
                                  <SelectItem
                                    value="INACTIVE"
                                    className="text-red-600"
                                  >
                                    <div className="flex items-center gap-2">
                                      <XCircle className="w-4 h-4" />
                                      <span>Inactive</span>
                                    </div>
                                  </SelectItem>
                                </SelectContent>
                              </Select>
                            </div>

                            {/* Anganwadi Section */}
                            <div className="border-t mt-2 pt-3">
                              <div className="flex items-center justify-between gap-2">
                                <span className="text-sm text-gray-500">
                                  Anganwadi:
                                </span>
                                <Select
                                  value={student.anganwadiId || "none"}
                                  onValueChange={(value) => {
                                    if (value && value !== "none") {
                                      handleAssignToAnganwadi(
                                        student.id,
                                        value
                                      );
                                    } else if (
                                      value === "none" &&
                                      student.anganwadiId
                                    ) {
                                      handleUpdateStudent(student.id, {
                                        anganwadiId: "",
                                      });
                                    }
                                  }}
                                >
                                  <SelectTrigger className="w-36 sm:w-40 h-8">
                                    <SelectValue placeholder="Assign" />
                                  </SelectTrigger>
                                  <SelectContent className="max-h-60">
                                    {student.anganwadiId && (
                                      <SelectItem value="none">
                                        <span className="text-gray-500">
                                          Unassign
                                        </span>
                                      </SelectItem>
                                    )}
                                    {anganwadis.map((anganwadi) => (
                                      <SelectItem
                                        key={
                                          anganwadi._id?.toString() ||
                                          anganwadi.id
                                        }
                                        value={
                                          anganwadi._id?.toString() ||
                                          anganwadi.id
                                        }
                                      >
                                        {anganwadi.name}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>

                              {student.anganwadiId && (
                                <div className="flex items-center gap-2 mt-2">
                                  <ChevronRight className="w-4 h-4 shrink-0 text-gray-400" />
                                  <p className="text-sm text-gray-500 truncate flex-1">
                                    {student.anganwadi?.name
                                      ? `${student.anganwadi.name}`
                                      : `ID: ${student.anganwadiId}`}
                                  </p>
                                </div>
                              )}
                            </div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="import" className="flex justify-center">
            <CsvImportForm />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
