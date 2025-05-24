"use client";
import { use } from "react";
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
  _id: string;
  name: string;
  location: string;
  district: string;
  teacher: { name: string; phone: string } | null;
  students: { id: string; name: string; gender?: string }[];
}

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

function AnganwadiClient({ id }: { id: string }) {
  const router = useRouter();
  const [anganwadi, setAnganwadi] = useState<Anganwadi | null>(null);
  const [loading, setLoading] = useState(true);
  const [showUpdateForm, setShowUpdateForm] = useState(false);

  const fetchAnganwadiDetails = async () => {
    try {
      setLoading(true);
      const res = await fetch(
        `https://api.dreamlaunch.studio/api/anganwadis/${id}`,
        {
          cache: "no-store",
        }
      );

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

  useEffect(() => {
    if (id) {
      fetchAnganwadiDetails();
    }
  }, [id]);

  const handleUpdateSuccess = () => {
    setShowUpdateForm(false);
    fetchAnganwadiDetails();
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
    <div className="container py-8 space-y-8 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push("/admin/anganwadi")}
            className="hover:bg-muted"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to List
          </Button>
          <h1 className="text-3xl font-bold tracking-tight">
            Anganwadi Details
          </h1>
        </div>

        <Button
          onClick={() => setShowUpdateForm(true)}
          className="bg-primary hover:bg-primary/90"
        >
          <Edit className="h-4 w-4 mr-2" />
          Edit Details
        </Button>
      </div>

      {/* Update Dialog */}
      <Dialog open={showUpdateForm} onOpenChange={setShowUpdateForm}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogTitle className="text-xl font-semibold">
            Update Anganwadi
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Update details or add students to this Anganwadi.
          </DialogDescription>
          <UpdateAnganwadiForm
            anganwadiId={id}
            onSuccess={handleUpdateSuccess}
            onClose={() => setShowUpdateForm(false)}
          />
        </DialogContent>
      </Dialog>

      <Card className="shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center justify-between text-2xl">
            <span className="font-bold">{anganwadi.name}</span>
            <Badge variant="secondary" className="text-sm font-medium">
              {anganwadi.district}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-8">
          <div className="flex items-center space-x-2 text-muted-foreground">
            <MapPin className="h-4 w-4" />
            <span className="text-sm">{anganwadi.location}</span>
          </div>

          {/* Teacher Information */}
          <Card className="border border-muted bg-muted/5">
            <CardHeader className="py-4">
              <CardTitle className="text-base flex items-center font-semibold">
                <User className="h-4 w-4 mr-2 text-primary" />
                Teacher Information
              </CardTitle>
            </CardHeader>
            <CardContent className="py-2">
              {anganwadi.teacher ? (
                <div className="flex items-center space-x-4">
                  <Avatar className="h-12 w-12 border-2 border-primary/10">
                    <AvatarFallback className="bg-primary/10 text-primary">
                      {anganwadi.teacher.name.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium text-base">
                      {anganwadi.teacher.name}
                    </p>
                    <div className="flex items-center text-sm text-muted-foreground mt-1">
                      <Phone className="h-3 w-3 mr-1" />
                      {anganwadi.teacher.phone}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-4">
                  <p className="text-muted-foreground">No teacher assigned</p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowUpdateForm(true)}
                    className="mt-2"
                  >
                    Assign Teacher
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Students Information */}
          <Card className="border border-muted bg-muted/5">
            <CardHeader className="py-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center font-semibold">
                  <Users className="h-4 w-4 mr-2 text-primary" />
                  Students
                </CardTitle>
                <div className="flex items-center gap-3">
                  <Badge variant="secondary" className="font-medium">
                    {anganwadi.students.length} students
                  </Badge>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowUpdateForm(true)}
                    className="hover:bg-primary hover:text-primary-foreground"
                  >
                    Manage Students
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="py-2">
              {anganwadi.students.length > 0 ? (
                <div className="rounded-md border bg-background">
                  <Table>
                    <TableHeader>
                      <TableRow className="hover:bg-muted/50">
                        <TableHead className="w-24 font-medium">ID</TableHead>
                        <TableHead className="font-medium">Name</TableHead>
                        <TableHead className="font-medium">Gender</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {anganwadi.students.map((student) => (
                        <TableRow
                          key={student.id}
                          className="hover:bg-muted/50"
                        >
                          <TableCell className="font-mono text-xs text-muted-foreground">
                            {student.id.substring(0, 8)}...
                          </TableCell>
                          <TableCell className="font-medium">
                            {student.name}
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {student.gender || "Not specified"}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground mb-4">
                    No students assigned to this Anganwadi
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowUpdateForm(true)}
                    className="hover:bg-primary hover:text-primary-foreground"
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

export default function AnganwadiPage({ params }: PageProps) {
  const resolvedParams = use(params);
  return <AnganwadiClient id={resolvedParams.id} />;
}
