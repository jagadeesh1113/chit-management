import Link from "next/link";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckIcon } from "./CheckIcon";

export default function Page() {
  return (
    <div className="flex min-h-svh w-full items-center justify-center bg-muted/30 p-6 md:p-10">
      <div className="w-full max-w-sm">
        <div className="flex flex-col gap-6">
          <div className="flex justify-center">
            <CheckIcon />
          </div>

          <Card>
            <CardHeader className="text-center pb-2">
              <CardTitle className="text-2xl">Account created!</CardTitle>
              <CardDescription>
                Welcome to ManageChit. You&apos;re all set.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild className="w-full">
                <Link href="/">Go to Home</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
