/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
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
import CurrencyInput from "react-currency-input-field";
import {
  PlusIcon,
  TagIcon,
  IndianRupeeIcon,
  UsersIcon,
  CalendarDaysIcon,
  CalendarIcon,
  InfoIcon,
} from "lucide-react";

// ── helpers ───────────────────────────────────────────────────────────────────
const fmt = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
});

const stripCurrency = (v: string) => v?.replace(/[₹,\s]/g, "") ?? "";

function FieldLabel({
  htmlFor,
  children,
}: {
  htmlFor?: string;
  children: React.ReactNode;
}) {
  return (
    <Label
      htmlFor={htmlFor}
      className="text-xs font-medium text-muted-foreground uppercase tracking-wide"
    >
      {children}
    </Label>
  );
}

function IconInput({ icon, children }: { icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="relative">
      <span className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground pointer-events-none flex items-center">
        {icon}
      </span>
      {children}
    </div>
  );
}

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
      <span className={highlight ? "text-sm font-semibold" : "text-xs font-medium"}>
        {value}
      </span>
    </div>
  );
}

// ── Component ─────────────────────────────────────────────────────────────────
export function AddOrUpdateChit({
  refetch,
  editMode,
  selectedChitObj,
  onReset,
}: {
  refetch: () => void;
  editMode?: boolean;
  selectedChitObj?: any;
  onReset?: () => void;
}) {
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Live preview state
  const [amount, setAmount] = useState<string>(selectedChitObj?.amount ?? "");
  const [charges, setCharges] = useState<string>(selectedChitObj?.charges ?? "");
  const [members, setMembers] = useState<string>(selectedChitObj?.members ?? "");
  const [months, setMonths] = useState<string>(selectedChitObj?.months ?? "");

  const { user } = useAuth();
  const router = useRouter();

  // Sync fields when edit mode populates selectedChitObj
  useEffect(() => {
    if (selectedChitObj) {
      setAmount(selectedChitObj.amount ?? "");
      setCharges(selectedChitObj.charges ?? "");
      setMembers(selectedChitObj.members ?? "");
      setMonths(selectedChitObj.months ?? "");
    }
  }, [selectedChitObj]);

  useEffect(() => {
    if (editMode) setIsDialogOpen(true);
  }, [editMode]);

  // ── Preview calculations ───────────────────────────────────────────────────
  const numAmount  = Number(stripCurrency(String(amount)))  || 0;
  const numCharges = Number(stripCurrency(String(charges))) || 0;
  const numMembers = Number(members) || 0;
  const numMonths  = Number(months)  || 0;

  const monthlyContribution = numMembers > 0 ? numAmount / numMembers : 0;
  const totalPayout         = numAmount > 0 ? numAmount : 0;
  const showPreview         = numAmount > 0 && numMembers > 0 && numMonths > 0;

  // ── Handlers ───────────────────────────────────────────────────────────────
  const resetLiveState = () => {
    setAmount("");
    setCharges("");
    setMembers("");
    setMonths("");
    setError(null);
  };

  const handleOpenChange = (open: boolean) => {
    setIsDialogOpen(open);
    if (!open) {
      onReset?.();
      if (!editMode) resetLiveState();
    }
  };

  const addChitOwnerAsMember = async ({ chitId }: { chitId: string }) => {
    try {
      await fetch("/api/members", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          members: [
            {
              name: user?.user_metadata?.name ?? user?.email,
              mobile: user?.user_metadata?.mobile,
            },
          ],
          chit_id: chitId,
          owner: true,
        }),
      });
      setIsDialogOpen(false);
      refetch();
    } catch (err: any) {
      setError(err?.message ?? "Failed to add owner as member");
    }
  };

  const buildFormData = (event: React.FormEvent<HTMLFormElement>) => {
    const fd = new FormData(event.currentTarget);
    fd.set("amount",  stripCurrency(fd.get("amount")  as string));
    fd.set("charges", stripCurrency(fd.get("charges") as string));
    return fd;
  };

  const handleAddChit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = buildFormData(event);
    setIsLoading(true);
    setError(null);
    try {
      const res  = await fetch("/api/chits", { method: "POST", body: formData });
      const data = await res.json();
      if (data.success) {
        await addChitOwnerAsMember({ chitId: data?.values?.[0]?.id });
        toast.success("Chit added successfully", { position: "top-right" });
        router.push("/");
      } else {
        setError(data.error);
      }
    } catch (err: any) {
      setError(err?.message ?? "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateChit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = buildFormData(event);
    formData.append("id", selectedChitObj?.id);
    setIsLoading(true);
    setError(null);
    try {
      const res  = await fetch("/api/chits", { method: "PUT", body: formData });
      const data = await res.json();
      if (data.success) {
        toast.success("Chit updated successfully", { position: "top-right" });
        setIsDialogOpen(false);
        onReset?.();
        refetch();
      } else {
        setError(data.error);
      }
    } catch (err: any) {
      setError(err?.message ?? "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <Dialog open={isDialogOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button size="sm">
          <PlusIcon className="size-3.5" />
          Add Chit
        </Button>
      </DialogTrigger>

      <DialogContent className="w-[calc(100vw-2rem)] max-w-xl rounded-xl p-0 gap-0">
        <form
          onSubmit={editMode ? handleUpdateChit : handleAddChit}
          className="flex flex-col max-h-[90dvh]"
        >
          {/* Fixed header */}
          <DialogHeader className="px-5 pt-5 pb-4 border-b border-border shrink-0">
            <DialogTitle className="text-base">
              {editMode ? "Update Chit" : "New Chit"}
            </DialogTitle>
            <DialogDescription className="text-xs">
              {editMode
                ? "Update the details for this chit."
                : "Fill in the details to create a new chit."}
            </DialogDescription>
          </DialogHeader>

          {/* Scrollable body */}
          <div className="flex-1 overflow-y-auto px-5 py-5 space-y-4">

            {/* Name */}
            <div className="space-y-1.5">
              <FieldLabel htmlFor="name">Chit name</FieldLabel>
              <IconInput icon={<TagIcon className="size-3.5" />}>
                <Input
                  id="name"
                  name="name"
                  placeholder="e.g. Family Chit 2025"
                  required
                  defaultValue={selectedChitObj?.name}
                  className="pl-8"
                />
              </IconInput>
            </div>

            {/* Amount + Charges — side by side */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <FieldLabel htmlFor="amount">Chit amount</FieldLabel>
                <IconInput icon={<IndianRupeeIcon className="size-3.5" />}>
                  <CurrencyInput
                    id="amount"
                    name="amount"
                    required
                    placeholder="₹0"
                    defaultValue={selectedChitObj?.amount}
                    intlConfig={{ locale: "hi-IN", currency: "INR" }}
                    customInput={Input}
                    className="pl-8"
                    onValueChange={(v) => setAmount(v ?? "")}
                  />
                </IconInput>
              </div>
              <div className="space-y-1.5">
                <FieldLabel htmlFor="charges">Charges / month</FieldLabel>
                <IconInput icon={<IndianRupeeIcon className="size-3.5" />}>
                  <CurrencyInput
                    id="charges"
                    name="charges"
                    required
                    placeholder="₹0"
                    defaultValue={selectedChitObj?.charges}
                    intlConfig={{ locale: "hi-IN", currency: "INR" }}
                    customInput={Input}
                    className="pl-8"
                    onValueChange={(v) => setCharges(v ?? "")}
                  />
                </IconInput>
              </div>
            </div>

            {/* Members + Months — side by side */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <FieldLabel htmlFor="members">No. of members</FieldLabel>
                <IconInput icon={<UsersIcon className="size-3.5" />}>
                  <Input
                    id="members"
                    type="number"
                    min={1}
                    required
                    name="noOfMembers"
                    placeholder="e.g. 20"
                    defaultValue={selectedChitObj?.members}
                    className="pl-8"
                    onChange={(e) => setMembers(e.target.value)}
                  />
                </IconInput>
              </div>
              <div className="space-y-1.5">
                <FieldLabel htmlFor="auctions">No. of auctions</FieldLabel>
                <IconInput icon={<CalendarDaysIcon className="size-3.5" />}>
                  <Input
                    id="auctions"
                    type="number"
                    min={1}
                    required
                    name="noOfAuctions"
                    placeholder="e.g. 20"
                    defaultValue={selectedChitObj?.months}
                    className="pl-8"
                    onChange={(e) => setMonths(e.target.value)}
                  />
                </IconInput>
              </div>
            </div>

            {/* Start date */}
            <div className="space-y-1.5">
              <FieldLabel htmlFor="start-date">Start date</FieldLabel>
              <IconInput icon={<CalendarIcon className="size-3.5" />}>
                <Input
                  id="start-date"
                  type="date"
                  required
                  name="startDate"
                  defaultValue={selectedChitObj?.start_date}
                  className="pl-8"
                />
              </IconInput>
            </div>

            {/* Live preview card */}
            {showPreview && (
              <div className="rounded-xl border border-border bg-muted/30 p-4 space-y-3">
                <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  <InfoIcon className="size-3.5" />
                  Chit summary
                </div>
                <div className="space-y-2">
                  <PreviewRow label="Total chit value"       value={fmt.format(totalPayout)} />
                  <PreviewRow label="Number of members"      value={`${numMembers} members`} />
                  <PreviewRow label="Duration"               value={`${numMonths} months`} />
                  {numCharges > 0 && (
                    <PreviewRow label="Charges / month"      value={fmt.format(numCharges)} />
                  )}
                  <div className="border-t border-border pt-2">
                    <PreviewRow
                      label="Monthly contribution / member"
                      value={fmt.format(monthlyContribution)}
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
                onClick={() => { onReset?.(); if (!editMode) resetLiveState(); }}
              >
                Cancel
              </Button>
            </DialogClose>
            <Button
              type="submit"
              disabled={isLoading}
              className="flex-1 sm:flex-none"
            >
              {isLoading
                ? editMode ? "Updating…" : "Adding…"
                : editMode ? "Update Chit" : "Add Chit"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
