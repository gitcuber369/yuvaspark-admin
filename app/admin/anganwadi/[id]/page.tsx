"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { MapPin, User, Phone, Users, Edit, ArrowLeft } from "lucide-react";
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
  students: { id: string; name: string; gender?: string }[];
}

export default function AnganwadiDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const router = useRouter();
  const [anganwadi, setAnganwadi] = useState<Anganwadi | null>(null);
  const [loading, setLoading] = useState(true);
  const [showUpdateForm, setShowUpdateForm] = useState(false);

  useEffect(() => {
    const fetchAnganwadiDetails = async () => {
      try {
        setLoading(true);
        const res = await fetch(`http://localhost:3000/api/anganwadis/${params.id}`, {
          cache: "no-store",
        });
        
        if (!res.ok) {
          throw new Error("Failed to fetch anganwadi");
        }
        
        const data = await res.json();
        setAnganwadi(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchAnganwadiDetails();
    }
  }, [params.id]);

  const handleUpdateSuccess = () => {
    // Refetch anganwadi data
    setShowUpdateForm(false);
    fetchAnganwadiDetails();
  };

  const fetchAnganwadiDetails = async () => {
    try {
      setLoading(true);
      const res = await fetch(`http://localhost:3000/api/anganwadis/${params.id}`, {
        cache: "no-store",
      });
      
      if (!res.ok) {
        throw new Error("Failed to fetch anganwadi");
      }
      
      const data = await res.json();
      setAnganwadi(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container py-8 flex justify-center items-center">
        <div className="text-center">
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  if (!anganwadi) {
    return (
      <div className="container py-8 flex justify-center items-center">
        <div className="text-center">
          <p className="text-red-500">Anganwadi not found</p>
          <Button 
            variant="outline" 
            className="mt-4"
            onClick={() => router.push("/admin/anganwadi")}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Anganwadi List
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-8 space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => router.push("/admin/anganwadi")}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <h1 className="text-3xl font-bold tracking-tight">Anganwadi Details</h1>
        </div>
        
        <Button onClick={() => setShowUpdateForm(true)}>
          <Edit className="h-4 w-4 mr-2" />
          Edit Anganwadi
        </Button>
      </div>

      {/* Update Dialog */}
      <Dialog open={showUpdateForm} onOpenChange={setShowUpdateForm}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogTitle>Update Anganwadi</DialogTitle>
          <DialogDescription>
            Update details or add students to this Anganwadi.
          </DialogDescription>
          <UpdateAnganwadiForm
            anganwadiId={params.id}
            onSuccess={handleUpdateSuccess}
            onClose={() => setShowUpdateForm(false)}
          />
        </DialogContent>
      </Dialog>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>{anganwadi.name}</span>
            <Badge variant="outline">{anganwadi.district}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center space-x-2">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            <span>{anganwadi.location}</span>
          </div>

          {/* Teacher Information */}
          <Card className="border border-muted">
            <CardHeader className="py-3">
              <CardTitle className="text-base flex items-center">
                <User className="h-4 w-4 mr-2" />
                Teacher Information
              </CardTitle>
            </CardHeader>
            <CardContent className="py-3">
              {anganwadi.teacher ? (
                <div className="flex items-center space-x-4">
                  <Avatar>
                    <AvatarFallback>
                      {anganwadi.teacher.name.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{anganwadi.teacher.name}</p>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Phone className="h-3 w-3 mr-1" />
                      {anganwadi.teacher.phone}
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-muted-foreground">No teacher assigned</p>
              )}
            </CardContent>
          </Card>

          {/* Students Information */}
          <Card className="border border-muted">
            <CardHeader className="py-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center">
                  <Users className="h-4 w-4 mr-2" />
                  Students
                </CardTitle>
                <div className="flex items-center gap-3">
                  <Badge variant="secondary">
                    {anganwadi.students.length} students
                  </Badge>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setShowUpdateForm(true)}
                  >
                    Add/Update Students
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="py-3">
              {anganwadi.students.length > 0 ? (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-24">ID</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Gender</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {anganwadi.students.map((student) => (
                        <TableRow key={student.id}>
                          <TableCell className="font-mono text-xs">
                            {student.id.substring(0, 8)}...
                          </TableCell>
                          <TableCell>{student.name}</TableCell>
                          <TableCell>{student.gender || "Not specified"}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="text-center py-6">
                  <p className="text-muted-foreground mb-3">No students assigned</p>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setShowUpdateForm(true)}
                  >
                    Add Students
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </CardContent>
      </Card>
    </div>
  );
}
