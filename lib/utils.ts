import { Chit, ChitMonth } from "@/types";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const getMonthlyPaymentAmount = ({
  chit,
  month,
}: {
  month: ChitMonth | null | undefined;
  chit: Chit | null | undefined;
}) => {
  if (month && chit) {
    const auctionAmount = Number(month.auction_amount);
    const chitAmount = Number(chit.amount);
    const numMembers = Number(chit.members);
    const payablePerPerson =
      (chitAmount - auctionAmount + chit.charges) / numMembers;
    return payablePerPerson;
  }
  return 0;
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
