"use client";

import React from "react";
import type { MonthContextValue } from "@/types";
import { useFetchChitMonths } from "@/hooks/use-fetch-chit-months";

const defaultValue: MonthContextValue = {
  values: [],
  loading: false,
  error: null,
  refetch: () => {},
};

export const ChitMonthContext =
  React.createContext<MonthContextValue>(defaultValue);

export const ChitMonthProvider = ({
  children,
  chitId,
}: {
  children: React.ReactNode;
  chitId: string;
}) => {
  const { error, values, loading, refetch } = useFetchChitMonths(chitId);

  return (
    <ChitMonthContext.Provider value={{ error, values, loading, refetch }}>
      {children}
    </ChitMonthContext.Provider>
  );
};
