import Link from "next/link";
import { Button } from "./ui/button";
import { LogoutButton } from "./logout-button";
import { ThemeSwitcher } from "./theme-switcher";
import { useAuth } from "@/context/AuthContext";

export function AuthButton() {
  const { user } = useAuth();

  return user ? (
    <div className="flex items-center gap-4">
      Hey, {user?.user_metadata?.name ?? user.email}!
      <ThemeSwitcher />
      <LogoutButton />
    </div>
  ) : (
    <div className="flex gap-2">
      <Button asChild size="sm" variant={"outline"}>
        <Link href="/auth/login">Sign in</Link>
      </Button>
      <Button asChild size="sm" variant={"default"}>
        <Link href="/auth/sign-up">Sign up</Link>
      </Button>
    </div>
  );
}
