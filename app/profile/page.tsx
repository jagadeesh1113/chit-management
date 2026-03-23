"use client";

import { useAuth } from "@/context/AuthContext";
import { Navigation } from "@/app/Navigation";
import { AuthProvider } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeftIcon, CheckIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";

function ProfileForm() {
  const { user } = useAuth();
  const router = useRouter();

  const [name, setName] = useState("");
  const [mobile, setMobile] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isDirty, setIsDirty] = useState(false);

  // Seed form with current user values
  useEffect(() => {
    if (user) {
      setName(user.user_metadata?.name ?? "");
      setMobile(user.user_metadata?.mobile ?? "");
    }
  }, [user]);

  // Track whether form has changed
  useEffect(() => {
    if (!user) return;
    const originalName = user.user_metadata?.name ?? "";
    const originalMobile = user.user_metadata?.mobile ?? "";
    setIsDirty(name !== originalName || mobile !== originalMobile);
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
        // Refresh local session so AuthContext picks up updated metadata
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

  const initials = name
    ? name
        .split(" ")
        .map((w) => w[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : (user?.email?.[0]?.toUpperCase() ?? "?");

  return (
    <div className="mx-auto max-w-lg px-4 py-6 sm:px-6 sm:py-10">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <Button
          variant="ghost"
          size="icon"
          className="size-8 shrink-0"
          onClick={() => router.back()}
        >
          <ArrowLeftIcon className="size-4" />
        </Button>
        <div>
          <h1 className="text-base font-semibold sm:text-lg">Profile</h1>
          <p className="text-xs text-muted-foreground">
            Manage your account details
          </p>
        </div>
      </div>

      {/* Avatar */}
      <div className="flex flex-col items-center gap-3 mb-8">
        <div className="flex size-20 items-center justify-center rounded-full bg-primary text-primary-foreground text-2xl font-bold select-none">
          {initials}
        </div>
        <div className="text-center">
          <p className="font-medium text-sm">{name || "—"}</p>
          <p className="text-xs text-muted-foreground">{user?.email}</p>
        </div>
      </div>

      {/* Form card */}
      <div className="rounded-xl border border-border bg-card p-5 space-y-5">
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name */}
          <div className="space-y-1.5">
            <Label
              htmlFor="name"
              className="text-xs font-medium text-muted-foreground uppercase tracking-wide"
            >
              Full name
            </Label>
            <Input
              id="name"
              type="text"
              placeholder="Enter your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              autoComplete="name"
            />
          </div>

          {/* Mobile */}
          <div className="space-y-1.5">
            <Label
              htmlFor="mobile"
              className="text-xs font-medium text-muted-foreground uppercase tracking-wide"
            >
              Mobile number
            </Label>
            <Input
              id="mobile"
              type="tel"
              placeholder="Enter your mobile number"
              value={mobile}
              onChange={(e) => setMobile(e.target.value)}
              autoComplete="tel"
              inputMode="numeric"
              maxLength={15}
            />
          </div>

          {/* Email — read only */}
          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Email
            </Label>
            <Input
              value={user?.email ?? ""}
              disabled
              readOnly
              className="text-muted-foreground"
            />
            <p className="text-xs text-muted-foreground pl-0.5">
              Email cannot be changed here
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

      {/* Account info */}
      <div className="mt-4 rounded-xl border border-border bg-card p-5 space-y-3">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
          Account
        </p>
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">User ID</span>
          <span className="font-mono text-xs truncate max-w-[180px]">
            {user?.id}
          </span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Joined</span>
          <span className="text-xs">
            {user?.created_at
              ? new Date(user.created_at).toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })
              : "—"}
          </span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Provider</span>
          <span className="text-xs capitalize">
            {user?.app_metadata?.provider ?? "email"}
          </span>
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
