import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

interface Student {
  id: string;
  name: string;
  status: string;
  createdAt: string;
}

export const columns: ColumnDef<Student>[] = [
  {
    accessorKey: "name",
    header: "Student Name",
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as string;
      return (
        <Badge variant={status === "ACTIVE" ? "default" : "secondary"}>
          {status}
        </Badge>
      );
    },
  },
  {
    accessorKey: "createdAt",
    header: "Joined Date",
    cell: ({ row }) => {
      const date = row.getValue("createdAt") as string;
      return format(new Date(date), "MMM d, yyyy");
    },
  },
]; 