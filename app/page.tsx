import { Chits } from "@/components/chits";
import { Navigation } from "./Navigation";
import { AuthProvider } from "@/context/AuthContext";

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <AuthProvider>
        <Navigation />
        <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8">
          <Chits />
        </main>
      </AuthProvider>
    </div>
  );
}
