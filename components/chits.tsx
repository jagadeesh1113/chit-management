/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useFetchChits } from "@/hooks/use-fetch-chits";
import { AddOrUpdateChit } from "./chit-dialog";
import { ChitTable } from "./ChitTable";
import { useState } from "react";
import { DeleteChitDialog } from "./delete-chit-dialog";
import { Button } from "./ui/button";
import { RefreshCcwIcon } from "lucide-react";

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
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold sm:text-xl">My Chits</h1>
          <p className="text-xs text-muted-foreground sm:text-sm">
            {loading ? "Loading..." : `${values?.length ?? 0} chit${values?.length !== 1 ? "s" : ""}`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={refetch}
            disabled={loading}
            className="h-8 px-2 sm:px-3"
          >
            <RefreshCcwIcon
              className={`size-3.5 ${loading ? "animate-spin" : ""}`}
            />
            <span className="hidden sm:inline">Refresh</span>
          </Button>
          <AddOrUpdateChit
            refetch={refetch}
            selectedChitObj={selectedChitObj?.details}
            editMode={selectedChitObj?.mode === "EDIT"}
            onReset={handleResetSelectedChit}
          />
        </div>
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
