/* eslint-disable @typescript-eslint/no-explicit-any */
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
import { Field, FieldGroup } from "@/components/ui/field";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import React from "react";
import { toast } from "sonner";

export const AddMembers = ({
  chitId,
  refetch,
}: {
  chitId: string;
  refetch: () => void;
}) => {
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);

  const handleAddMember = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);

    formData.append("chit_id", chitId);

    try {
      const res = await fetch("/api/members", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (data.success) {
        toast.success("Member added successfully", {
          position: "top-right",
        });
        setIsDialogOpen(false);
        refetch();
      } else {
        setError(data.error);
      }
    } catch (error: any) {
      setError(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button>Add Member</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-sm">
        <form onSubmit={handleAddMember}>
          <DialogHeader>
            <DialogTitle>Add member</DialogTitle>
            <DialogDescription>
              Member will be added to this chit.
            </DialogDescription>
          </DialogHeader>
          <FieldGroup className="mb-6">
            <Field>
              <Label htmlFor="name">Name</Label>
              <Input id="name" name="name" placeholder="add name" required />
            </Field>
            <Field>
              <Label htmlFor="mobile">Mobile</Label>
              <Input
                id="mobile"
                name="mobile"
                placeholder="add mobile number"
                required
              />
            </Field>
          </FieldGroup>
          {error && <p className="text-sm text-red-500">{error}</p>}
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button type="submit" disabled={loading}>
              {loading ? "Adding member" : "Add Member"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
