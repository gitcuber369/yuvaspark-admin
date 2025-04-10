"use client";

import { useState } from "react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import StudentCombobox from "@/components/StudentCombobox";

interface Props {
  onSuccess: () => void;
}

export const AnganwadiForm = ({ onSuccess }: Props) => {
  const [form, setForm] = useState({
    name: "",
    location: "",
    district: "",
    teacher: { name: "", phone: "" },
  });

  const [studentIds, setStudentIds] = useState<string[]>([]);

  const handleSubmit = async () => {
    const res = await fetch("http://localhost:3000/api/anganwadis", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, studentIds }),
    });

    if (res.ok) {
      onSuccess();
      setForm({
        name: "",
        location: "",
        district: "",
        teacher: { name: "", phone: "" },
      });
      setStudentIds([]);
    }
  };

  return (
    <div className="border p-4 mt-4 rounded-md space-y-3">
      <Input
        placeholder="Name"
        value={form.name}
        onChange={(e) => setForm({ ...form, name: e.target.value })}
      />
      <Input
        placeholder="Location"
        value={form.location}
        onChange={(e) => setForm({ ...form, location: e.target.value })}
      />
      <Input
        placeholder="District"
        value={form.district}
        onChange={(e) => setForm({ ...form, district: e.target.value })}
      />
      <Input
        placeholder="Teacher Name"
        value={form.teacher.name}
        onChange={(e) =>
          setForm({
            ...form,
            teacher: { ...form.teacher, name: e.target.value },
          })
        }
      />
      <Input
        placeholder="Teacher Phone"
        value={form.teacher.phone}
        onChange={(e) =>
          setForm({
            ...form,
            teacher: { ...form.teacher, phone: e.target.value },
          })
        }
      />
      <StudentCombobox selected={studentIds} setSelected={setStudentIds} />
      <Button onClick={handleSubmit}>Create Anganwadi</Button>
    </div>
  );
};
