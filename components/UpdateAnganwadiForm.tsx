"use client";

import { useState, useEffect } from "react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import StudentCombobox from "@/components/StudentCombobox";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "./ui/select";
import { ScrollArea } from "./ui/scroll-area";
import { API_URL } from "@/lib/config";

interface Props {
  anganwadiId: string;
  onSuccess: () => void;
  onClose?: () => void;
}

export const UpdateAnganwadiForm = ({
  anganwadiId,
  onSuccess,
  onClose,
}: Props) => {
  const [form, setForm] = useState({
    name: "",
    location: "",
    district: "",
    teacher: {
      id: "",
      name: "",
      phone: "",
    },
  });

  const [studentIds, setStudentIds] = useState<string[]>([]);
  const [students, setStudents] = useState([{ name: "", gender: "" }]);
  const [loading, setLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);

  // Fetch existing Anganwadi data
  useEffect(() => {
    const fetchAnganwadi = async () => {
      setIsFetching(true);
      try {
        const res = await fetch(`${API_URL}anganwadis/${anganwadiId}`);
        if (res.ok) {
          const data = await res.json();
          setForm({
            name: data.name || "",
            location: data.location || "",
            district: data.district || "",
            teacher: {
              id: data.teacher?.id || "",
              name: data.teacher?.name || "",
              phone: data.teacher?.phone || "",
            },
          });
          // Set existing student IDs
          if (data.students && Array.isArray(data.students)) {
            setStudentIds(data.students.map((s: any) => s.id));
          }
        } else {
          console.error("Failed to fetch Anganwadi data");
        }
      } catch (error) {
        console.error("Error fetching Anganwadi:", error);
      } finally {
        setIsFetching(false);
      }
    };

    if (anganwadiId) {
      fetchAnganwadi();
    }
  }, [anganwadiId]);

  const handleSubmit = async () => {
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
    try {
      // First update the anganwadi basic info and students
      const anganwadiRes = await fetch(`${API_URL}anganwadis/${anganwadiId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          location: form.location,
          district: form.district,
          studentIds,
          students: validNewStudents,
        }),
      });

      if (!anganwadiRes.ok) {
        throw new Error("Failed to update Anganwadi");
      }

      // Handle teacher update/creation
      if (form.teacher.name && form.teacher.phone) {
        if (form.teacher.id) {
          // Update existing teacher
          const teacherRes = await fetch(
            `${API_URL}teachers/${form.teacher.id}`,
            {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                name: form.teacher.name,
                phone: form.teacher.phone,
              }),
            }
          );

          if (!teacherRes.ok) {
            throw new Error("Failed to update teacher information");
          }
        } else {
          // Create new teacher
          const teacherRes = await fetch(`${API_URL}teachers`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              name: form.teacher.name,
              phone: form.teacher.phone,
              anganwadiId: anganwadiId,
            }),
          });

          if (!teacherRes.ok) {
            throw new Error("Failed to create new teacher");
          }
        }
      }

      onSuccess();
      if (onClose) onClose();
    } catch (error) {
      console.error("Error updating:", error);
      alert(error instanceof Error ? error.message : "Failed to update");
    } finally {
      setLoading(false);
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

  if (isFetching) {
    return <div className="text-center p-4">Loading...</div>;
  }

  return (
    <Card className="w-full mx-auto max-h-[80vh] overflow-y-auto border rounded-lg shadow-sm">
      <CardHeader className="border-b px-4">
        <CardTitle className="text-xl font-semibold text-gray-800">
          Update Anganwadi
        </CardTitle>
        <p className="text-sm text-gray-500 mt-1">
          Update details or add students to the Anganwadi
        </p>
      </CardHeader>
      <CardContent className="p-4">
        <div className="space-y-4">
          {/* Anganwadi Details */}
          <div>
            <h3 className="text-lg font-medium mb-4">Basic Information</h3>
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1.5">
                  Name
                </label>
                <Input
                  placeholder="Anganwadi Name"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1.5">
                  Taluk
                </label>
                <Input
                  placeholder="Village/Area"
                  value={form.location}
                  onChange={(e) =>
                    setForm({ ...form, location: e.target.value })
                  }
                  className="w-full"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1.5">
                  District
                </label>
                <Input
                  placeholder="District Name"
                  value={form.district}
                  onChange={(e) =>
                    setForm({ ...form, district: e.target.value })
                  }
                  className="w-full"
                />
              </div>
            </div>
          </div>

          {/* Teacher Details */}
          <div>
            <h3 className="text-lg font-medium pt-5 border-t mt-6 mb-3">
              Teacher Details
            </h3>
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1.5">
                Teacher Name
              </label>
              <Input
                placeholder="Full Name"
                value={form.teacher.name}
                onChange={(e) =>
                  setForm({
                    ...form,
                    teacher: { ...form.teacher, name: e.target.value },
                  })
                }
                className="w-full"
              />
            </div>
            <div className="mt-3">
              <label className="text-sm font-medium text-gray-700 block mb-1.5">
                Teacher Phone
              </label>
              <Input
                placeholder="Phone Number"
                value={form.teacher.phone}
                onChange={(e) => {
                  const value = e.target.value;
                  if (/^\d*$/.test(value)) {
                    setForm({
                      ...form,
                      teacher: { ...form.teacher, phone: value },
                    });
                  }
                }}
                inputMode="numeric"
                className="w-full"
              />
            </div>
          </div>

          {/* Connect Existing Students */}
          <div className="pt-4 border-t">
            <h3 className="text-lg font-medium mb-3">
              Connect Existing Students
            </h3>
            <StudentCombobox
              selected={studentIds}
              setSelected={setStudentIds}
            />
          </div>

          {/* Create New Students */}
          <div className="pt-4 border-t">
            <h3 className="text-lg font-medium mb-4">Create New Students</h3>
            <ScrollArea className="h-72 w-full rounded-md border p-4 mb-4">
              <div className="space-y-4">
                {students.map((student, index) => (
                  <div key={index} className="space-y-3 p-4 border rounded-md">
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
                            handleStudentChange(index, "name", e.target.value)
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
            <div className="flex space-x-3">
              <Button
                onClick={handleSubmit}
                className="flex-1"
                disabled={loading}
              >
                {loading ? "Saving..." : "Save Changes"}
              </Button>
              {onClose && (
                <Button
                  onClick={onClose}
                  variant="outline"
                  className="flex-1"
                  disabled={loading}
                >
                  Cancel
                </Button>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
