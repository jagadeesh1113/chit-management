import { Chits } from "@/components/chits";
import { Navigation } from "./Navigation";
import { AuthProvider } from "@/context/AuthContext";

export default function Home() {
  return (
    <div className="min-h-screen">
      <AuthProvider>
        <Navigation />
        <main className="min-h-screen flex flex-col">
          <div className="flex-1 w-full flex flex-col gap-5">
            <div className="p-8">
              <Chits />
            </div>
          </div>
        </main>
      </AuthProvider>
    </div>
  );
}
