import { Chits } from "@/components/chits";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col">
      <div className="flex-1 w-full flex flex-col gap-5">
        <div className="p-8">
          <Chits />
        </div>
      </div>
    </main>
  );
}
