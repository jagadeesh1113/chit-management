/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
import { AddMembers } from "./add-members";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import { TableSkletonRows } from "./table-skleton-rows";
import { useFetchMembers } from "@/hooks/use-fetch-members";

export const ChitMembers = ({ chitId }: { chitId: string }) => {
  const { values, loading, refetch } = useFetchMembers(chitId);

  const renderTableRows = () => {
    if (loading) {
      return <TableSkletonRows rowsCount={5} colsCount={3} />;
    }
    return values?.map((memberObj: any) => {
      return (
        <TableRow key={memberObj.id}>
          <TableCell className="font-medium">{memberObj?.name}</TableCell>
          <TableCell>{memberObj?.mobile}</TableCell>
          <TableCell>{"-"}</TableCell>
        </TableRow>
      );
    });
  };

  return (
    <div>
      <div className="flex mt-8 mb-4">
        <h5 className="text-xl font-bold tracking-tight text-gray-900 self-center">
          Chit Members
        </h5>
        <div className="flex justify-end self-center ml-auto">
          <AddMembers chitId={chitId} refetch={refetch} />
        </div>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Mobile</TableHead>
            <TableHead>Pending Dues</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>{renderTableRows()}</TableBody>
      </Table>
    </div>
  );
};
