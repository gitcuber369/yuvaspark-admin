"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Plus, RefreshCw, Phone, MapPin, Trash2, Search } from "lucide-react";
import { API_URL } from "@/lib/config";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";

interface Teacher {
  id: string;
  name: string;
  phone: string;
  cohort?: {
    id: string;
    name: string;
  };
  anganwadi?: {
    id: string;
    name: string;
  };
}

interface Anganwadi {
  id: string;
  name: string;
}

interface Cohort {
  id: string;
  name: string;
}

export default function TeachersPage() {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [filteredTeachers, setFilteredTeachers] = useState<Teacher[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [anganwadis, setAnganwadis] = useState<Anganwadi[]>([]);
  const [cohorts, setCohorts] = useState<Cohort[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [teacherToDelete, setTeacherToDelete] = useState<Teacher | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [newTeacher, setNewTeacher] = useState({
    name: "",
    phone: "",
    anganwadiId: "",
    cohortId: "",
  });

  // Fetch teachers
  const fetchTeachers = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}teachers`);
      if (!response.ok) throw new Error("Failed to fetch teachers");
      const data = await response.json();
      setTeachers(data);
      setFilteredTeachers(data);
    } catch (error) {
      console.error("Error fetching teachers:", error);
      toast.error("Failed to load teachers");
    } finally {
      setLoading(false);
    }
  };

  // Fetch anganwadis
  const fetchAnganwadis = async () => {
    try {
      const response = await fetch(`${API_URL}anganwadis`);
      if (!response.ok) throw new Error("Failed to fetch anganwadis");
      const data = await response.json();
      setAnganwadis(data);
    } catch (error) {
      console.error("Error fetching anganwadis:", error);
      toast.error("Failed to load anganwadis");
    }
  };

  // Fetch cohorts
  const fetchCohorts = async () => {
    try {
      const response = await fetch(`${API_URL}cohorts`);
      if (!response.ok) throw new Error("Failed to fetch cohorts");
      const data = await response.json();
      setCohorts(data);
    } catch (error) {
      console.error("Error fetching cohorts:", error);
      toast.error("Failed to load cohorts");
    }
  };

  useEffect(() => {
    fetchTeachers();
    fetchAnganwadis();
    fetchCohorts();
  }, []);

  const handleDelete = async () => {
    if (!teacherToDelete) return;

    setDeletingId(teacherToDelete.id);
    try {
      const response = await fetch(`${API_URL}teachers/${teacherToDelete.id}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete teacher");

      toast.success("Teacher deleted successfully");
      fetchTeachers(); // Refresh the list
      setIsDeleteDialogOpen(false);
      setTeacherToDelete(null);
    } catch (error) {
      console.error("Error deleting teacher:", error);
      toast.error("Failed to delete teacher");
    } finally {
      setDeletingId(null);
    }
  };

  const handleAddTeacher = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTeacher.anganwadiId) {
      toast.error("Please select an Anganwadi");
      return;
    }

    setIsAdding(true);
    try {
      const response = await fetch(`${API_URL}teachers`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: newTeacher.name,
          phone: newTeacher.phone,
          anganwadiId: newTeacher.anganwadiId,
          cohortId: newTeacher.cohortId || undefined,
        }),
      });

      if (!response.ok) {
        let errorMsg = "Failed to add teacher";
        try {
          const errorData = await response.json();
          if (errorData && (errorData.error || errorData.message)) {
            errorMsg = errorData.error || errorData.message;
          }
          console.error("API error response:", errorData);
        } catch (jsonErr) {
          const text = await response.text();
          if (text) {
            errorMsg = text;
          }
        }
        throw new Error(errorMsg);
      }

      toast.success("Teacher added successfully");
      fetchTeachers(); // Refresh the list
      setIsAddDialogOpen(false);
      setNewTeacher({ name: "", phone: "", anganwadiId: "", cohortId: "" }); // Reset form
    } catch (error: any) {
      console.error("Error adding teacher:", error);
      toast.error(error.message || "Failed to add teacher");
    } finally {
      setIsAdding(false);
    }
  };

  // Handle search
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (!query.trim()) {
      setFilteredTeachers(teachers);
      return;
    }

    const searchTerm = query.toLowerCase();
    const filtered = teachers.filter(
      (teacher) =>
        teacher.name.toLowerCase().includes(searchTerm) ||
        teacher.phone.includes(searchTerm)
    );
    setFilteredTeachers(filtered);
  };

  return (
    <div className="container mx-auto py-4 px-4 md:py-8 md:px-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Teachers</h1>
          <p className="text-sm text-gray-500">Manage and view all teachers</p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
          <div className="relative flex-1 sm:flex-initial">
            <Input
              placeholder="Search by name or phone..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full sm:w-64 pr-8"
            />
            <Search className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
          </div>
          <div className="flex gap-2 justify-end">
            <Button
              onClick={fetchTeachers}
              disabled={loading}
              variant="outline"
              size="icon"
              title="Refresh list"
              className="shrink-0"
            >
              <RefreshCw
                className={`h-4 w-4 ${loading ? "animate-spin" : ""}`}
              />
            </Button>
            <Button
              onClick={() => setIsAddDialogOpen(true)}
              className="whitespace-nowrap"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Teacher
            </Button>
          </div>
        </div>
      </div>

      <Card className="mb-6 bg-blue-50 border-blue-100">
        <CardHeader>
          <div className="space-y-2">
            <p className="text-sm text-blue-600 font-medium">
              Implementation Guide:
            </p>
            <p className="text-sm text-blue-600">
              Only one teacher can be assigned to an anganwadi. Please ensure
              you maintain this one-to-one relationship when assigning teachers.
            </p>
          </div>
        </CardHeader>
      </Card>

      <Card className="border border-gray-100 shadow-sm rounded-lg overflow-hidden">
        <CardHeader>
          <CardTitle>All Teachers</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex justify-center items-center py-8">
              <RefreshCw className="h-8 w-8 animate-spin" />
            </div>
          ) : filteredTeachers.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">
                {searchQuery
                  ? "No teachers found matching your search"
                  : "No teachers found"}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead className="hidden sm:table-cell">
                      Anganwadi
                    </TableHead>
                    <TableHead className="hidden sm:table-cell">
                      Cohort
                    </TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTeachers.map((teacher) => (
                    <TableRow key={teacher.id}>
                      <TableCell>
                        <div className="font-medium">{teacher.name}</div>
                        <div className="sm:hidden text-sm text-gray-500 mt-1">
                          {teacher.anganwadi?.name || "No Anganwadi"}
                        </div>
                        <div className="sm:hidden text-sm text-gray-500">
                          {teacher.cohort?.name ? (
                            <Badge variant="secondary" className="mt-1">
                              {teacher.cohort.name}
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="mt-1">
                              No Cohort
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4 text-gray-500" />
                          <span>{teacher.phone}</span>
                        </div>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">
                        {teacher.anganwadi ? (
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-gray-500" />
                            <span>{teacher.anganwadi.name}</span>
                          </div>
                        ) : (
                          <Badge variant="outline">Not Assigned</Badge>
                        )}
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">
                        {teacher.cohort ? (
                          <Badge variant="secondary">
                            {teacher.cohort.name}
                          </Badge>
                        ) : (
                          <Badge variant="outline">No Cohort</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="destructive"
                          size="sm"
                          disabled={deletingId === teacher.id}
                          onClick={() => {
                            setTeacherToDelete(teacher);
                            setIsDeleteDialogOpen(true);
                          }}
                          className="w-full sm:w-auto"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          {deletingId === teacher.id ? "Deleting..." : "Delete"}
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

      {/* Delete Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px] mx-4">
          <DialogHeader>
            <DialogTitle>Delete Teacher</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-gray-500">
              Are you sure you want to delete {teacherToDelete?.name}? This
              action cannot be undone.
            </p>
          </div>
          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setIsDeleteDialogOpen(false);
                setTeacherToDelete(null);
              }}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deletingId === teacherToDelete?.id}
              className="w-full sm:w-auto"
            >
              {deletingId === teacherToDelete?.id ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Teacher Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-[425px] mx-4">
          <DialogHeader>
            <DialogTitle>Add New Teacher</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAddTeacher}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={newTeacher.name}
                  onChange={(e) =>
                    setNewTeacher({ ...newTeacher, name: e.target.value })
                  }
                  placeholder="Enter teacher's name"
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  value={newTeacher.phone}
                  onChange={(e) =>
                    setNewTeacher({ ...newTeacher, phone: e.target.value })
                  }
                  placeholder="Enter phone number"
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="anganwadi">Anganwadi</Label>
                <Select
                  value={newTeacher.anganwadiId}
                  onValueChange={(value) =>
                    setNewTeacher({ ...newTeacher, anganwadiId: value })
                  }
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select an anganwadi" />
                  </SelectTrigger>
                  <SelectContent>
                    {anganwadis.map((anganwadi) => (
                      <SelectItem key={anganwadi.id} value={anganwadi.id}>
                        {anganwadi.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="cohort">Cohort (Optional)</Label>
                <Select
                  value={newTeacher.cohortId}
                  onValueChange={(value) =>
                    setNewTeacher({ ...newTeacher, cohortId: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a cohort" />
                  </SelectTrigger>
                  <SelectContent>
                    {cohorts.map((cohort) => (
                      <SelectItem key={cohort.id} value={cohort.id}>
                        {cohort.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter className="flex-col sm:flex-row gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsAddDialogOpen(false);
                  setNewTeacher({
                    name: "",
                    phone: "",
                    anganwadiId: "",
                    cohortId: "",
                  });
                }}
                className="w-full sm:w-auto"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isAdding}
                className="w-full sm:w-auto"
              >
                {isAdding ? "Adding..." : "Add Teacher"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
