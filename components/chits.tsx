"use client";

import { useFetchChits } from "@/hooks/use-fetch-chits";
import { AddChit } from "./add-chit";
import { ChitTable } from "./ChitTable";

export const Chits = () => {
  const { loading, values, refetch } = useFetchChits();

  return (
    <div>
      <div className="flex justify-end">
        <AddChit refetch={refetch} />
      </div>
      <ChitTable loading={loading} values={values} />
    </div>
  );
};
