/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { Button } from "./ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import React from "react";
import { toast } from "sonner";
import { ChitMemberSelect } from "./ChitMemberSelect";
import { MemberContext } from "@/context/MemberContext";
import { ChitContext } from "@/context/ChitContext";
import CurrencyInput from "react-currency-input-field";
import {
  PlusIcon,
  CalendarIcon,
  TagIcon,
  UserIcon,
  InfoIcon,
  BanknoteIcon,
} from "lucide-react";
import {
  getMonthlyPaymentAmount,
  getNumericAmountWithoutCurrency,
} from "@/lib/utils";
import { ChitMonth, Member } from "@/types";

export const AddMonths = ({
  chitId,
  refetch,
}: {
  chitId: string;
  refetch: () => void;
}) => {
  const { values: members } = React.useContext(MemberContext);
  const { chitDetails } = React.useContext(ChitContext);

  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [auctionUser, setAuctionUser] = React.useState<string>("");
  const [auctionAmount, setAuctionAmount] = React.useState<string>("");

  const resetForm = () => {
    setAuctionUser("");
    setAuctionAmount("");
    setError(null);
  };

  const handleOpenChange = (open: boolean) => {
    setIsDialogOpen(open);
    if (!open) resetForm();
  };

  // ── Derived preview ──────────────────────────────────────────────────────
  const formatter = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });

  const chitAmount = Number(chitDetails?.amount ?? 0);
  const chitCharges = Number(chitDetails?.charges ?? 0);
  const chitMonths = Number(chitDetails?.months ?? 1);
  const parsedAuction = Number(
    (auctionAmount ?? "").replace(/[₹,\s]/g, "") || 0,
  );

  const auctionMember = members?.find((m: any) => m.id === auctionUser);
  const isOwner = auctionMember?.owner ?? false;

  const amountPerMember = isOwner
    ? chitAmount / chitMonths
    : (chitAmount - parsedAuction + chitCharges) / chitMonths;

  const showPreview = parsedAuction >= 0 && auctionUser;

  // ── Add payments ─────────────────────────────────────────────────────────
  const addPaymentsForOwnerAndAuctionUser = async ({
    month,
    owner,
  }: {
    month: ChitMonth;
    owner?: Member;
  }) => {
    const monthlyPaymentAmount = getMonthlyPaymentAmount({
      month,
      chit: chitDetails,
      isOwnerAuction: owner?.id === month?.auction_user,
    });
    const selfPayments = [
      // auction user
      ...(month?.auction_user !== owner?.id
        ? [
            {
              member_id: month?.auction_user,
              amount: monthlyPaymentAmount,
              chit_id: chitDetails?.id,
              month_id: month?.id,
              payment_date: month?.auction_date,
              payment_type: "cash",
            },
          ]
        : []),
      // chit owner
      {
        member_id: owner?.id,
        amount: monthlyPaymentAmount,
        chit_id: chitDetails?.id,
        month_id: month?.id,
        payment_date: month?.auction_date,
        payment_type: "cash",
      },
    ];

    try {
      const res = await fetch("/api/payments/bulk", {
        method: "POST",
        body: JSON.stringify({
          payments: selfPayments,
        }),
      });
      await res.json();
    } catch (err: any) {
      setError(err?.message ?? "Failed to create payments");
    }
  };

  // ── Submit ────────────────────────────────────────────────────────────────
  const handleAddMonth = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    formData.append("chit_id", chitId);
    formData.append("auction_user", auctionUser);

    // Strip currency formatting before sending
    const rawAmount = getNumericAmountWithoutCurrency(
      formData.get("auction_amount") as string,
    )?.toString();
    formData.set("auction_amount", rawAmount);

    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/months", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();

      if (data.success) {
        const auctionDetails = data?.values?.[0];
        await addPaymentsForOwnerAndAuctionUser({
          month: auctionDetails,
          owner: members?.find((memberObj) => memberObj?.owner === true),
        });
        toast.success("Month added successfully", { position: "top-right" });
        setIsDialogOpen(false);
        resetForm();
        refetch();
      } else {
        setError(data.error);
      }
    } catch (err: any) {
      setError(err?.message ?? "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <Dialog open={isDialogOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button size="sm">
          <PlusIcon className="size-3.5" />
          Add Month
        </Button>
      </DialogTrigger>

      <DialogContent className="w-[calc(100vw-2rem)] max-w-md rounded-xl p-0 gap-0">
        <form onSubmit={handleAddMonth} className="flex flex-col max-h-[90dvh]">
          {/* Fixed header */}
          <DialogHeader className="px-5 pt-5 pb-4 border-b border-border shrink-0">
            <DialogTitle className="text-base">Add Month / Auction</DialogTitle>
            <DialogDescription className="text-xs">
              Record a new auction month for this chit
            </DialogDescription>
          </DialogHeader>

          {/* Scrollable body */}
          <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
            {/* Month name */}
            <div className="space-y-1.5">
              <Label
                htmlFor="name"
                className="text-xs font-medium text-muted-foreground uppercase tracking-wide"
              >
                Month / Auction name
              </Label>
              <div className="relative">
                <TagIcon className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground pointer-events-none" />
                <Input
                  id="name"
                  name="name"
                  placeholder="e.g. Month 1 or January 2025"
                  required
                  type="text"
                  className="pl-8"
                />
              </div>
            </div>

            {/* Auction date */}
            <div className="space-y-1.5">
              <Label
                htmlFor="auction_date"
                className="text-xs font-medium text-muted-foreground uppercase tracking-wide"
              >
                Auction date
              </Label>
              <div className="relative">
                <CalendarIcon className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground pointer-events-none" />
                <Input
                  id="auction_date"
                  name="auction_date"
                  required
                  type="date"
                  className="pl-8"
                />
              </div>
            </div>

            {/* Auction amount */}
            <div className="space-y-1.5">
              <Label
                htmlFor="auction_amount"
                className="text-xs font-medium text-muted-foreground uppercase tracking-wide"
              >
                Auction amount
              </Label>
              <div className="relative">
                <BanknoteIcon className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground pointer-events-none" />
                <CurrencyInput
                  id="auction_amount"
                  name="auction_amount"
                  required
                  placeholder="₹0"
                  intlConfig={{ locale: "hi-IN", currency: "INR" }}
                  customInput={Input}
                  className="pl-8"
                  onValueChange={(value) => setAuctionAmount(value ?? "")}
                />
              </div>
            </div>

            {/* Auction winner */}
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Auction winner
              </Label>
              <div className="relative">
                <UserIcon className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground pointer-events-none z-10" />
                <ChitMemberSelect
                  onChange={(value) => setAuctionUser(value)}
                  value={auctionUser}
                  className="pl-8"
                />
              </div>
            </div>

            {/* Payment preview card */}
            {showPreview && (
              <div className="rounded-xl border border-border bg-muted/30 p-4 space-y-3">
                <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  <InfoIcon className="size-3.5" />
                  Payment preview
                </div>
                <div className="space-y-2">
                  <PreviewRow
                    label="Auction winner"
                    value={auctionMember?.name ?? "—"}
                  />
                  <PreviewRow
                    label="Auction amount"
                    value={formatter.format(parsedAuction)}
                  />
                  <div className="border-t border-border pt-2">
                    <PreviewRow
                      label="Each member pays"
                      value={formatter.format(amountPerMember)}
                      highlight
                    />
                  </div>
                </div>
              </div>
            )}

            {error && <p className="text-sm text-red-500">{error}</p>}
          </div>

          {/* Fixed footer */}
          <DialogFooter className="px-5 py-4 border-t border-border shrink-0 flex-row gap-2">
            <DialogClose asChild>
              <Button
                type="button"
                variant="outline"
                className="flex-1 sm:flex-none"
                onClick={resetForm}
              >
                Cancel
              </Button>
            </DialogClose>
            <Button
              type="submit"
              disabled={loading}
              className="flex-1 sm:flex-none"
            >
              {loading ? "Adding…" : "Add Month"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

// ── Preview row ───────────────────────────────────────────────────────────────
function PreviewRow({
  label,
  value,
  highlight = false,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-2">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span
        className={highlight ? "text-sm font-semibold" : "text-xs font-medium"}
      >
        {value}
      </span>
    </div>
  );
}
