import { LogoutButton } from "./logout-button";
import { ThemeSwitcher } from "./theme-switcher";
import { useAuth } from "@/context/AuthContext";

export function AuthButton() {
  const { user } = useAuth();

  return user ? (
    <div className="flex items-center gap-1 sm:gap-3">
      <span className="hidden sm:block text-sm text-muted-foreground truncate max-w-[140px]">
        {user?.user_metadata?.name ?? user.email}
      </span>
      <ThemeSwitcher />
      <LogoutButton />
    </div>
  ) : null;
}
