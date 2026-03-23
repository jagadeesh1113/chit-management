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
    <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 sm:py-8">
      <ChitProvider chitId={id}>
        <ChitDetails id={id} />
      </ChitProvider>
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
      <Suspense
        fallback={
          <div className="mx-auto max-w-5xl px-4 py-12 text-center text-sm text-muted-foreground">
            Loading chit details…
          </div>
        }
      >
        <ChitDetailsContainer params={params} />
      </Suspense>
    </AuthProvider>
  );
}
