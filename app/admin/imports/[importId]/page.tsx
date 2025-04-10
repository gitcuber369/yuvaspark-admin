"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import API from "@/utils/axiosInstance";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, ArrowLeft, FileText, RefreshCw, AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";

interface ImportStatus {
  id: string;
  filename: string;
  status: string;
  importedBy: string;
  createdAt: string;
  updatedAt: string;
  totalRows?: number;
  processedRows?: number;
  successfulRows?: number;
  failedRows?: number;
  errors?: string[];
}

export default function ImportStatusPage({ params }: { params: { importId: string } }) {
  const [importStatus, setImportStatus] = useState<ImportStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const fetchImportStatus = async () => {
    setLoading(true);
    try {
      const response = await API.get(`/csv-import/${params.importId}`);
      setImportStatus(response.data);
      setError(null);
    } catch (err: any) {
      console.error("Error fetching import status:", err);
      setError(err.response?.data?.error || "Failed to fetch import status");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchImportStatus();
    
    // If import is still processing, set up polling
    if (importStatus?.status === "PENDING" || importStatus?.status === "PROCESSING") {
      const intervalId = setInterval(fetchImportStatus, 5000);
      return () => clearInterval(intervalId);
    }
  }, [params.importId, importStatus?.status]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return "bg-green-100 text-green-800 border-green-200";
      case "PENDING":
      case "PROCESSING":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "FAILED":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getProgress = () => {
    if (!importStatus?.totalRows) return 0;
    return Math.round((importStatus.processedRows || 0) / importStatus.totalRows * 100);
  };

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center mb-6">
        <Button
          variant="outline"
          size="sm"
          onClick={() => router.back()}
          className="mr-4"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back
        </Button>
        <h1 className="text-2xl font-bold">Import Status</h1>
      </div>

      {loading && !importStatus ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">Loading import details...</span>
        </div>
      ) : error ? (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : importStatus ? (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-xl">Import Details</CardTitle>
                  <CardDescription>
                    Showing status for import #{importStatus.id}
                  </CardDescription>
                </div>
                <Badge className={getStatusColor(importStatus.status)}>
                  {importStatus.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Filename</h3>
                  <p className="flex items-center mt-1">
                    <FileText className="h-4 w-4 mr-1" />
                    {importStatus.filename}
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Imported By</h3>
                  <p className="mt-1">{importStatus.importedBy}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Created At</h3>
                  <p className="mt-1">
                    {new Date(importStatus.createdAt).toLocaleString()}
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Last Updated</h3>
                  <p className="mt-1">
                    {new Date(importStatus.updatedAt).toLocaleString()}
                  </p>
                </div>
              </div>

              {(importStatus.status === "PENDING" || importStatus.status === "PROCESSING") && (
                <div className="mt-4">
                  <div className="flex justify-between mb-2">
                    <span className="text-sm">Processing...</span>
                    <span className="text-sm">{getProgress()}%</span>
                  </div>
                  <Progress value={getProgress()} className="h-2" />
                </div>
              )}

              {importStatus.totalRows && (
                <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-2">
                  <div className="bg-gray-100 p-3 rounded">
                    <h3 className="text-xs text-gray-500">Total Rows</h3>
                    <p className="text-xl font-semibold">{importStatus.totalRows}</p>
                  </div>
                  <div className="bg-gray-100 p-3 rounded">
                    <h3 className="text-xs text-gray-500">Processed</h3>
                    <p className="text-xl font-semibold">{importStatus.processedRows || 0}</p>
                  </div>
                  <div className="bg-green-50 p-3 rounded">
                    <h3 className="text-xs text-green-600">Successful</h3>
                    <p className="text-xl font-semibold text-green-600">
                      {importStatus.successfulRows || 0}
                    </p>
                  </div>
                  <div className="bg-red-50 p-3 rounded">
                    <h3 className="text-xs text-red-600">Failed</h3>
                    <p className="text-xl font-semibold text-red-600">
                      {importStatus.failedRows || 0}
                    </p>
                  </div>
                </div>
              )}

              {importStatus.errors && importStatus.errors.length > 0 && (
                <div className="mt-4">
                  <h3 className="text-sm font-medium text-gray-500 mb-2">Errors</h3>
                  <div className="bg-red-50 p-3 rounded border border-red-200 max-h-64 overflow-y-auto">
                    <ul className="list-disc pl-5 space-y-1">
                      {importStatus.errors.map((error, index) => (
                        <li key={index} className="text-sm text-red-700">
                          {error}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              <div className="mt-6 text-center">
                <Button
                  variant="outline"
                  onClick={fetchImportStatus}
                  className="border-black text-black hover:bg-gray-100"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh Status
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : null}
    </div>
  );
} 