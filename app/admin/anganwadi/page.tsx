"use client";
import { useState } from "react";
import axios from "axios";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Search, MapPin, Building, School, Users, Plus, X } from "lucide-react";

export default function CreateAnganwadiForm() {
  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  const [district, setDistrict] = useState("");

  const [teacherSearch, setTeacherSearch] = useState("");
  const [studentSearch, setStudentSearch] = useState("");

  const [teacherSuggestions, setTeacherSuggestions] = useState([]);
  const [studentSuggestions, setStudentSuggestions] = useState([]);

  const [selectedTeachers, setSelectedTeachers] = useState([]);
  const [selectedStudents, setSelectedStudents] = useState([]);

  const fetchTeachers = async (search) => {
    const res = await axios.get(
      `http://localhost:3000/api/teachers?search=${search}`
    );
    setTeacherSuggestions(res.data);
  };

  const fetchStudents = async (search) => {
    const res = await axios.get(
      `http://localhost:3000/api/students?search=${search}`
    );
    setStudentSuggestions(res.data);
  };

  const handleSubmit = async () => {
    try {
      await axios.post("http://localhost:3000/api/anganwadis", {
        name,
        location,
        district,
        teacherIds: selectedTeachers.map((t) => t.id),
        studentIds: selectedStudents.map((s) => s.id),
      });

      // Clear form
      setName("");
      setLocation("");
      setDistrict("");
      setSelectedTeachers([]);
      setSelectedStudents([]);

      // Show success message
      alert("Anganwadi created successfully!");
    } catch (error) {
      alert("Error creating Anganwadi: " + error.message);
    }
  };

  const removeTeacher = (id) => {
    setSelectedTeachers(selectedTeachers.filter((t) => t.id !== id));
  };

  const removeStudent = (id) => {
    setSelectedStudents(selectedStudents.filter((s) => s.id !== id));
  };

  return (
    <div className="bg-white min-h-screen p-6">
      <Card className="max-w-2xl mx-auto shadow-sm border border-gray-200">
        <CardHeader className="space-y-1">
          <div className="flex items-center gap-2">
            <Building className="h-5 w-5" />
            <CardTitle className="text-2xl font-semibold">
              Create New Anganwadi
            </CardTitle>
          </div>
          <CardDescription>
            Fill in the details to register a new Anganwadi center
          </CardDescription>
        </CardHeader>

        <CardContent className="p-6 space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-base font-semibold text-gray-800">
              Basic Information
            </h3>

            <div className="space-y-2">
              <Label htmlFor="name">Anganwadi Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter Anganwadi name"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="location" className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  <span>Location</span>
                </Label>
                <Input
                  id="location"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Village/Town"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="district">District</Label>
                <Input
                  id="district"
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  placeholder="District name"
                />
              </div>
            </div>
          </div>

          <Separator />

          {/* Teacher Section */}
          <div className="space-y-4">
            <h3 className="text-base font-semibold text-gray-800 flex items-center gap-2">
              <School className="h-4 w-4" />
              <span>Teacher Assignment</span>
            </h3>

            <div className="space-y-2">
              <Label htmlFor="teacherSearch">Search Teachers</Label>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
                <Input
                  id="teacherSearch"
                  className="pl-8"
                  value={teacherSearch}
                  onChange={(e) => {
                    setTeacherSearch(e.target.value);
                    if (e.target.value.length > 1) {
                      fetchTeachers(e.target.value);
                    }
                  }}
                  placeholder="Search by teacher name"
                />
              </div>

              {teacherSuggestions.length > 0 && (
                <ScrollArea className="h-40 border rounded-md">
                  {teacherSuggestions.map((t) => (
                    <div
                      key={t.id}
                      className="flex justify-between items-center p-2 border-b last:border-b-0 hover:bg-gray-50"
                    >
                      <span>{t.name}</span>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 gap-1"
                        onClick={() => {
                          if (
                            !selectedTeachers.some(
                              (teacher) => teacher.id === t.id
                            )
                          ) {
                            setSelectedTeachers((prev) => [...prev, t]);
                          }
                          setTeacherSuggestions([]);
                          setTeacherSearch("");
                        }}
                      >
                        <Plus className="h-4 w-4" />
                        <span>Add</span>
                      </Button>
                    </div>
                  ))}
                </ScrollArea>
              )}
            </div>

            {/* Selected Teachers */}
            <div>
              <Label className="mb-2 block">Selected Teachers</Label>
              {selectedTeachers.length === 0 ? (
                <p className="text-sm text-gray-500 italic">
                  No teachers selected
                </p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {selectedTeachers.map((t) => (
                    <Badge
                      key={t.id}
                      variant="outline"
                      className="flex items-center px-3 py-1"
                    >
                      {t.name}
                      <button
                        onClick={() => removeTeacher(t.id)}
                        className="ml-2 hover:bg-gray-100 rounded-full"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </div>

          <Separator />

          {/* Student Section */}
          <div className="space-y-4">
            <h3 className="text-base font-semibold text-gray-800 flex items-center gap-2">
              <Users className="h-4 w-4" />
              <span>Student Enrollment</span>
            </h3>

            <div className="space-y-2">
              <Label htmlFor="studentSearch">Search Students</Label>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
                <Input
                  id="studentSearch"
                  className="pl-8"
                  value={studentSearch}
                  onChange={(e) => {
                    setStudentSearch(e.target.value);
                    if (e.target.value.length > 1) {
                      fetchStudents(e.target.value);
                    }
                  }}
                  placeholder="Search by student name"
                />
              </div>

              {studentSuggestions.length > 0 && (
                <ScrollArea className="h-40 border rounded-md">
                  {studentSuggestions.map((s) => (
                    <div
                      key={s.id}
                      className="flex justify-between items-center p-2 border-b last:border-b-0 hover:bg-gray-50"
                    >
                      <span>{s.name}</span>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 gap-1"
                        onClick={() => {
                          if (
                            !selectedStudents.some(
                              (student) => student.id === s.id
                            )
                          ) {
                            setSelectedStudents((prev) => [...prev, s]);
                          }
                          setStudentSuggestions([]);
                          setStudentSearch("");
                        }}
                      >
                        <Plus className="h-4 w-4" />
                        <span>Add</span>
                      </Button>
                    </div>
                  ))}
                </ScrollArea>
              )}
            </div>

            {/* Selected Students */}
            <div>
              <Label className="mb-2 block">Selected Students</Label>
              {selectedStudents.length === 0 ? (
                <p className="text-sm text-gray-500 italic">
                  No students selected
                </p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {selectedStudents.map((s) => (
                    <Badge
                      key={s.id}
                      variant="outline"
                      className="flex items-center px-3 py-1"
                    >
                      {s.name}
                      <button
                        onClick={() => removeStudent(s.id)}
                        className="ml-2 hover:bg-gray-100 rounded-full"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </div>
        </CardContent>

        <CardFooter className="px-6 pb-6 pt-0">
          <Button
            onClick={handleSubmit}
            className="w-full bg-black text-white hover:bg-gray-800"
            disabled={!name || !location || !district}
          >
            Create Anganwadi
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
