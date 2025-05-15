"use client";

import { useEffect, useState } from "react";
import { useStudentStore } from "@/app/store/studentStore";
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
  const { students, loading, error, fetchStudents, addStudent, removeStudent, updateStudent } =
    useStudentStore();

  const [newStudent, setNewStudent] = useState({
    name: "",
    gender: "",
    status: "",
  });

  const [searchQuery, setSearchQuery] = useState("");
  const [sortByAnganwadi, setSortByAnganwadi] = useState("none");

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  const handleAddStudent = async () => {
    if (!newStudent.name) return;
    await addStudent({
      name: newStudent.name,
      gender: newStudent.gender,
      status: newStudent.status,
    });
    setNewStudent({ name: "", gender: "", status: "" });
  };

  const filteredStudents = students.filter(
    (student) =>
      student.name?.toLowerCase().includes(searchQuery.toLowerCase()) || false
  );

  const sortedStudents =
    sortByAnganwadi === "none"
      ? filteredStudents
      : [...filteredStudents].sort((a, b) =>
          sortByAnganwadi === "asc"
            ? (a.anganwadiId || "").localeCompare(b.anganwadiId || "")
            : (b.anganwadiId || "").localeCompare(a.anganwadiId || "")
        );

  return (
    <div className="bg-white min-h-screen">
      <div className="container mx-auto p-6 space-y-6">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 pb-4 border-b">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Student Management
            </h1>
            <p className="text-gray-500 mt-1">
              Register and manage student records
            </p>
          </div>
          <div className="flex items-center mt-4 md:mt-0 gap-2">
            <Badge className="bg-black text-white">
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
                Imports
              </Button>
            </Link>

            {/* Dialog Trigger Button */}
            <Dialog>
              <DialogTrigger asChild>
                <Button
                  size="sm"
                  className="bg-black text-white hover:bg-gray-800"
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
                        <SelectItem value="Male">Male</SelectItem>
                        <SelectItem value="Female">Female</SelectItem>
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
                        <SelectItem value="Active">Active</SelectItem>
                        <SelectItem value="Inactive">Inactive</SelectItem>
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
          </div>
        </header>

        <Tabs defaultValue="students" className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="students">Students Directory</TabsTrigger>
            <TabsTrigger value="import">CSV Import</TabsTrigger>
          </TabsList>

          <TabsContent value="students">
            {/* Student Directory */}
            <Card className="border shadow-sm">
              <CardHeader className="pb-3">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    <CardTitle className="text-xl font-semibold">
                      Students Directory
                    </CardTitle>
                  </div>
                  <div className="flex flex-col md:flex-row gap-2 w-full md:w-auto">
                    <div className="relative w-full md:w-64">
                      <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
                      <Input
                        className="pl-8"
                        placeholder="Search students..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                    </div>
                    <Select
                      value={sortByAnganwadi}
                      onValueChange={(val) => setSortByAnganwadi(val)}
                    >
                      <SelectTrigger className="md:w-48">
                        <SelectValue placeholder="Sort by Anganwadi" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">None</SelectItem>
                        <SelectItem value="asc">Anganwadi (A → Z)</SelectItem>
                        <SelectItem value="desc">Anganwadi (Z → A)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardHeader>
              <Separator />
              <CardContent className="p-6">
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
                  <div className="text-center py-12 border-2 border-dashed rounded-lg">
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
                  <ul className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {sortedStudents.map((student) => (
                      <li
                        key={student.id}
                        className="border rounded-lg p-4 shadow-sm hover:shadow-md transition-all"
                      >
                        <div className="flex justify-between items-center mb-2">
                          <h3 className="text-lg font-medium">
                            {student.name}
                          </h3>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => removeStudent(student.id)}
                          >
                            <Trash2 className="w-4 h-4 text-red-500 hover:text-red-700" />
                          </Button>
                        </div>
                        <p className="text-sm text-gray-600">
                          Gender: {student.gender}
                        </p>
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-sm text-gray-500">Status:</span>
                          <Select
                            value={(student.status || "").toUpperCase()}
                            onValueChange={(value) => {
                              updateStudent(student.id, { status: value });
                            }}
                          >
                            <SelectTrigger className="w-28 h-8">
                              <SelectValue />
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
                        {student.anganwadiId && (
                          <div className="flex items-center gap-2 mt-2 text-sm text-gray-500">
                            <ChevronRight className="w-4 h-4" />
                            {student.anganwadi?.name ? (
                              <span>
                                Anganwadi: {student.anganwadi.name} (
                                {student.anganwadiId})
                              </span>
                            ) : (
                              <span>Anganwadi ID: {student.anganwadiId}</span>
                            )}
                          </div>
                        )}
                      </li>
                    ))}
                  </ul>
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
