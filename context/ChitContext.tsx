"use client";

import { useFetchChitDetails } from "@/hooks/use-fetch-chit-details";
import React from "react";
import type { ChitContextValue } from "@/types";

export const ChitContext = React.createContext<ChitContextValue>({
  chitDetails: null,
});

export const ChitProvider = ({
  children,
  chitId,
}: {
  children: React.ReactNode;
  chitId: string;
}) => {
  const { chitDetails } = useFetchChitDetails(chitId);

  return (
    <ChitContext.Provider value={{ chitDetails }}>
      {children}
    </ChitContext.Provider>
  );
};
