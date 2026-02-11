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
  ) : null;
}
