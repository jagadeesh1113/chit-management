"use client";

import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MailIcon, ArrowRightIcon, ArrowLeftIcon, CheckCircle2Icon } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

const ChitIcon = () => (
  <svg width="36" height="36" viewBox="0 0 160 160" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="80" cy="80" r="72" stroke="#1D9E75" strokeWidth="5" strokeDasharray="390 60" strokeLinecap="round" strokeDashoffset="-15" />
    <path d="M136 34 L144 26 L148 38" stroke="#1D9E75" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    <circle cx="46" cy="58" r="15" fill="#E1F5EE" stroke="#1D9E75" strokeWidth="3" />
    <circle cx="46" cy="53" r="5" fill="#0F6E56" />
    <path d="M34 72 Q46 67 58 72" stroke="#0F6E56" strokeWidth="2.5" strokeLinecap="round" fill="none" />
    <circle cx="80" cy="50" r="18" fill="#E1F5EE" stroke="#1D9E75" strokeWidth="3.5" />
    <circle cx="80" cy="44" r="6" fill="#0F6E56" />
    <path d="M66 65 Q80 59 94 65" stroke="#0F6E56" strokeWidth="3" strokeLinecap="round" fill="none" />
    <circle cx="114" cy="58" r="15" fill="#E1F5EE" stroke="#1D9E75" strokeWidth="3" />
    <circle cx="114" cy="53" r="5" fill="#0F6E56" />
    <path d="M102 72 Q114 67 126 72" stroke="#0F6E56" strokeWidth="2.5" strokeLinecap="round" fill="none" />
    <rect x="34" y="75" width="92" height="5" rx="2.5" fill="#9FE1CB" />
    <circle cx="80" cy="112" r="26" fill="#E1F5EE" stroke="#1D9E75" strokeWidth="3.5" />
    <circle cx="80" cy="112" r="20" fill="none" stroke="#9FE1CB" strokeWidth="1.5" />
    <text x="80" y="121" textAnchor="middle" fontFamily="system-ui, -apple-system, sans-serif" fontSize="24" fontWeight="700" fill="#085041">₹</text>
  </svg>
);

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      const { error } = await createClient().auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/update-password`,
      });
      if (error) throw error;
      setSuccess(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="flex flex-col gap-7">
        <div className="flex flex-col items-center gap-3 text-center">
          <ChitIcon />
        </div>
        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm text-center space-y-4">
          <div className="flex justify-center">
            <div className="flex size-14 items-center justify-center rounded-full bg-green-50 dark:bg-green-950">
              <CheckCircle2Icon className="size-7 text-green-600 dark:text-green-400" />
            </div>
          </div>
          <div>
            <h2 className="text-base font-semibold">Check your email</h2>
            <p className="text-sm text-muted-foreground mt-1">
              We sent a password reset link to{" "}
              <span className="font-medium text-foreground">{email}</span>
            </p>
          </div>
          <p className="text-xs text-muted-foreground">
            Didn&apos;t receive it? Check your spam folder or try again.
          </p>
        </div>
        <p className="text-center text-sm text-muted-foreground">
          <Link href="/auth/login" className="font-medium text-foreground hover:underline underline-offset-4 inline-flex items-center gap-1">
            <ArrowLeftIcon className="size-3.5" /> Back to sign in
          </Link>
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-7">
      {/* Logo + heading */}
      <div className="flex flex-col items-center gap-3 text-center">
        <ChitIcon />
        <div>
          <h1 className="text-xl font-bold tracking-tight">Forgot password?</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Enter your email and we&apos;ll send a reset link
          </p>
        </div>
      </div>

      {/* Card */}
      <div className="rounded-2xl border border-border bg-card p-6 shadow-sm space-y-5">
        <form onSubmit={handleForgotPassword} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="email" className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Email
            </Label>
            <div className="relative">
              <MailIcon className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground pointer-events-none" />
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-8"
              />
            </div>
          </div>

          {error && (
            <p className="text-xs text-red-500 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          <Button type="submit" className="w-full gap-1.5" disabled={isLoading}>
            {isLoading ? "Sending…" : (
              <>Send reset link <ArrowRightIcon className="size-3.5" /></>
            )}
          </Button>
        </form>
      </div>

      {/* Footer link */}
      <p className="text-center text-sm text-muted-foreground">
        <Link href="/auth/login" className="font-medium text-foreground hover:underline underline-offset-4 inline-flex items-center gap-1">
          <ArrowLeftIcon className="size-3.5" /> Back to sign in
        </Link>
      </p>
    </div>
  );
}
