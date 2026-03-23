"use client";

import { useFetchMembers } from "@/hooks/use-fetch-members";
import React from "react";
import type { MemberContextValue } from "@/types";

const defaultValue: MemberContextValue = {
  values: [],
  loading: false,
  error: null,
  refetch: () => {},
};

export const MemberContext =
  React.createContext<MemberContextValue>(defaultValue);

export const MemberProvider = ({
  children,
  chitId,
}: {
  children: React.ReactNode;
  chitId: string;
}) => {
  const { error, values, loading, refetch } = useFetchMembers(chitId);

  return (
    <MemberContext.Provider value={{ error, values, loading, refetch }}>
      {children}
    </MemberContext.Provider>
  );
};
