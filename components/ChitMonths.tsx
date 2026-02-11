/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import { TableSkletonRows } from "./table-skleton-rows";
import { useFetchChitMonths } from "@/hooks/use-fetch-chit-months";
import { AddMonths } from "./add-months";
import React from "react";
import { MemberContext } from "@/context/MemberContext";
import { MonthlyPaymentsDialog } from "./MonthlyPaymentsDialog";
import { Button } from "./ui/button";
import { ViewIcon } from "lucide-react";

export const ChitMonths = ({ chitId }: { chitId: string }) => {
  const {
    loading,
    values,
    refetch: fetchChitMonths,
  } = useFetchChitMonths(chitId);

  const { values: members } = React.useContext(MemberContext);
  const [selectedMonth, setSelectedMonth] = React.useState<null | any>(null);
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);

  const handleSelectMonthlyPayments = (monthObj: any) => {
    setSelectedMonth(monthObj);
    setIsDialogOpen(true);
  };

  const renderTableRows = () => {
    if (loading) {
      return <TableSkletonRows rowsCount={5} colsCount={4} />;
    }
    return values?.map((auctionObj: any) => {
      const memberDetails: any = members?.find(
        (memberObj: any) => memberObj?.id === auctionObj?.auction_user,
      );
      return (
        <TableRow key={auctionObj.id}>
          <TableCell className="font-medium">{auctionObj?.name}</TableCell>
          <TableCell>{auctionObj?.auction_date}</TableCell>
          <TableCell>{auctionObj?.auction_amount}</TableCell>
          <TableCell>{memberDetails?.name ?? "-"}</TableCell>
          <TableCell>{`${auctionObj?.payments_count} / 20`}</TableCell>
          <TableCell className="text-right">
            <Button
              variant="outline"
              size={"icon"}
              onClick={() => handleSelectMonthlyPayments(auctionObj)}
            >
              <ViewIcon />
            </Button>
          </TableCell>
        </TableRow>
      );
    });
  };

  return (
    <div>
      <div className="flex mt-8 mb-4">
        <h5 className="text-xl font-bold tracking-tight text-gray-900 self-center">
          Chit Months
        </h5>
        <div className="flex justify-end self-center ml-auto">
          <AddMonths chitId={chitId} refetch={fetchChitMonths} />
        </div>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Auction Date</TableHead>
            <TableHead>Auction Amount</TableHead>
            <TableHead>Auction User</TableHead>
            <TableHead>Payments</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>{renderTableRows()}</TableBody>
      </Table>
      <MonthlyPaymentsDialog
        month_name={selectedMonth?.name}
        month_id={selectedMonth?.id}
        isDialogOpen={isDialogOpen}
        onChangeDialogOpen={setIsDialogOpen}
      />
    </div>
  );
};
