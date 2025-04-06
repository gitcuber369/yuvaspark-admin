"use client"
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
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Loader2, Trash2, UserPlus, School, Users, Search, ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

export default function StudentDashboard() {
  const {
    students,
    loading,
    error,
    fetchStudents,
    addStudent,
    removeStudent,
    assignToAnganwadi,
    fetchByAnganwadi,
  } = useStudentStore();

  const [newStudent, setNewStudent] = useState({
    name: "",
    age: "",
    gender: "",
  });
  const [anganwadiId, setAnganwadiId] = useState("");
  const [selectedStudentId, setSelectedStudentId] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  const handleAddStudent = async () => {
    if (!newStudent.name || !newStudent.age) return;
    await addStudent({
      name: newStudent.name,
      age: parseInt(newStudent.age),
      gender: newStudent.gender,
    });
    setNewStudent({ name: "", age: "", gender: "" });
  };

  const handleAssign = async () => {
    if (selectedStudentId && anganwadiId) {
      await assignToAnganwadi(selectedStudentId, anganwadiId);
    }
  };

  const filteredStudents = searchQuery 
    ? students.filter(student => 
        student.name.toLowerCase().includes(searchQuery.toLowerCase()))
    : students;

  return (
    <div className="bg-white min-h-screen">
      <div className="container mx-auto p-6 space-y-6">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 pb-4 border-b">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Student Management</h1>
            <p className="text-gray-500 mt-1">Add, assign, and manage student records</p>
          </div>
          <div className="flex items-center mt-4 md:mt-0">
            <Badge className="bg-black text-white mr-2">{students.length} Students</Badge>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => fetchStudents()}
              className="border-black text-black hover:bg-gray-100"
            >
              Refresh
            </Button>
          </div>
        </header>
      
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="border shadow-sm">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <UserPlus className="h-5 w-5" />
                <CardTitle className="text-xl font-semibold">Add New Student</CardTitle>
              </div>
              <CardDescription>Register a new student in the system</CardDescription>
            </CardHeader>
            <Separator />
            <CardContent className="p-6 space-y-4">
              <div className="grid gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    placeholder="Enter student name"
                    value={newStudent.name}
                    onChange={(e) =>
                      setNewStudent({ ...newStudent, name: e.target.value })
                    }
                    className="focus:border-black focus:ring-black"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="age">Age</Label>
                  <Input
                    id="age"
                    placeholder="Enter age"
                    value={newStudent.age}
                    onChange={(e) =>
                      setNewStudent({ ...newStudent, age: e.target.value })
                    }
                    type="number"
                    className="focus:border-black focus:ring-black"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="gender">Gender</Label>
                  <Select
                    value={newStudent.gender}
                    onValueChange={(value) =>
                      setNewStudent({ ...newStudent, gender: value })
                    }
                  >
                    <SelectTrigger id="gender" className="focus:ring-black">
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Male">Male</SelectItem>
                      <SelectItem value="Female">Female</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <Button 
                  className="mt-2 w-full bg-black text-white hover:bg-gray-800"
                  onClick={handleAddStudent}
                  disabled={!newStudent.name || !newStudent.age}
                >
                  Add Student
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="border shadow-sm">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <School className="h-5 w-5" />
                <CardTitle className="text-xl font-semibold">Assign to Anganwadi</CardTitle>
              </div>
              <CardDescription>Link students to their Anganwadi center</CardDescription>
            </CardHeader>
            <Separator />
            <CardContent className="p-6 space-y-4">
              <div className="grid gap-4">
                <div className="space-y-2">
                  <Label htmlFor="student">Select Student</Label>
                  <Select onValueChange={(value) => setSelectedStudentId(value)}>
                    <SelectTrigger id="student" className="focus:ring-black">
                      <SelectValue placeholder="Select student" />
                    </SelectTrigger>
                    <SelectContent>
                      {students.map((student) => (
                        <SelectItem key={student._id} value={student._id}>
                          {student.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="anganwadi">Anganwadi ID</Label>
                  <Input
                    id="anganwadi"
                    placeholder="Enter Anganwadi ID"
                    value={anganwadiId}
                    onChange={(e) => setAnganwadiId(e.target.value)}
                    className="focus:border-black focus:ring-black"
                  />
                </div>
                
                <Button 
                  className="mt-2 w-full bg-black text-white hover:bg-gray-800"
                  onClick={handleAssign}
                  disabled={!selectedStudentId || !anganwadiId}
                >
                  Assign to Anganwadi
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="border shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                <CardTitle className="text-xl font-semibold">Students Directory</CardTitle>
              </div>
              <div className="relative w-full md:w-64">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
                <Input
                  className="pl-8 focus:border-black focus:ring-black"
                  placeholder="Search students..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
          </CardHeader>
          <Separator />
          <CardContent className="p-6">
            {loading ? (
              <div className="flex justify-center items-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-black" />
                <span className="ml-2 text-gray-600">Loading students...</span>
              </div>
            ) : error ? (
              <div className="text-red-500 p-4 bg-red-50 rounded-md border border-red-100">
                {error}
              </div>
            ) : filteredStudents.length === 0 ? (
              <div className="text-center py-12 border-2 border-dashed rounded-lg">
                {searchQuery ? (
                  <div>
                    <p className="text-gray-500">No students match your search criteria.</p>
                    <Button 
                      variant="link" 
                      onClick={() => setSearchQuery("")}
                      className="text-black mt-2"
                    >
                      Clear search
                    </Button>
                  </div>
                ) : (
                  <div className="text-gray-500">
                    <p>No students found.</p>
                    <p className="text-sm mt-1">Add your first student using the form above.</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="grid gap-3">
                {filteredStudents.map((student) => (
                  <div
                    key={student._id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center">
                      <div className="rounded-full bg-gray-100 w-10 h-10 flex items-center justify-center text-gray-700 font-medium mr-3">
                        {student.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="space-y-1">
                        <div className="font-medium flex items-center">
                          {student.name}
                          <ChevronRight className="h-4 w-4 text-gray-400 mx-1" />
                          <span className="text-sm text-gray-500">{student.age} years</span>
                        </div>
                        <div className="flex items-center">
                          {student.gender && (
                            <Badge variant="secondary" className="mr-2">
                              {student.gender}
                            </Badge>
                          )}
                          {student.anganwadiId ? (
                            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                              Anganwadi: {student.anganwadiId}
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                              Unassigned
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-red-500 hover:text-red-700 hover:bg-red-50"
                      onClick={() => removeStudent(student._id)}
                    >
                      <Trash2 className="h-4 w-4" />
                      <span className="sr-only md:not-sr-only md:ml-2">Remove</span>
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}