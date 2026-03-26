import { Chit, ChitMonth, Payment } from "@/types";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const fmt = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
});

export const getMonthlyPaymentAmount = ({
  chit,
  month,
  isOwnerAuction = false,
}: {
  month: ChitMonth | null | undefined;
  chit: Chit | null | undefined;
  isOwnerAuction?: boolean;
}) => {
  if (month && chit) {
    const auctionAmount = Number(month.auction_amount);
    const chitAmount = Number(chit.amount);
    const numMembers = Number(chit.members);
    if (isOwnerAuction) {
      return chitAmount / numMembers;
    }
    const payablePerPerson =
      (chitAmount - auctionAmount + chit.charges) / numMembers;
    return payablePerPerson;
  }
  return 0;
};

export const getMonthlyPaidAmount = (paymentObj: Payment) => {
  const paidAmount = paymentObj?.payments?.reduce(
    (acc, paymentDetails) => (acc += paymentDetails?.amount),
    0,
  );
  return paidAmount;
};

export const getNumericAmountWithoutCurrency = (amount: string | undefined) => {
  if (!amount) {
    return 0;
  }
  return Number((amount ?? "").replace(/[₹,\s]/g, "") ?? 0);
};

export const formatDate = (dateStr: string | null | undefined): string => {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

export const formatAmount = (amount: number) => {
  return fmt.format(amount);
};

export const getAuctionUserPayableAmount = ({
  chit,
  month,
}: {
  chit: Chit | null;
  month: ChitMonth;
}) => {
  if (!chit) {
    return;
  }
  if (month?.is_owner_auction) {
    return chit.amount - month.auction_amount;
  }
  return (
    chit.amount -
    month.auction_amount -
    getMonthlyPaymentAmount({
      chit,
      month,
      isOwnerAuction: month?.is_owner_auction,
    })
  );
};

export const getWhatsAppChitMesssageTemplate = ({
  chit,
  month,
}: {
  chit: Chit | undefined | null;
  month: ChitMonth | undefined | null;
}) => {
  let message: string;

  const payablePerPerson = getMonthlyPaymentAmount({
    chit,
    month,
    isOwnerAuction: month?.is_owner_auction,
  });

  if (month && chit) {
    const auctionAmount = Number(month.auction_amount);
    const numMembers = Number(chit.members);

    const dividendPerMember = month?.is_owner_auction
      ? 0
      : (auctionAmount - chit.charges) / numMembers;
    const auctionDate = month.auction_date
      ? formatDate(month.auction_date)
      : "—";

    message = [
      `Hi ${name},`,
      ``,
      `${auctionDate}`,
      `Chits ${formatAmount(chit.amount)}, ${month.name}`,
      `Auction Amount: ${formatAmount(auctionAmount)}`,
      `Dividend Per Member: ${formatAmount(dividendPerMember)}`,
      `Payable Amount Per Person: ${formatAmount(payablePerPerson)}`,
      ``,
      `Thank you!`,
    ].join("\n");
  } else {
    // Fallback if month/chit context isn't available
    message = `Hi ${name}, your chit payment of ₹${formatAmount(payablePerPerson)} is due. Please make the payment at the earliest. Thank you!`;
  }
  return message;
};
