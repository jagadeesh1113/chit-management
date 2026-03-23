/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useFetchChits } from "@/hooks/use-fetch-chits";
import { AddOrUpdateChit } from "./chit-dialog";
import { ChitTable } from "./ChitTable";
import { useState } from "react";
import { DeleteChitDialog } from "./delete-chit-dialog";

export const Chits = () => {
  const { loading, values, refetch } = useFetchChits();
  const [selectedChitObj, setSelectedChitObj] = useState<{
    mode: "EDIT" | "DELETE";
    details: any;
  } | null>();

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
          selectedChitObj={selectedChitObj?.details}
          editMode={selectedChitObj?.mode === "EDIT"}
          onReset={handleResetSelectedChit}
        />
      </div>
      <ChitTable
        loading={loading}
        values={values}
        onSelectChit={handleSelectChit}
      />
      <DeleteChitDialog
        selectedChitDetails={selectedChitObj?.details}
        deleted={selectedChitObj?.mode === "DELETE"}
        onReset={handleResetSelectedChit}
        refetch={refetch}
      />
    </div>
  );
};
