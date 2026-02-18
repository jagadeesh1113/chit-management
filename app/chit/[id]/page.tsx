import { Navigation } from "@/app/Navigation";
import { ChitDetails } from "@/components/ChitDetails";
import { AuthProvider } from "@/context/AuthContext";
import { ChitProvider } from "@/context/ChitContext";
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
        <ChitProvider chitId={id}>
          <ChitDetails id={id} />
        </ChitProvider>
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
    <AuthProvider>
      <Navigation />
      <Suspense fallback="loading chit details...">
        <ChitDetailsContainer params={params} />
      </Suspense>
    </AuthProvider>
  );
}
