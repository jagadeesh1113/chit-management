"use client";

import { useAuth } from "@/context/AuthContext";
import { Navigation } from "@/app/Navigation";
import { AuthProvider } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  ArrowLeftIcon,
  CheckIcon,
  Laptop,
  LogOutIcon,
  MailIcon,
  Moon,
  PhoneIcon,
  Sun,
  UserIcon,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { useTheme } from "next-themes";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// ── Theme picker row ──────────────────────────────────────────────────────────
function ThemeRow() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  const icon =
    theme === "light" ? (
      <Sun className="size-4" />
    ) : theme === "dark" ? (
      <Moon className="size-4" />
    ) : (
      <Laptop className="size-4" />
    );

  const label =
    theme === "light" ? "Light" : theme === "dark" ? "Dark" : "System";

  return (
    <div className="flex items-center justify-between py-3 border-t border-border">
      <div className="flex items-center gap-3 text-sm">
        <span className="flex size-8 items-center justify-center rounded-lg bg-muted text-muted-foreground">
          {icon}
        </span>
        <span className="font-medium">Theme</span>
      </div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="h-8 gap-1.5 text-xs">
            {icon}
            {label}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuRadioGroup value={theme} onValueChange={setTheme}>
            <DropdownMenuRadioItem value="light" className="flex gap-2">
              <Sun className="size-4 text-muted-foreground" /> Light
            </DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="dark" className="flex gap-2">
              <Moon className="size-4 text-muted-foreground" /> Dark
            </DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="system" className="flex gap-2">
              <Laptop className="size-4 text-muted-foreground" /> System
            </DropdownMenuRadioItem>
          </DropdownMenuRadioGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

// ── Main form ─────────────────────────────────────────────────────────────────
function ProfileForm() {
  const { user } = useAuth();
  const router = useRouter();

  const [name, setName] = useState("");
  const [mobile, setMobile] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isDirty, setIsDirty] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.user_metadata?.name ?? "");
      setMobile(user.user_metadata?.mobile ?? "");
    }
  }, [user]);

  useEffect(() => {
    if (!user) return;
    setIsDirty(
      name !== (user.user_metadata?.name ?? "") ||
        mobile !== (user.user_metadata?.mobile ?? ""),
    );
  }, [name, mobile, user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isDirty) return;
    setIsLoading(true);
    try {
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), mobile: mobile.trim() }),
      });
      const data = await res.json();
      if (data.success) {
        const supabase = createClient();
        await supabase.auth.refreshSession();
        toast.success("Profile updated", { position: "top-right" });
        setIsDirty(false);
      } else {
        toast.error(data.error ?? "Failed to update profile", {
          position: "top-right",
        });
      }
    } catch {
      toast.error("Something went wrong", { position: "top-right" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/auth/login");
  };

  const initials = name
    ? name
        .split(" ")
        .map((w) => w[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : (user?.email?.[0]?.toUpperCase() ?? "?");

  const joinedDate = user?.created_at
    ? new Date(user.created_at).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : null;

  return (
    <div className="mx-auto max-w-md px-4 py-6 sm:py-10 space-y-4">
      {/* Back */}
      <Button
        variant="ghost"
        size="sm"
        className="gap-1.5 -ml-2 text-muted-foreground"
        onClick={() => router.back()}
      >
        <ArrowLeftIcon className="size-4" />
        Back
      </Button>

      {/* Avatar hero card */}
      <div className="rounded-2xl border border-border bg-card overflow-hidden">
        {/* Gradient band */}
        <div className="h-20 bg-gradient-to-br from-primary/20 via-primary/10 to-transparent" />

        {/* Avatar + info */}
        <div className="px-5 pb-5 -mt-10">
          <div className="flex items-end justify-between gap-3">
            <div className="flex size-20 items-center justify-center rounded-2xl bg-primary text-primary-foreground text-2xl font-bold select-none ring-4 ring-card shadow-md">
              {initials}
            </div>
            {joinedDate && (
              <p className="text-xs text-muted-foreground mb-1">
                Member since {joinedDate}
              </p>
            )}
          </div>

          <div className="mt-3 space-y-0.5">
            <p className="font-semibold text-base leading-tight">
              {name || "—"}
            </p>
            <p className="text-sm text-muted-foreground">{user?.email}</p>
          </div>

          {/* Quick-read info chips */}
          <div className="mt-3 flex flex-wrap gap-2">
            {mobile && (
              <span className="inline-flex items-center gap-1 text-xs bg-muted rounded-full px-2.5 py-1 text-muted-foreground">
                <PhoneIcon className="size-3" />
                {mobile}
              </span>
            )}
            <span className="inline-flex items-center gap-1 text-xs bg-muted rounded-full px-2.5 py-1 text-muted-foreground">
              <MailIcon className="size-3" />
              {user?.email}
            </span>
          </div>
        </div>
      </div>

      {/* Edit form */}
      <div className="rounded-2xl border border-border bg-card p-5">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-4">
          Edit profile
        </p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label
              htmlFor="name"
              className="text-xs font-medium text-muted-foreground uppercase tracking-wide"
            >
              Full name
            </Label>
            <div className="relative">
              <UserIcon className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground pointer-events-none" />
              <Input
                id="name"
                type="text"
                placeholder="Enter your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                autoComplete="name"
                className="pl-8"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label
              htmlFor="mobile"
              className="text-xs font-medium text-muted-foreground uppercase tracking-wide"
            >
              Mobile number
            </Label>
            <div className="relative">
              <PhoneIcon className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground pointer-events-none" />
              <Input
                id="mobile"
                type="tel"
                placeholder="Enter your mobile number"
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
                autoComplete="tel"
                inputMode="numeric"
                maxLength={15}
                className="pl-8"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Email
            </Label>
            <div className="relative">
              <MailIcon className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground pointer-events-none" />
              <Input
                value={user?.email ?? ""}
                disabled
                readOnly
                className="pl-8 text-muted-foreground"
              />
            </div>
            <p className="text-xs text-muted-foreground pl-0.5">
              Email cannot be changed
            </p>
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={isLoading || !isDirty}
          >
            {isLoading ? (
              "Saving…"
            ) : (
              <span className="flex items-center gap-1.5">
                <CheckIcon className="size-4" />
                Save changes
              </span>
            )}
          </Button>
        </form>
      </div>

      {/* Preferences + logout */}
      <div className="rounded-2xl border border-border bg-card px-5">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide pt-4 pb-1">
          Preferences
        </p>
        <ThemeRow />
        <div className="flex items-center justify-between py-3 border-t border-border">
          <div className="flex items-center gap-3 text-sm">
            <span className="flex size-8 items-center justify-center rounded-lg bg-red-50 dark:bg-red-950 text-red-600 dark:text-red-400">
              <LogOutIcon className="size-4" />
            </span>
            <span className="font-medium">Sign out</span>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="h-8 text-xs text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700 dark:border-red-900 dark:hover:bg-red-950 dark:text-red-400"
            onClick={handleLogout}
          >
            Sign out
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function ProfilePage() {
  return (
    <AuthProvider>
      <Navigation />
      <ProfileForm />
    </AuthProvider>
  );
}
