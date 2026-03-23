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
      const formData = new FormData();

      formData.append("chit_id", chitId);
      formData.append("name", user?.user_metadata?.name ?? user?.email);
      formData.append("mobile", user?.user_metadata?.mobile);
      formData.append("owner", JSON.stringify(true));

      const res = await fetch("/api/members", {
        method: "POST",
        body: formData,
      });

      await res.json();
      setIsDialogOpen(false);
      refetch();
    } catch (error: any) {
      setError(error);
    }
  };

  const handleAddChit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/chits", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      const chitDetails = data?.values?.[0];

      await addChitOwnerAsMember({
        chitId: chitDetails?.id,
      });

      if (data.success) {
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
      <DialogContent className="max-w-xl">
        <form onSubmit={editMode ? handleUpdateChit : handleAddChit}>
          <DialogHeader>
            <DialogTitle>
              {editMode ? "Update Chit Details" : "Add chit"}
            </DialogTitle>
            <DialogDescription>
              {editMode
                ? "Chit will be updated to your account."
                : " New chit will be added to your account."}
            </DialogDescription>
          </DialogHeader>
          <FieldGroup className="mb-6 mt-6">
            <Field>
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                name="name"
                required
                defaultValue={selectedChitObj?.name}
              />
            </Field>
            <Field>
              <Label htmlFor="amount">Amount</Label>
              <Input
                id="amount"
                name="amount"
                required
                type="number"
                defaultValue={selectedChitObj?.amount}
              />
            </Field>
            <Field>
              <Label htmlFor="members">No of Members</Label>
              <Input
                id="members"
                type="number"
                required
                name="noOfMembers"
                defaultValue={selectedChitObj?.members}
              />
            </Field>
            <Field>
              <Label htmlFor="auctions">No Of Auctions</Label>
              <Input
                id="auctions"
                type="number"
                required
                name="noOfAuctions"
                defaultValue={selectedChitObj?.months}
              />
            </Field>
            <Field>
              <Label htmlFor="charges">Chit Charges / Month</Label>
              <Input
                id="charges"
                type="number"
                required
                name="charges"
                defaultValue={selectedChitObj?.charges}
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
          {error && <p className="text-sm text-red-500">{error}</p>}
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button type="submit" disabled={isLoading}>
              {confirmButtonText}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
