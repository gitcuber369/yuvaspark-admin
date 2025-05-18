"use client";

import { useState } from "react";
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

interface Props {
  onSuccess: () => void;
}

export const AnganwadiForm = ({ onSuccess }: Props) => {
  const [step, setStep] = useState(1);
  const [anganwadiId, setAnganwadiId] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: "",
    location: "",
    district: "",
    teacher: { name: "", phone: "" },
    students: [],
  });

  const [studentIds, setStudentIds] = useState<string[]>([]);
  const [students, setStudents] = useState([{ name: "", gender: "" }]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({
    name: "",
    location: "",
    district: "",
    teacherName: "",
    teacherPhone: "",
  });

  const handleStep1Submit = async () => {
    const step1Errors = {
      name: form.name ? "" : "Name is required",
      location: form.location ? "" : "Location is required",
      district: form.district ? "" : "District is required",
      teacherName: form.teacher.name ? "" : "Teacher name is required",
      teacherPhone: form.teacher.phone ? "" : "Teacher phone is required",
    };
    setErrors((prev) => ({ ...prev, ...step1Errors }));
    if (!Object.values(step1Errors).every((error) => error === "")) return;

    setLoading(true);
    const res = await fetch("http://192.168.1.3:3000/api/anganwadis", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: form.name,
        location: form.location,
        district: form.district,
        teacher: form.teacher,
      }),
    });

    if (res.ok) {
      const result = await res.json();
      setAnganwadiId(result.anganwadi.id);
      setStep(2);
      setErrors({
        name: "",
        location: "",
        district: "",
        teacherName: "",
        teacherPhone: "",
      });
    } else {
      console.error("Failed to create Anganwadi");
    }
    setLoading(false);
  };

  const handleStep2Submit = async () => {
    if (!anganwadiId) return;

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
      `http://192.168.1.3:3000/api/anganwadis/${anganwadiId}`,
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
      onSuccess();
      setStep(1);
      setAnganwadiId(null);
      setForm({
        name: "",
        location: "",
        district: "",
        teacher: { name: "", phone: "" },
        students: [],
      });
      setStudentIds([]);
      setStudents([{ name: "", gender: "" }]);
      setErrors({
        name: "",
        location: "",
        district: "",
        teacherName: "",
        teacherPhone: "",
      });
    } else {
      console.error("Failed to add students to Anganwadi");
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

  return (
    <Card className="w-full mx-auto max-h-[100vh] border rounded-lg shadow-sm">
      <CardHeader className="border-b px-4">
        <div className="flex justify-between items-center">
          <CardTitle className="text-xl font-semibold text-gray-800">
            {step === 1
              ? "Step 1: Create Anganwadi"
              : `Step 2: Add Students to ${form.name || "Anganwadi"}`}
          </CardTitle>
          <span className="text-sm font-medium text-gray-500">
            Step {step}/2
          </span>
        </div>
        <p className="text-sm text-gray-500 mt-1">
          {step === 1
            ? "Enter details for the Anganwadi and teacher."
            : "Add existing or new students."}
        </p>
      </CardHeader>
      <CardContent className="">
        {step === 1 && (
          <div className="space-y-2">
            {/* Anganwadi Details */}
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1.5">
                Name
              </label>
              <Input
                placeholder="Anganwadi Name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full"
                aria-invalid={!!errors.name}
              />
              {errors.name && (
                <p className="text-red-500 text-xs mt-1">{errors.name}</p>
              )}
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1.5">
                Taluk
              </label>
              <Input
                placeholder="Village/Area"
                value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
                className="w-full"
                aria-invalid={!!errors.location}
              />
              {errors.location && (
                <p className="text-red-500 text-xs mt-1">{errors.location}</p>
              )}
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1.5">
                District
              </label>
              <Input
                placeholder="District Name"
                value={form.district}
                onChange={(e) => setForm({ ...form, district: e.target.value })}
                className="w-full"
                aria-invalid={!!errors.district}
              />
              {errors.district && (
                <p className="text-red-500 text-xs mt-1">{errors.district}</p>
              )}
            </div>

            {/* Teacher Details */}
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
                aria-invalid={!!errors.teacherName}
              />
              {errors.teacherName && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.teacherName}
                </p>
              )}
            </div>
            <div>
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
                aria-invalid={!!errors.teacherPhone}
              />
              {errors.teacherPhone && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.teacherPhone}
                </p>
              )}
            </div>

            {/* Step 1 Button */}
            <div className="pt-4">
              <Button
                onClick={handleStep1Submit}
                className="w-full"
                disabled={loading}
              >
                {loading ? "Creating..." : "Next: Add Students"}
              </Button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="">
            {/* Connect Existing Students */}
            <div>
              <h3 className="text-lg font-medium mb-3">
                Connect Existing Students
              </h3>
              <StudentCombobox
                selected={studentIds}
                setSelected={setStudentIds}
              />
            </div>

            {/* Create New Students */}
            <div className="pt-2 border-t">
              <h3 className="text-lg font-medium mb-4">Create New Students</h3>
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

            {/* Step 2 Button */}
            <div className="pt-6 border-t">
              <Button
                onClick={handleStep2Submit}
                className="w-full"
                disabled={loading}
              >
                {loading ? "Saving..." : "Finish & Save Students"}
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
