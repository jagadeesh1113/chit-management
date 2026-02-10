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
import { Badge } from "./ui/badge";
import { MemberContext } from "@/context/MemberContext";

export const ChitMembers = ({ chitId }: { chitId: string }) => {
  const { values, loading, refetch } = React.useContext(MemberContext);

  const renderTableRows = () => {
    if (loading) {
      return <TableSkletonRows rowsCount={5} colsCount={3} />;
    }
    return values?.map((memberObj: any) => {
      return (
        <TableRow key={memberObj.id}>
          <TableCell className="font-medium">
            <div className="flex">
              <div>{memberObj?.name}</div>
              {memberObj.owner ? (
                <Badge className="bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300 ml-2">
                  Owner
                </Badge>
              ) : null}
            </div>
          </TableCell>
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
          Chit Members ({values.length})
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
