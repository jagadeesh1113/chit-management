import { LogoutButton } from "./logout-button";
import { ThemeSwitcher } from "./theme-switcher";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";

export function AuthButton() {
  const { user } = useAuth();

  if (!user) return null;

  const name: string = user?.user_metadata?.name ?? user.email ?? "";
  const initials = name
    ? name
        .split(" ")
        .map((w: string) => w[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "?";

  return (
    <div className="flex items-center gap-1">
      <ThemeSwitcher />
      <Link
        href="/profile"
        title={name}
        className="flex size-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-semibold hover:opacity-80 transition-opacity select-none"
      >
        {initials}
      </Link>
      <LogoutButton />
    </div>
  );
}
