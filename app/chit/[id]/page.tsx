import { ChitDetails } from "@/components/ChitDetails";
import { Suspense } from "react";

const ChitDetailsContainer = async ({
  params,
}: {
  params: Promise<{ id: string }>;
}) => {
  const { id } = await params;

  return (
    <div className="flex min-h-svh w-full p-6 md:p-10">
      <div className="w-full">
        <ChitDetails id={id} />
      </div>
    </div>
  );
};

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return (
    <Suspense fallback="loading chit details...">
      <ChitDetailsContainer params={params} />
    </Suspense>
  );
}
