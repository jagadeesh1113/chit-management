/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export function AddChitForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const router = useRouter();

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

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Add a new chit</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAddChit}>
            <div className="flex flex-col gap-6">
              <div className="grid gap-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Your name"
                  required
                  name="name"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="amount">Amount</Label>
                <Input
                  id="amount"
                  type="number"
                  placeholder="100000"
                  required
                  name="amount"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="members">No of Members</Label>
                <Input
                  id="members"
                  type="number"
                  placeholder="10"
                  required
                  name="noOfMembers"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="auctions">No Of Auctions</Label>
                <Input
                  id="auctions"
                  type="number"
                  placeholder="20"
                  required
                  name="noOfAuctions"
                />
              </div>
              <div className="grid gap-2">
                <div className="flex items-center">
                  <Label htmlFor="charges">Chit Charges / Month</Label>
                </div>
                <Input
                  id="charges"
                  type="number"
                  required
                  name="charges"
                  placeholder="3000"
                />
              </div>
              <div className="grid gap-2">
                <div className="flex items-center">
                  <Label htmlFor="start-date">Start Date</Label>
                </div>
                <Input id="start-date" type="date" required name="startDate" />
              </div>
              {error && <p className="text-sm text-red-500">{error}</p>}
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Creating an chit..." : "Create Chit"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
