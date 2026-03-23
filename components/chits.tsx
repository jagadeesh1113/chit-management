/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useFetchChits } from "@/hooks/use-fetch-chits";
import { AddOrUpdateChit } from "./chit-dialog";
import { ChitTable } from "./ChitTable";
import { useState } from "react";

export const Chits = () => {
  const { loading, values, refetch } = useFetchChits();
  const [selectedChitObj, setSelectedChitObj] = useState<any>();

  const handleSelectChit = (chitObj: any) => {
    setSelectedChitObj(chitObj);
  };

  const handleResetSelectedChit = () => {
    setSelectedChitObj(null);
  };

  return (
    <div>
      <div className="flex justify-end">
        <AddOrUpdateChit
          refetch={refetch}
          selectedChitObj={selectedChitObj}
          editMode={!!selectedChitObj?.id}
          onReset={handleResetSelectedChit}
        />
      </div>
      <ChitTable
        loading={loading}
        values={values}
        onSelectChit={handleSelectChit}
        refetch={refetch}
      />
    </div>
  );
};
