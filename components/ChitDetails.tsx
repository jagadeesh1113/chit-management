/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { Card, CardContent } from "./ui/card";
import { CardValues } from "./CardValues";
import { ChitMembers } from "./ChitMembers";
import { useFetchChitDetails } from "@/hooks/use-fetch-chit-details";
import { MemberProvider } from "@/context/MemberContext";
import { ChitMonths } from "./ChitMonths";

export const ChitDetails = ({ id }: { id: string }) => {
  const { chitDetails } = useFetchChitDetails(id);

  return (
    <div>
      <h5 className="mb-4 text-xl font-bold tracking-tight text-gray-900">
        Chit Details
      </h5>
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <CardValues label={"Name"} value={chitDetails?.name} />
            <CardValues label={"Amount"} value={chitDetails?.amount} />
            <CardValues label={"No of Members"} value={chitDetails?.members} />
            <CardValues label={"No of Months"} value={chitDetails?.months} />
            <CardValues label={"Start Date"} value={chitDetails?.start_date} />
            <CardValues
              label={"Charges / Month"}
              value={chitDetails?.charges}
            />
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
