"use client";

import { ChitTable } from "./ChitTable";
import { Button } from "./ui/button";
import { useRouter } from "next/navigation";

export const Chits = () => {
  const router = useRouter();

  const handleAddNewChit = () => {
    router.push("/add-chit");
  };

  return (
    <div>
      <div className="flex justify-end">
        <Button onClick={handleAddNewChit}>Add new</Button>
      </div>
      <ChitTable />
    </div>
  );
};
