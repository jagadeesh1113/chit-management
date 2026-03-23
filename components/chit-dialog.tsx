/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useEffect, useMemo, useState } from "react";
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
import { Field, FieldGroup } from "./ui/field";
import CurrencyInput from "react-currency-input-field";

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

  const { user } = useAuth();

  const router = useRouter();

  useEffect(() => {
    if (editMode) {
      setIsDialogOpen(true);
    }
  }, [editMode]);

  const confirmButtonText = useMemo(() => {
    if (editMode) {
      if (isLoading) {
        return "Updating Chit";
      }
      return "Update Chit";
    }
    if (isLoading) {
      return "Adding Chit";
    }
    return "Add Chit";
  }, [editMode, isLoading]);

  const addChitOwnerAsMember = async ({ chitId }: { chitId: string }) => {
    try {
      const res = await fetch("/api/members", {
        method: "POST",
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

      await res.json();
      setIsDialogOpen(false);
      refetch();
    } catch (error: any) {
      setError(error);
    }
  };

  const formatCurrencyInputFields = (formData: FormData) => {
    // Replace currency values to numbers
    formData.set(
      "amount",
      (formData.get("amount") as string)?.replace(/[₹,]/g, ""),
    );
    formData.set(
      "charges",
      (formData.get("charges") as string)?.replace(/[₹,]/g, ""),
    );
  };

  const handleAddChit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    setIsLoading(true);
    setError(null);

    formatCurrencyInputFields(formData);

    try {
      const res = await fetch("/api/chits", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (data.success) {
        const chitDetails = data?.values?.[0];

        await addChitOwnerAsMember({
          chitId: chitDetails?.id,
        });
        toast.success("Chit added successfully", {
          position: "top-right",
        });
        router.push("/");
      } else {
        setError(data.error);
      }
    } catch (error: any) {
      setError(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateChit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    formData.append("id", selectedChitObj?.id);
    setIsLoading(true);
    setError(null);

    // Replace currency values to numbers
    formatCurrencyInputFields(formData);

    try {
      const res = await fetch("/api/chits", {
        method: "PUT",
        body: formData,
      });

      const data = await res.json();

      if (data.success) {
        toast.success("Chit updated successfully", {
          position: "top-right",
        });
        setIsDialogOpen(false);
        onReset?.();
        refetch();
      } else {
        setError(data.error);
      }
    } catch (error: any) {
      setError(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenChange = (open: boolean) => {
    setIsDialogOpen(open);
    if (!open) {
      onReset?.();
    }
  };

  return (
    <Dialog open={isDialogOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button>Add Chit</Button>
      </DialogTrigger>
      <DialogContent className="w-[calc(100vw-2rem)] max-w-xl rounded-xl p-0 gap-0">
        <form
          onSubmit={editMode ? handleUpdateChit : handleAddChit}
          className="flex flex-col max-h-[90dvh]"
        >
          {/* Fixed header */}
          <DialogHeader className="px-5 pt-5 pb-4 border-b border-border shrink-0">
            <DialogTitle>
              {editMode ? "Update Chit Details" : "Add Chit"}
            </DialogTitle>
            <DialogDescription>
              {editMode
                ? "Update the details for this chit."
                : "Fill in the details to create a new chit."}
            </DialogDescription>
          </DialogHeader>

          {/* Scrollable body */}
          <div className="flex-1 overflow-y-auto px-5 py-4">
            <FieldGroup>
              <Field>
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  name="name"
                  placeholder="e.g. Family Chit 2025"
                  required
                  defaultValue={selectedChitObj?.name}
                />
              </Field>
              <Field>
                <Label htmlFor="amount">Amount</Label>
                <CurrencyInput
                  id="amount"
                  name="amount"
                  required
                  defaultValue={selectedChitObj?.amount}
                  intlConfig={{ locale: "hi-IN", currency: "INR" }}
                  customInput={Input}
                />
              </Field>
              <Field>
                <Label htmlFor="members">No of Members</Label>
                <Input
                  id="members"
                  type="number"
                  min={1}
                  required
                  name="noOfMembers"
                  defaultValue={selectedChitObj?.members}
                />
              </Field>
              <Field>
                <Label htmlFor="auctions">No of Auctions</Label>
                <Input
                  id="auctions"
                  type="number"
                  min={1}
                  required
                  name="noOfAuctions"
                  defaultValue={selectedChitObj?.months}
                />
              </Field>
              <Field>
                <Label htmlFor="charges">Charges / Month</Label>
                <CurrencyInput
                  id="charges"
                  name="charges"
                  required
                  defaultValue={selectedChitObj?.charges}
                  intlConfig={{ locale: "hi-IN", currency: "INR" }}
                  customInput={Input}
                />
              </Field>
              <Field>
                <Label htmlFor="start-date">Start Date</Label>
                <Input
                  id="start-date"
                  type="date"
                  required
                  name="startDate"
                  defaultValue={selectedChitObj?.start_date}
                />
              </Field>
            </FieldGroup>
            {error && <p className="mt-3 text-sm text-red-500">{error}</p>}
          </div>

          {/* Fixed footer */}
          <DialogFooter className="px-5 py-4 border-t border-border shrink-0 flex-row gap-2">
            <DialogClose asChild>
              <Button variant="outline" className="flex-1 sm:flex-none">
                Cancel
              </Button>
            </DialogClose>
            <Button
              type="submit"
              disabled={isLoading}
              className="flex-1 sm:flex-none"
            >
              {confirmButtonText}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
