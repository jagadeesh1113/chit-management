"use client";

import { ChitTable } from "./chit-table";
import { Button } from "./ui/button";
import { useRouter } from "next/navigation";

export const Chits = () => {
  const router = useRouter();

  const handleAddNewChit = () => {
    router.push("/add-chit");
  };

  return (
    <div className="px-5">
      <div className="flex justify-end">
        <Button onClick={handleAddNewChit}>Add new</Button>
      </div>
      <ChitTable />
    </div>
  );
};
