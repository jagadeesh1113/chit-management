import { Badge } from "./ui/badge";

export const OwnerBadge = () => {
  return (
    <Badge className="bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300 shrink-0">
      Owner
    </Badge>
  );
};

export const PaymentStatusBadge = ({
  status,
  partial,
}: {
  status: boolean;
  partial?: boolean;
}) => {
  if (status) {
    return (
      <Badge className="bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300 text-xs">
        Paid
      </Badge>
    );
  }
  if (partial) {
    return (
      <Badge className="bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300 text-xs">
        Partially paid
      </Badge>
    );
  }
  return (
    <Badge className="bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300 text-xs">
      Unpaid
    </Badge>
  );
};
