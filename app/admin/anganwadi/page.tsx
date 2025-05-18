"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

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
import { UpdateAnganwadiForm } from "@/components/UpdateAnganwadiForm";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

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
  const [selectedAnganwadi, setSelectedAnganwadi] = useState<string | null>(null);
  const [showUpdateForm, setShowUpdateForm] = useState(false);
  const router = useRouter();

  const fetchAnganwadis = async () => {
    const res = await fetch("http://localhost:3000/api/anganwadis");
    const data = await res.json();
    setAnganwadis(data);
  };

  useEffect(() => {
    fetchAnganwadis();
  }, []);

  const handleDelete = async (id: string) => {
    await fetch(`http://localhost:3000/api/anganwadis/${id}`, {
      method: "DELETE",
    });
    fetchAnganwadis();
  };

  const handleEdit = (id: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent navigation
    setSelectedAnganwadi(id);
    setShowUpdateForm(true);
  };

  const handleRowClick = (id: string) => {
    router.push(`/admin/anganwadi/${id}`);
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

      {/* Update Anganwadi Dialog */}
      <Dialog open={showUpdateForm} onOpenChange={setShowUpdateForm}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogTitle>Update Anganwadi</DialogTitle>
          <DialogDescription>
            Update details or add students to this Anganwadi.
          </DialogDescription>
          {selectedAnganwadi && (
            <UpdateAnganwadiForm
              anganwadiId={selectedAnganwadi}
              onSuccess={fetchAnganwadis}
              onClose={() => setShowUpdateForm(false)}
            />
          )}
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
                    <TableCell onClick={() => handleRowClick(a.id)}>{a.name}</TableCell>
                    <TableCell onClick={() => handleRowClick(a.id)}>{a.location}</TableCell>
                    <TableCell onClick={() => handleRowClick(a.id)}>{a.district}</TableCell>
                    <TableCell onClick={() => handleRowClick(a.id)}>
                      {a.teacher
                        ? `${a.teacher.name} (${a.teacher.phone})`
                        : "Not assigned"}
                    </TableCell>
                    <TableCell onClick={() => handleRowClick(a.id)}>
                      {a.students.length > 0
                        ? a.students.map((s) => s.name).join(", ")
                        : "No students"}
                    </TableCell>
                    <TableCell
                      className="text-right"
                    >
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(e) => handleEdit(a.id, e)}
                        >
                          Edit
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(a.id);
                          }}
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
