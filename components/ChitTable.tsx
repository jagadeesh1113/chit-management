/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { TableSkletonRows } from "@/components/table-skleton-rows";
import { Button } from "./ui/button";
import { MoreHorizontalIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { toast } from "sonner";

export const ChitTable = ({
  loading,
  values,
  onSelectChit,
  refetch,
}: {
  loading: boolean;
  values: any[];
  onSelectChit: (_chitObj: any) => void;
  refetch?: () => void;
}) => {
  const router = useRouter();

  const handleViewChit = (chitObj: any) => {
    router.push(`/chit/${chitObj.id}`);
  };

  const handleEditChit = (chitObj: any) => {
    onSelectChit(chitObj);
  };

  const handleDeleteChit = async (chitObj: any) => {
    try {
      const res = await fetch("/api/chits", {
        method: "DELETE",
        body: JSON.stringify({
          chit_id: chitObj?.id,
        }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Chit deleted successfully", {
          position: "top-right",
        });
        refetch?.();
      } else {
        toast.error("Chit deleted failed", {
          position: "top-right",
        });
      }
    } catch (error: any) {
      toast.error("Chit deleted failed" + error, {
        position: "top-right",
      });
    }
  };

  const renderTableRows = () => {
    if (loading) {
      return <TableSkletonRows rowsCount={5} colsCount={7} />;
    }

    return values?.map((chitObj: any) => {
      return (
        <TableRow key={chitObj.id}>
          <TableCell className="font-medium">{chitObj.name}</TableCell>
          <TableCell>{chitObj.amount}</TableCell>
          <TableCell>{chitObj.members}</TableCell>
          <TableCell>{chitObj.months}</TableCell>
          <TableCell>{chitObj.charges}</TableCell>
          <TableCell>{chitObj.start_date}</TableCell>
          <TableCell className="text-right">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="size-8">
                  <MoreHorizontalIcon />
                  <span className="sr-only">Open menu</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => handleViewChit(chitObj)}>
                  View
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleEditChit(chitObj)}>
                  Edit
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-red-600 focus:bg-red-100 focus:text-red-600 dark:focus:bg-red-900"
                  onClick={() => handleDeleteChit(chitObj)}
                >
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </TableCell>
        </TableRow>
      );
    });
  };

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Amount</TableHead>
          <TableHead>No of Members</TableHead>
          <TableHead>No Of Months</TableHead>
          <TableHead>Charges / Month</TableHead>
          <TableHead>Start Date</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>{renderTableRows()}</TableBody>
    </Table>
  );
};
