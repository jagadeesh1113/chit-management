/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React from "react";
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
import { ViewIcon } from "lucide-react";
import { useRouter } from "next/navigation";

export const ChitTable = ({
  loading,
  values,
}: {
  loading: boolean;
  values: any[];
}) => {
  const router = useRouter();

  const handleViewChit = (chitObj: any) => {
    router.push(`/chit/${chitObj.id}`);
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
            <Button
              variant={"outline"}
              size={"icon"}
              onClick={() => handleViewChit(chitObj)}
            >
              <ViewIcon />
            </Button>
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
