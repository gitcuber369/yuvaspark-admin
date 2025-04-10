// app/admin/anganwadi/[id]/page.tsx

import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { MapPin, User, Phone, Users } from "lucide-react";

interface Anganwadi {
  id: string;
  name: string;
  location: string;
  district: string;
  teacher: { name: string; phone: string } | null;
  students: { id: string; name: string }[];
}

async function getAnganwadiDetails(id: string): Promise<Anganwadi | null> {
  try {
    const res = await fetch(`http://localhost:3000/api/anganwadis/${id}`, {
      cache: "no-store",
    });
    if (!res.ok) return null;
    return res.json();
  } catch (error) {
    console.error(error);
    return null;
  }
}

export default async function AnganwadiDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const anganwadi = await getAnganwadiDetails(params.id);

  if (!anganwadi) return notFound();

  return (
    <div className="container py-8 space-y-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold tracking-tight">Anganwadi Details</h1>

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
              <CardTitle className="text-base flex items-center justify-between">
                <div className="flex items-center">
                  <Users className="h-4 w-4 mr-2" />
                  Students
                </div>
                <Badge variant="secondary">
                  {anganwadi.students.length} students
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="py-3">
              {anganwadi.students.length > 0 ? (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-24">ID</TableHead>
                        <TableHead>Name</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {anganwadi.students.map((student) => (
                        <TableRow key={student.id}>
                          <TableCell className="font-mono text-xs">
                            {student.id}
                          </TableCell>
                          <TableCell>{student.name}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <p className="text-muted-foreground">No students assigned</p>
              )}
            </CardContent>
          </Card>
        </CardContent>
      </Card>
    </div>
  );
}
