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
import { Skeleton } from "./ui/skeleton";
import React from "react";
import { toast } from "sonner";

const PaymentStatus = ({ status }: { status: boolean }) => {
  if (status) {
    return (
      <Badge className="bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300 text-xs">
        Paid
      </Badge>
    );
  }
  return (
    <Badge className="bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300 text-xs">
      Unpaid
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
        toast.success("Payment updated successfully", { position: "top-right" });
        refetch();
      } else {
        setError(data.error);
      }
    } catch (error: any) {
      setError(error);
    }
  };

  // ── Mobile cards ──────────────────────────────────────────────────────
  const MobileList = () => {
    if (loading) {
      return (
        <div className="space-y-2 p-3 sm:hidden">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="rounded-lg border border-border bg-card p-3 space-y-2">
              <Skeleton className="h-4 w-1/3" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          ))}
        </div>
      );
    }
    return (
      <div className="space-y-2 p-3 sm:hidden">
        {values?.map((paymentObj: any) => (
          <div key={paymentObj.payment_id} className="rounded-lg border border-border bg-card p-3">
            <div className="flex items-center justify-between gap-2">
              <div className="min-w-0">
                <p className="font-medium text-sm truncate">{paymentObj.name}</p>
                <div className="flex items-center gap-2 mt-0.5 text-xs text-muted-foreground">
                  <span>{paymentObj.mobile}</span>
                  <span>·</span>
                  <span>₹{paymentObj.amount}</span>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <PaymentStatus status={paymentObj?.payment_status} />
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7 text-xs px-2"
                  onClick={() => handleUpdatePaymentStatus(paymentObj)}
                >
                  {paymentObj?.payment_status ? "Unpaid" : "Paid"}
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  // ── Desktop table ─────────────────────────────────────────────────────
  const DesktopTable = () => (
    <div className="hidden sm:block">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/40 hover:bg-muted/40">
            <TableHead className="font-medium">Name</TableHead>
            <TableHead className="font-medium">Mobile</TableHead>
            <TableHead className="font-medium">Amount</TableHead>
            <TableHead className="font-medium">Status</TableHead>
            <TableHead className="text-right font-medium">Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            <TableSkletonRows rowsCount={5} colsCount={5} />
          ) : (
            values?.map((paymentObj: any) => (
              <TableRow key={paymentObj.payment_id}>
                <TableCell className="font-medium">{paymentObj.name}</TableCell>
                <TableCell>{paymentObj.mobile}</TableCell>
                <TableCell>{paymentObj.amount}</TableCell>
                <TableCell>
                  <PaymentStatus status={paymentObj?.payment_status} />
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleUpdatePaymentStatus(paymentObj)}
                  >
                    {paymentObj?.payment_status ? "UNPAID" : "PAID"}
                  </Button>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );

  return (
    <>
      {error && <p className="text-sm text-red-500 px-4 pt-2">{error}</p>}
      <MobileList />
      <DesktopTable />
    </>
  );
};
