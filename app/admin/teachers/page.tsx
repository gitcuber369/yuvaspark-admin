"use client";

import { useEffect, useState } from "react";
import { useTeacherStore } from "@/app/store/teacherStore";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";
import {
  Loader2,
  Plus,
  Trash2,
  UserRound,
  Phone,
  School,
  Search,
  FileText,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

// Define interfaces for type safety
interface Teacher {
  id: string;
  name: string;
  phone: string;
  cohort?: { id: string; name: string };
  anganwadi?: { id: string; name: string };
}

interface Anganwadi {
  id: string;
  name: string;
  location?: string;
  code?: string;
}

export default function TeachersPage() {
  const {
    teachers,
    loading,
    fetchTeachers,
    createTeacher,
    deleteTeacher,
    getByAnganwadi,
  } = useTeacherStore();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [open, setOpen] = useState(false);
  const [assignAnganwadiOpen, setAssignAnganwadiOpen] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);
  const [searchAnganwadi, setSearchAnganwadi] = useState("");
  const [anganwadiResults, setAnganwadiResults] = useState<Anganwadi[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [selectedAnganwadi, setSelectedAnganwadi] = useState<Anganwadi | null>(null);

  const [creating, setCreating] = useState(false);
  const [deletingTeacherId, setDeletingTeacherId] = useState<string | null>(null);
  const [assigningAnganwadiId, setAssigningAnganwadiId] = useState<string | null>(null);

  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchTeachers();
  }, [fetchTeachers]);

  useEffect(() => {
    const searchAnganwadis = async () => {
      if (searchAnganwadi.trim().length < 2) {
        return;
      }

      setSearchLoading(true);
      try {
        const response = await fetch(
          `https://0dd7-2401-4900-1cd7-672e-f883-6669-8e54-fbef.ngrok-free.app/api/anganwadis?search=${searchAnganwadi}`
        );
        const data = await response.json();
        setAnganwadiResults(data);
      } catch (error) {
        console.error("Failed to search anganwadis:", error);
      } finally {
        setSearchLoading(false);
      }
    };

    const debounce = setTimeout(() => {
      searchAnganwadis();
    }, 300);

    return () => clearTimeout(debounce);
  }, [searchAnganwadi]);

  const handleSubmit = async () => {
    if (!name || !phone) return toast.error("Name and phone are required");
    setCreating(true);
    try {
      await createTeacher(name, phone);
      toast.success("Teacher added successfully!");
      setName("");
      setPhone("");
      setOpen(false);
    } catch (err) {
      toast.error("Failed to create teacher");
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (id: string) => {
    setDeletingTeacherId(id);
    try {
      await deleteTeacher(id);
      toast.success("Teacher deleted successfully!");
    } catch (err) {
      toast.error("Failed to delete teacher");
    } finally {
      setDeletingTeacherId(null);
    }
  };

  const openAssignAnganwadi = (teacher: Teacher) => {
    setSelectedTeacher(teacher);
    setAssignAnganwadiOpen(true);
    setSearchAnganwadi("");
    setAnganwadiResults([]);
  };

  const handleAssignAnganwadi = async (anganwadiId: string) => {
    if (!selectedTeacher || !anganwadiId) return;
    setAssigningAnganwadiId(anganwadiId);
    try {
      await fetch(`https://0dd7-2401-4900-1cd7-672e-f883-6669-8e54-fbef.ngrok-free.app/api/teachers/assign`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          teacherId: selectedTeacher.id,
          anganwadiId
        }),
      });
      toast.success("Anganwadi assigned successfully!");
      setAssignAnganwadiOpen(false);
      setSelectedTeacher(null);
      fetchTeachers();
    } catch (err) {
      toast.error("Failed to assign anganwadi");
    } finally {
      setAssigningAnganwadiId(null);
    }
  };

  // Handle search filtering with debounce
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  const filteredTeachers = teachers.filter((teacher) => {
    const search = debouncedSearchTerm.toLowerCase();
    return (
      teacher.name.toLowerCase().includes(search) ||
      teacher.phone.toLowerCase().includes(search)
    );
  });

  return (
    <div className="container mx-auto py-8 px-4">
      <Card className="border border-gray-100 shadow-sm rounded-lg overflow-hidden">
        <CardHeader className="border-b border-gray-100 pb-4 bg-white">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
            <CardTitle className="text-xl font-medium flex items-center gap-2 text-gray-800">
              <School className="h-5 w-5 text-gray-600" /> Teachers Dashboard
            </CardTitle>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                className="flex items-center gap-1 h-9"
                onClick={() => window.location.href = "/admin/teachers/student-responses"}
              >
                <FileText className="h-3.5 w-3.5" /> Student Responses
              </Button>
              <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger asChild>
                  <Button
                    variant="default"
                    size="sm"
                    className="flex items-center gap-1 h-9 bg-gray-800 hover:bg-gray-700 text-white"
                  >
                    <Plus className="h-3.5 w-3.5" /> Add Teacher
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[400px] rounded-lg bg-white">
                  <DialogHeader>
                    <DialogTitle className="text-lg font-medium text-gray-800">
                      New Teacher
                    </DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label
                        htmlFor="name"
                        className="text-sm font-medium text-gray-600"
                      >
                        Name
                      </Label>
                      <Input
                        id="name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Full name"
                        className="w-full border-gray-200 focus:border-gray-300"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label
                        htmlFor="phone"
                        className="text-sm font-medium text-gray-600"
                      >
                        Phone Number
                      </Label>
                      <Input
                        id="phone"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="Phone number"
                        className="w-full border-gray-200 focus:border-gray-300"
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button
                      onClick={handleSubmit}
                      size="sm"
                      className="w-full bg-gray-800 hover:bg-gray-700 text-white"
                      disabled={creating}
                    >
                      {creating ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      ) : null}
                      Add Teacher
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
            <div className="mt-4 relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-gray-400" />
              </div>
              <Input
                placeholder="Search by name or phone number"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-full border-gray-200 focus:border-gray-300"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex justify-center items-center py-16">
              <div className="text-center">
                <Loader2 className="h-8 w-8 animate-spin text-gray-500 mx-auto" />
                <p className="mt-3 text-sm text-gray-500">
                  Loading teachers...
                </p>
              </div>
            </div>
          ) : filteredTeachers.length === 0 ? (
            <div className="text-center py-16 px-4">
              <UserRound className="h-12 w-12 mx-auto text-gray-300" />
              <h3 className="mt-4 text-base font-medium text-gray-700">
                No teachers found
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Try adjusting your search or add a new teacher
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-b border-gray-100 bg-gray-50">
                    <TableHead className="text-xs font-medium text-gray-600 py-3">
                      Name
                    </TableHead>
                    <TableHead className="text-xs font-medium text-gray-600 py-3">
                      Phone
                    </TableHead>
                    <TableHead className="text-xs font-medium text-gray-600 py-3">
                      Cohort
                    </TableHead>
                    <TableHead className="text-xs font-medium text-gray-600 py-3">
                      Anganwadi
                    </TableHead>
                    <TableHead className="text-xs font-medium text-gray-600 py-3 text-right">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTeachers.map((teacher) => (
                    <TableRow
                      key={teacher.id}
                      className="border-b border-gray-100"
                    >
                      <TableCell className="text-sm font-medium text-gray-800 py-3">
                        {teacher.name}
                      </TableCell>
                      <TableCell className="text-sm text-gray-600 py-3">
                        {teacher.phone}
                      </TableCell>
                      <TableCell className="py-3">
                        {teacher.cohort?.name ? (
                          <Badge
                            variant="outline"
                            className="text-xs bg-gray-100 text-gray-700 border-gray-200 font-normal"
                          >
                            {teacher.cohort.name}
                          </Badge>
                        ) : (
                          <span className="text-xs text-gray-400">—</span>
                        )}
                      </TableCell>
                      <TableCell className="py-3">
                        {teacher.anganwadi?.name ? (
                          <Badge
                            variant="outline"
                            className="text-xs bg-gray-100 text-gray-700 border-gray-200 font-normal"
                          >
                            {teacher.anganwadi.name}
                          </Badge>
                        ) : (
                          <Button
                            variant="link"
                            className="text-xs p-0 h-auto text-gray-600 hover:text-gray-800"
                            onClick={() => openAssignAnganwadi(teacher)}
                          >
                            Assign Anganwadi
                          </Button>
                        )}
                      </TableCell>
                      <TableCell className="text-right py-3">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(teacher.id)}
                          className="h-8 w-8 p-0 rounded-full hover:bg-gray-100"
                          disabled={deletingTeacherId === teacher.id}
                        >
                          {deletingTeacherId === teacher.id ? (
                            <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
                          ) : (
                            <Trash2 className="h-4 w-4 text-gray-500" />
                          )}
                          <span className="sr-only">Delete</span>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={assignAnganwadiOpen} onOpenChange={setAssignAnganwadiOpen}>
        <DialogContent className="sm:max-w-[400px] rounded-lg bg-white">
          <DialogHeader>
            <DialogTitle className="text-lg font-medium text-gray-800">
              Assign Anganwadi to {selectedTeacher?.name}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-3">
            <div className="space-y-2">
              <Label
                htmlFor="search-anganwadi"
                className="text-sm font-medium text-gray-600"
              >
                Search Anganwadi
              </Label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-4 w-4 text-gray-400" />
                </div>
                <Input
                  id="search-anganwadi"
                  value={searchAnganwadi}
                  onChange={(e) => setSearchAnganwadi(e.target.value)}
                  placeholder="Search by name or code"
                  className="pl-10 w-full border-gray-200 focus:border-gray-300"
                />
              </div>
            </div>

            <div className="max-h-60 overflow-y-auto border border-gray-200 rounded-md">
              {searchLoading ? (
                <div className="flex justify-center items-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-gray-500" />
                </div>
              ) : anganwadiResults.length === 0 ? (
                <div className="text-center py-8 text-sm text-gray-500">
                  {searchAnganwadi.trim().length < 2
                    ? "Type at least 2 characters to search"
                    : "No anganwadis found"}
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {anganwadiResults.map((anganwadi) => (
                    <button
                      key={anganwadi.id}
                      className="w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors flex justify-between items-center"
                      onClick={() => handleAssignAnganwadi(anganwadi.id)}
                      disabled={assigningAnganwadiId === anganwadi.id}
                    >
                      <div>
                        <div className="font-medium text-sm text-gray-800">
                          {anganwadi.name}
                        </div>
                        <div className="text-xs text-gray-500 mt-0.5">
                          {anganwadi.code}
                        </div>
                      </div>
                      {assigningAnganwadiId === anganwadi.id ? (
                        <Loader2 className="h-4 w-4 animate-spin text-gray-500" />
                      ) : null}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
