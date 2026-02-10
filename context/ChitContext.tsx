/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { useFetchChitDetails } from "@/hooks/use-fetch-chit-details";
import React from "react";

export const ChitContext = React.createContext<{
  chitDetails: any;
}>({
  chitDetails: null,
});

export const ChitProvider = ({
  children,
  chitId,
}: {
  children: any;
  chitId: string;
}) => {
  const { chitDetails } = useFetchChitDetails(chitId);

  return (
    <ChitContext.Provider value={{ chitDetails: chitDetails }}>
      {children}
    </ChitContext.Provider>
  );
};
