"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { InfoIcon, Download } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function CSVImportGuide() {
  const sampleData = `name,gender,status,anganwadiId
Rahul Kumar,MALE,ACTIVE,a67e8400-e29b-41d4-a716-446655440001
Priya Singh,FEMALE,ACTIVE,a67e8400-e29b-41d4-a716-446655440001`;

  const downloadSampleCSV = () => {
    const blob = new Blob([sampleData], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "student-import-sample.csv";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="container mx-auto py-8 max-w-4xl space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Student Data Import Guide</CardTitle>
          <CardDescription>
            Learn how to format your CSV file for importing student data into
            YuvaSpark
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Quick Start Section */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Quick Start</h2>
            <Alert>
              <InfoIcon className="h-4 w-4" />
              <AlertTitle>Important</AlertTitle>
              <AlertDescription>
                Ensure your CSV file follows the exact format specified below.
                The first row must contain the column headers exactly as shown.
              </AlertDescription>
            </Alert>
            <Button
              onClick={downloadSampleCSV}
              variant="outline"
              className="gap-2"
            >
              <Download className="h-4 w-4" />
              Download Sample CSV
            </Button>
          </div>

          {/* Required Fields Section */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Required Fields</h2>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Column Name</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Format</TableHead>
                  <TableHead>Required</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell className="font-mono">name</TableCell>
                  <TableCell>Full name of the student</TableCell>
                  <TableCell>Text</TableCell>
                  <TableCell>No</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-mono">gender</TableCell>
                  <TableCell>Gender of the student</TableCell>
                  <TableCell>MALE or FEMALE</TableCell>
                  <TableCell>No (defaults to MALE)</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-mono">status</TableCell>
                  <TableCell>Current status of the student</TableCell>
                  <TableCell>Text (e.g., "ACTIVE")</TableCell>
                  <TableCell>No (defaults to "ACTIVE")</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-mono">anganwadiId</TableCell>
                  <TableCell>UUID of the associated Anganwadi</TableCell>
                  <TableCell>UUID format</TableCell>
                  <TableCell>No</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>

          {/* Guidelines Section */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Guidelines</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>The CSV file must use comma (,) as the delimiter</li>
              <li>
                All text fields should be properly escaped if they contain
                commas
              </li>
              <li>Gender must be either "MALE" or "FEMALE"</li>
              <li>Status field defaults to "ACTIVE" if not provided</li>
              <li>AnganwadiId must be a valid UUID</li>
              <li>Maximum file size: 10MB</li>
              <li>UTF-8 encoding is required</li>
              <li>The system will automatically generate:</li>
              <ul className="list-circle pl-6 mt-2">
                <li>A unique UUID for each student</li>
                <li>Creation timestamp (createdAt)</li>
                <li>Last update timestamp (updatedAt)</li>
              </ul>
            </ul>
          </div>

          {/* Sample Data Section */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Sample Data Format</h2>
            <pre className="bg-secondary/20 p-4 rounded-lg overflow-x-auto">
              <code>{sampleData}</code>
            </pre>
          </div>

          {/* Notes Section */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Additional Notes</h2>
            <Alert>
              <InfoIcon className="h-4 w-4" />
              <AlertTitle>Relationships</AlertTitle>
              <AlertDescription className="mt-2">
                <ul className="list-disc pl-6 space-y-1">
                  <li>
                    Make sure the anganwadiId values exist in your database
                    before importing
                  </li>
                  <li>
                    The import will create student records with relationships to
                    existing Anganwadis
                  </li>
                  <li>
                    Student evaluations, responses, and submissions should be
                    managed separately
                  </li>
                </ul>
              </AlertDescription>
            </Alert>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
