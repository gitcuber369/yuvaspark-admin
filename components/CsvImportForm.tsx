"use client";
import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, Loader2, AlertCircle, CheckCircle2 } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import API from "@/utils/axiosInstance";
import { useRouter } from "next/navigation";
import { useAnganwadiStore } from "@/app/store/anganwadiStore";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function CsvImportForm() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [importId, setImportId] = useState<string | null>(null);
  const [selectedAnganwadiId, setSelectedAnganwadiId] = useState<string>("none");
  const { anganwadis, fetchAnganwadis } = useAnganwadiStore();
  const router = useRouter();

  useEffect(() => {
    fetchAnganwadis();
  }, [fetchAnganwadis]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      if (
        selectedFile.type !== "text/csv" &&
        !selectedFile.name.endsWith(".csv")
      ) {
        setError("Please select a CSV file");
        setFile(null);
        return;
      }
      setFile(selectedFile);
      setError(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!file) {
      setError("Please select a CSV file to upload");
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      // Add anganwadi ID if one was selected (not "none")
      if (selectedAnganwadiId && selectedAnganwadiId !== "none") {
        formData.append("anganwadiId", selectedAnganwadiId);
      }

      const response = await API.post("/csv-import/students", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      setSuccess("CSV upload successful! Your file is being processed.");
      setImportId(response.data.importId);
    } catch (err: any) {
      console.error("CSV Import error:", err);
      setError(err.response?.data?.error || "Failed to upload CSV file");
    } finally {
      setLoading(false);
    }
  };

  const viewImportStatus = () => {
    if (importId) {
      router.push(`/admin/imports/${importId}`);
    }
  };

  return (
    <Card className="max-w-md w-full">
      <CardHeader>
        <CardTitle className="text-xl">Import Students</CardTitle>
        <CardDescription>
          Upload a CSV file to import student records
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="csv-file">CSV File</Label>
            <Input
              id="csv-file"
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              className="cursor-pointer"
              disabled={loading}
            />
            <p className="text-xs text-gray-500">
              File must be in CSV format and include the required fields.
              <a
                href="/docs/csv-import-guide"
                className="text-blue-500 hover:underline ml-1"
              >
                View format guide
              </a>
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="anganwadi">Assign to Anganwadi (Optional)</Label>
            <Select
              value={selectedAnganwadiId}
              onValueChange={setSelectedAnganwadiId}
            >
              <SelectTrigger id="anganwadi">
                <SelectValue placeholder="Select anganwadi (optional)" />
              </SelectTrigger>
              <SelectContent className="max-h-60">
                <SelectItem value="none">None</SelectItem>
                {anganwadis.map((anganwadi) => (
                  <SelectItem key={anganwadi._id} value={anganwadi._id}>
                    {anganwadi.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-gray-500">
              All imported students will be assigned to the selected anganwadi.
            </p>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert className="bg-green-50 border-green-200">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <AlertTitle className="text-green-600">Success</AlertTitle>
              <AlertDescription className="text-green-700">
                {success}
              </AlertDescription>
            </Alert>
          )}

          <Button
            type="submit"
            className="w-full bg-black text-white hover:bg-gray-800"
            disabled={!file || loading}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="mr-2 h-4 w-4" />
                Upload CSV
              </>
            )}
          </Button>
        </form>
      </CardContent>
      {importId && (
        <CardFooter className="justify-center">
          <Button variant="outline" className="mt-2" onClick={viewImportStatus}>
            View Import Status
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}
