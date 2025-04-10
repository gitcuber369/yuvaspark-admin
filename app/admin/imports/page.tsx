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
import { 
  Loader2, 
  FileText, 
  RefreshCw, 
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  ExternalLink
} from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import Link from "next/link";

interface CsvImport {
  id: string;
  filename: string;
  status: string;
  importedBy: string;
  createdAt: string;
  updatedAt: string;
}

export default function ImportsListPage() {
  const [imports, setImports] = useState<CsvImport[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const router = useRouter();

  const fetchImports = async () => {
    setLoading(true);
    try {
      const response = await API.get(`/csv-import?page=${page}&limit=10`);
      setImports(response.data.items);
      setTotalPages(response.data.totalPages || 1);
      setError(null);
    } catch (err: any) {
      console.error("Error fetching imports:", err);
      setError(err.response?.data?.error || "Failed to fetch imports");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchImports();
  }, [page]);

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

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">CSV Imports</h1>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchImports}
            className="border-black text-black hover:bg-gray-100"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button 
            size="sm"
            className="bg-black text-white hover:bg-gray-800"
            onClick={() => router.push("/admin/students")}
          >
            Import New CSV
          </Button>
        </div>
      </div>

      {loading && imports.length === 0 ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">Loading imports...</span>
        </div>
      ) : error ? (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : imports.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center h-64">
            <FileText className="h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-1">No imports found</h3>
            <p className="text-gray-500">
              You haven't imported any CSV files yet.
            </p>
            <Button 
              className="mt-4 bg-black text-white hover:bg-gray-800"
              onClick={() => router.push("/admin/students")}
            >
              Import Students
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Import History</CardTitle>
              <CardDescription>
                View and manage previous CSV imports
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-gray-50 text-left">
                      <th className="p-3 text-sm font-medium text-gray-500">Filename</th>
                      <th className="p-3 text-sm font-medium text-gray-500">Status</th>
                      <th className="p-3 text-sm font-medium text-gray-500">Imported By</th>
                      <th className="p-3 text-sm font-medium text-gray-500">Date</th>
                      <th className="p-3 text-sm font-medium text-gray-500">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {imports.map((importItem) => (
                      <tr key={importItem.id} className="hover:bg-gray-50">
                        <td className="p-3">
                          <div className="flex items-center">
                            <FileText className="h-4 w-4 mr-2 flex-shrink-0" />
                            <span className="text-sm truncate max-w-[200px]">
                              {importItem.filename}
                            </span>
                          </div>
                        </td>
                        <td className="p-3">
                          <Badge className={getStatusColor(importItem.status)}>
                            {importItem.status}
                          </Badge>
                        </td>
                        <td className="p-3 text-sm">{importItem.importedBy}</td>
                        <td className="p-3 text-sm">
                          {new Date(importItem.createdAt).toLocaleString()}
                        </td>
                        <td className="p-3">
                          <Link href={`/admin/imports/${importItem.id}`}>
                            <Button
                              size="sm"
                              variant="outline"
                              className="flex items-center text-xs"
                            >
                              Details
                              <ExternalLink className="h-3 w-3 ml-1" />
                            </Button>
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-between items-center mt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((p) => Math.max(p - 1, 1))}
                    disabled={page === 1}
                  >
                    <ChevronLeft className="h-4 w-4 mr-1" />
                    Previous
                  </Button>
                  <span className="text-sm">
                    Page {page} of {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
                    disabled={page === totalPages}
                  >
                    Next
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
} 