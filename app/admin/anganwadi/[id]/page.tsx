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
import { ScrollArea } from "@/components/ui/scroll-area";

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
    <div className="min-h-screen bg-background">
      <div className="p-4 md:p-6 lg:p-8 max-w-[1200px] mx-auto">
        <div className="flex flex-col space-y-4">
          {/* Header Section */}
          <div className="flex flex-col space-y-4 sticky top-0 bg-background z-10 pb-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push("/admin/anganwadi")}
              className="w-fit -ml-2 hover:bg-muted"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to List
            </Button>

            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
                Anganwadi Details
              </h1>
              <Button
                onClick={() => setShowUpdateForm(true)}
                className="w-full sm:w-auto bg-primary hover:bg-primary/90"
              >
                <Edit className="h-4 w-4 mr-2" />
                Edit Details
              </Button>
            </div>
          </div>

          {/* Main Content */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Left Column - Basic Info and Teacher */}
            <div className="lg:col-span-1 space-y-4">
              {/* Basic Info Card */}
              <Card>
                <CardHeader className="space-y-2">
                  <CardTitle className="flex flex-col space-y-2">
                    <span className="text-xl md:text-2xl font-bold break-words">
                      {anganwadi.name}
                    </span>
                    <Badge variant="secondary" className="w-fit text-sm">
                      {anganwadi.district}
                    </Badge>
                  </CardTitle>
                  <div className="flex items-start space-x-2 text-muted-foreground">
                    <MapPin className="h-4 w-4 flex-shrink-0 mt-1" />
                    <span className="text-sm break-words">
                      {anganwadi.location}
                    </span>
                  </div>
                </CardHeader>
              </Card>

              {/* Teacher Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center">
                    <User className="h-4 w-4 mr-2 text-primary" />
                    Teacher Information
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {anganwadi.teacher ? (
                    <div className="flex flex-col space-y-4">
                      <Avatar className="h-16 w-16 md:h-12 md:w-12 border-2 border-primary/10">
                        <AvatarFallback className="bg-primary/10 text-primary text-lg md:text-base">
                          {anganwadi.teacher.name.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="space-y-1">
                        <p className="font-medium text-base">
                          {anganwadi.teacher.name}
                        </p>
                        <div className="flex items-center text-sm text-muted-foreground">
                          <Phone className="h-3 w-3 mr-1" />
                          {anganwadi.teacher.phone}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-6">
                      <p className="text-muted-foreground mb-4">
                        No teacher assigned
                      </p>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowUpdateForm(true)}
                        className="w-full sm:w-auto"
                      >
                        Assign Teacher
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Right Column - Students List */}
            <div className="lg:col-span-2">
              <Card className="h-full">
                <CardHeader>
                  <div className="space-y-4">
                    <CardTitle className="text-base flex items-center">
                      <Users className="h-4 w-4 mr-2 text-primary" />
                      Students
                    </CardTitle>
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                      <Badge variant="secondary" className="w-fit">
                        {anganwadi.students.length} students
                      </Badge>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowUpdateForm(true)}
                        className="w-full sm:w-auto"
                      >
                        Manage Students
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {anganwadi.students.length > 0 ? (
                    <ScrollArea className="h-[calc(100vh-400px)] min-h-[300px]">
                      <div className="w-full">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead className="w-[100px]">ID</TableHead>
                              <TableHead>Name</TableHead>
                              <TableHead>Gender</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {anganwadi.students.map((student) => (
                              <TableRow key={student.id}>
                                <TableCell className="font-mono text-xs text-muted-foreground">
                                  {student.id.substring(0, 6)}...
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
                    </ScrollArea>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground mb-4">
                        No students assigned to this Anganwadi
                      </p>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowUpdateForm(true)}
                        className="w-full sm:w-auto"
                      >
                        Add Students
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        {/* Update Dialog */}
        <Dialog open={showUpdateForm} onOpenChange={setShowUpdateForm}>
          <DialogContent className="max-w-[calc(100%-2rem)] md:max-w-[600px] p-6">
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
      </div>
    </div>
  );
}

export default function AnganwadiPage({ params }: PageProps) {
  const resolvedParams = use(params);
  return <AnganwadiClient id={resolvedParams.id} />;
}
