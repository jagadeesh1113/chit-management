/* eslint-disable @typescript-eslint/no-explicit-any */
import { Button } from "./ui/button";
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
import React from "react";
import { toast } from "sonner";

const PaymentStatus = ({ status }: { status: boolean }) => {
  if (status) {
    return (
      <Badge className="bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300">
        Paid
      </Badge>
    );
  }
  return (
    <Badge className="bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300">
      Not Paid
    </Badge>
  );
};

export const ChitPaymentsTable = ({
  refetch,
  loading,
  values,
}: {
  refetch: () => void;
  loading: boolean;
  values: any[];
}) => {
  const [error, setError] = React.useState(null);

  const handleUpdatePaymentStatus = async (paymentObj: any) => {
    try {
      const res = await fetch("/api/payments", {
        method: "PUT",
        body: JSON.stringify({
          payment_id: paymentObj?.payment_id,
          payment_status: !paymentObj?.payment_status,
        }),
      });

      const data = await res.json();
      if (data.success) {
        toast.success("Payment updated successfully", {
          position: "top-right",
        });
        refetch();
      } else {
        setError(data.error);
      }
    } catch (error: any) {
      setError(error);
    }
  };

  const renderTableRows = () => {
    if (loading) {
      return <TableSkletonRows rowsCount={5} colsCount={4} />;
    }

    return values?.map((paymentObj: any) => {
      return (
        <TableRow key={paymentObj.payment_id}>
          <TableCell className="font-medium">{paymentObj.name}</TableCell>
          <TableCell>{paymentObj.mobile}</TableCell>
          <TableCell>{paymentObj.amount}</TableCell>
          <TableCell>
            <PaymentStatus status={paymentObj?.payment_status} />
          </TableCell>
          <TableCell className="text-right">
            <Button
              variant={"outline"}
              onClick={() => handleUpdatePaymentStatus(paymentObj)}
            >
              Mark as Paid
            </Button>
          </TableCell>
        </TableRow>
      );
    });
  };

  return (
    <>
      {error && <p className="text-sm text-red-500">{error}</p>}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Mobile</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Payment Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>{renderTableRows()}</TableBody>
      </Table>
    </>
  );
};
