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
import { Loader2, Plus, Trash2, UserRound, Phone, School, Search } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function TeachersPage() {
  const {
    teachers,
    assignToAnganwadi,
    assignToCohort,
    getByAnganwadi,
    loading,
    fetchTeachers,
    createTeacher,
    deleteTeacher,
  } = useTeacherStore();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [open, setOpen] = useState(false);
  const [assignAnganwadiOpen, setAssignAnganwadiOpen] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [searchAnganwadi, setSearchAnganwadi] = useState("");
  const [anganwadiResults, setAnganwadiResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [selectedAnganwadi, setSelectedAnganwadi] = useState(null);

  const [creating, setCreating] = useState(false);
  const [deletingTeacherId, setDeletingTeacherId] = useState(null);
  const [assigningAnganwadiId, setAssigningAnganwadiId] = useState(null);

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
          `http://localhost:3000/api/anganwadis?search=${searchAnganwadi}`
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

  const handleDelete = async (id) => {
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

  const openAssignAnganwadi = (teacher) => {
    setSelectedTeacher(teacher);
    setAssignAnganwadiOpen(true);
    setSearchAnganwadi("");
    setAnganwadiResults([]);
  };

  const handleAssignAnganwadi = async (anganwadiId) => {
    if (!selectedTeacher || !anganwadiId) return;
    setAssigningAnganwadiId(anganwadiId);
    try {
      await assignToAnganwadi(selectedTeacher.id, anganwadiId);
      toast.success("Anganwadi assigned successfully!");
      setAssignAnganwadiOpen(false);
      setSelectedTeacher(null);
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
    <div className="container mx-auto py-12 max-w-4xl">
      <Card className="shadow-sm border border-gray-100">
        <CardHeader className="border-b border-gray-100 pb-4">
          <div className="flex justify-between items-center">
            <CardTitle className="text-xl font-medium flex items-center gap-2 text-gray-800">
              <School className="h-5 w-5 text-gray-700" /> Teachers
            </CardTitle>
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="flex items-center gap-1 h-8">
                  <Plus className="h-3.5 w-3.5" /> Add Teacher
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[400px]">
                <DialogHeader>
                  <DialogTitle className="text-lg font-medium">New Teacher</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-sm font-normal text-gray-600">Name</Label>
                    <Input
                      id="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Full name"
                      className="w-full"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone" className="text-sm font-normal text-gray-600">Phone Number</Label>
                    <Input
                      id="phone"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="Phone number"
                      className="w-full"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button onClick={handleSubmit} size="sm" className="w-full" disabled={creating}>
                    {creating ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                    Add Teacher
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
          <div className="mt-4">
            <Input
              placeholder="Search by name or phone number"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full max-w-sm"
            />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex justify-center items-center py-16">
              <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
            </div>
          ) : filteredTeachers.length === 0 ? (
            <div className="text-center py-16 px-4">
              <UserRound className="h-12 w-12 mx-auto text-gray-300" />
              <h3 className="mt-4 text-sm font-medium text-gray-700">No teachers found</h3>
              <p className="mt-1 text-xs text-gray-500">Try adjusting your search</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="text-xs font-medium text-gray-600">Name</TableHead>
                  <TableHead className="text-xs font-medium text-gray-600">Phone</TableHead>
                  <TableHead className="text-xs font-medium text-gray-600">Cohort</TableHead>
                  <TableHead className="text-xs font-medium text-gray-600">Anganwadi</TableHead>
                  <TableHead className="text-xs font-medium text-gray-600 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTeachers.map((teacher) => (
                  <TableRow key={teacher.id} className="hover:bg-gray-50">
                    <TableCell className="text-sm font-medium text-gray-900">{teacher.name}</TableCell>
                    <TableCell className="text-sm text-gray-700">{teacher.phone}</TableCell>
                    <TableCell>
                      {teacher.cohort?.name ? (
                        <Badge variant="outline" className="text-xs font-normal">{teacher.cohort.name}</Badge>
                      ) : (
                        <span className="text-xs text-gray-400">—</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {teacher.anganwadi?.name ? (
                        <Badge variant="outline" className="text-xs font-normal">{teacher.anganwadi.name}</Badge>
                      ) : (
                        <Button variant="link" className="text-xs p-0 h-auto" onClick={() => openAssignAnganwadi(teacher)}>
                          Assign Anganwadi
                        </Button>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(teacher.id)}
                        className="h-8 w-8 p-0"
                        disabled={deletingTeacherId === teacher.id}
                      >
                        {deletingTeacherId === teacher.id ? (
                          <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
                        ) : (
                          <Trash2 className="h-4 w-4 text-gray-500 hover:text-gray-900" />
                        )}
                        <span className="sr-only">Delete</span>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={assignAnganwadiOpen} onOpenChange={setAssignAnganwadiOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle className="text-lg font-medium">Assign Anganwadi to {selectedTeacher?.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="search-anganwadi" className="text-sm font-normal text-gray-600">
                Search Anganwadi
              </Label>
              <Input
                id="search-anganwadi"
                value={searchAnganwadi}
                onChange={(e) => setSearchAnganwadi(e.target.value)}
                placeholder="Search by name or code"
                className="w-full"
              />
            </div>

            <div className="max-h-60 overflow-y-auto border rounded-md">
              {searchLoading ? (
                <div className="flex justify-center items-center py-4">
                  <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
                </div>
              ) : anganwadiResults.length === 0 ? (
                <div className="text-center py-4 text-sm text-gray-500">
                  {searchAnganwadi.trim().length < 2
                    ? "Type at least 2 characters to search"
                    : "No anganwadis found"}
                </div>
              ) : (
                <div className="divide-y">
                  {anganwadiResults.map((anganwadi) => (
                    <button
                      key={anganwadi.id}
                      className="w-full text-left px-4 py-2 hover:bg-gray-50 transition-colors flex justify-between items-center"
                      onClick={() => handleAssignAnganwadi(anganwadi.id)}
                      disabled={assigningAnganwadiId === anganwadi.id}
                    >
                      <div>
                        <div className="font-medium text-sm">{anganwadi.name}</div>
                        <div className="text-xs text-gray-500">{anganwadi.code}</div>
                      </div>
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