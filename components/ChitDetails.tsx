/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { Card, CardContent } from "./ui/card";
import { CardValues } from "./CardValues";
import { ChitMembers } from "./ChitMembers";
import { MemberProvider } from "@/context/MemberContext";
import { ChitMonths } from "./ChitMonths";
import { ChitContext } from "@/context/ChitContext";
import { ArrowLeftIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "./ui/button";
import React from "react";

export const ChitDetails = ({ id }: { id: string }) => {
  const { chitDetails } = React.useContext(ChitContext);
  const router = useRouter();

  return (
    <div className="space-y-6">
      {/* Back + title row */}
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          className="size-8 shrink-0"
          onClick={() => router.back()}
        >
          <ArrowLeftIcon className="size-4" />
        </Button>
        <div>
          <h1 className="text-base font-semibold sm:text-lg leading-tight">
            {chitDetails?.name ?? "Chit Details"}
          </h1>
          <p className="text-xs text-muted-foreground">Started {chitDetails?.start_date}</p>
        </div>
      </div>

      {/* Summary card */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
            <CardValues label="Name" value={chitDetails?.name} />
            <CardValues label="Amount" value={chitDetails?.amount} />
            <CardValues label="Members" value={chitDetails?.members} />
            <CardValues label="Months" value={chitDetails?.months} />
            <CardValues label="Start Date" value={chitDetails?.start_date} />
            <CardValues label="Charges / Month" value={chitDetails?.charges} />
          </div>
        </CardContent>
      </Card>

      <MemberProvider chitId={id}>
        <ChitMembers chitId={id} />
        <ChitMonths chitId={id} />
      </MemberProvider>
    </div>
  );
};
