/* eslint-disable @typescript-eslint/no-explicit-any */
import { useFetchMembers } from "@/hooks/use-fetch-members";
import React from "react";

export const MemberContext = React.createContext({
  values: [],
  loading: false,
  error: null,
  refetch: () => {},
});

export const MemberProvider = ({
  children,
  chitId,
}: {
  children: any;
  chitId: string;
}) => {
  const { error, values, loading, refetch } = useFetchMembers(chitId);

  return (
    <MemberContext.Provider
      value={{
        error,
        values,
        loading,
        refetch,
      }}
    >
      {children}
    </MemberContext.Provider>
  );
};
