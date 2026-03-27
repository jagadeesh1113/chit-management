/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { Button } from "./ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { Input } from "./ui/input";
import React from "react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  BookUserIcon,
  PlusIcon,
  UserIcon,
  XIcon,
  PhoneIcon,
  CheckIcon,
} from "lucide-react";

// ── Types ─────────────────────────────────────────────────────────────────────
interface DeviceContact {
  name?: string[];
  tel?: string[];
}

interface MemberRow {
  id: string;
  name: string;
  mobile: string;
}

const newRow = (name = "", mobile = ""): MemberRow => ({
  id: crypto.randomUUID(),
  name,
  mobile,
});

// ── Contact Picker button ─────────────────────────────────────────────────────
// iOS Safari PWA requires navigator.contacts.select() to be called DIRECTLY
// inside a native DOM event handler — no React synthetic events, no async gaps,
// no Portal boundaries in between. We attach a native "click" listener via
// useEffect so the call path is: native tap → addEventListener callback → .select()
// with zero React batching or Portal indirection.
function ContactPickerButton({
  onPicked,
  disabled,
}: {
  onPicked: (contacts: DeviceContact[]) => void;
  disabled?: boolean;
}) {
  const btnRef = React.useRef<HTMLButtonElement>(null);
  const [supported, setSupported] = React.useState(false);
  const [picking, setPicking] = React.useState(false);

  // Detect support after mount (SSR-safe).
  // IMPORTANT: Do NOT conditionally return null based on this —
  // that causes a hydration mismatch because the server always
  // renders nothing while the client may render the button.
  // Instead we render a hidden element on the server and reveal
  // it client-side once we've confirmed support.
  React.useEffect(() => {
    const ok =
      typeof navigator !== "undefined" &&
      "contacts" in navigator &&
      typeof (navigator as any).contacts?.select === "function";
    setSupported(ok);
  }, []);

  // Attach a NATIVE event listener — bypasses React's synthetic event system
  // and Radix Portal boundary. This is the only reliable way on iOS Safari PWA.
  React.useEffect(() => {
    const btn = btnRef.current;
    if (!btn || !supported) return;

    const handleNativeClick = async () => {
      if (picking) return;
      setPicking(true);
      try {
        const contacts: DeviceContact[] = await (
          navigator as any
        ).contacts.select(["name", "tel"], { multiple: true });
        if (contacts && contacts.length > 0) {
          onPicked(contacts);
        }
      } catch (err: any) {
        if (err?.name !== "AbortError") {
          toast.error("Could not access contacts", { position: "top-right" });
        }
      } finally {
        setPicking(false);
      }
    };

    // Use { capture: true } to intercept before any React handler
    btn.addEventListener("click", handleNativeClick, { capture: true });
    return () =>
      btn.removeEventListener("click", handleNativeClick, { capture: true });
  }, [supported, picking, onPicked]);

  return (
    <button
      ref={btnRef}
      type="button"
      disabled={disabled || picking}
      className={cn(
        "w-full flex items-center gap-3 rounded-xl border border-dashed border-border bg-muted/40 px-4 py-3 text-left hover:bg-muted/70 transition-colors disabled:opacity-50",
        !supported && "hidden",
      )}
    >
      <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/10">
        <BookUserIcon className="size-4 text-primary" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium leading-tight">
          {picking ? "Opening contacts…" : "Pick from contacts"}
        </p>
        <p className="text-xs text-muted-foreground mt-0.5">
          Select one or multiple contacts at once
        </p>
      </div>
    </button>
  );
}

// ── Component ─────────────────────────────────────────────────────────────────
export const AddMembers = ({
  chitId,
  refetch,
}: {
  chitId: string;
  refetch: () => void;
}) => {
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [rows, setRows] = React.useState<MemberRow[]>([newRow()]);

  const isMulti = rows.length > 1;

  const resetForm = () => {
    setRows([newRow()]);
    setError(null);
  };

  const handleOpenChange = (open: boolean) => {
    setIsDialogOpen(open);
    if (!open) resetForm();
  };

  // ── Row helpers ───────────────────────────────────────────────────────────
  const addEmptyRow = () => setRows((prev) => [...prev, newRow()]);

  const removeRow = (id: string) =>
    setRows((prev) => {
      const next = prev.filter((r) => r.id !== id);
      return next.length ? next : [newRow()];
    });

  const updateRow = (
    id: string,
    field: keyof Omit<MemberRow, "id">,
    value: string,
  ) =>
    setRows((prev) =>
      prev.map((r) => (r.id === id ? { ...r, [field]: value } : r)),
    );

  // ── Handle contacts picked from device ────────────────────────────────────
  const handlePicked = React.useCallback((contacts: DeviceContact[]) => {
    const mapped: MemberRow[] = contacts
      .map((c) =>
        newRow(
          c.name?.[0]?.trim() ?? "",
          c.tel?.[0]
            ?.replace(/^(\+91|0)/, "")
            ?.replace(/\s+/g, "")
            .trim() ?? "",
        ),
      )
      .filter((r) => r.name || r.mobile);

    setRows((prev) => {
      const cleaned = prev.filter((r) => r.name.trim() || r.mobile.trim());
      const existingMobiles = new Set(cleaned.map((r) => r.mobile));
      const fresh = mapped.filter((r) => !existingMobiles.has(r.mobile));
      const merged = [...cleaned, ...fresh];
      return merged.length ? merged : [newRow()];
    });
  }, []);

  // ── Submit ────────────────────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    const valid = rows.filter((r) => r.name.trim());
    if (!valid.length) {
      setError("At least one member with a name is required.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/members", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          members: valid.map((r) => ({
            name: r.name.trim(),
            mobile: r.mobile.trim(),
          })),
          chit_id: chitId,
        }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(
          valid.length === 1
            ? "Member added successfully"
            : `${valid.length} members added`,
          { position: "top-right" },
        );
        setIsDialogOpen(false);
        refetch();
        resetForm();
      } else {
        setError(data.error);
      }
    } catch (err: any) {
      setError(err?.message ?? "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <Dialog open={isDialogOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button size="sm">
          <PlusIcon className="size-3.5" />
          Add Member
        </Button>
      </DialogTrigger>

      <DialogContent className="w-[calc(100vw-2rem)] max-w-md rounded-xl p-0 gap-0">
        <form onSubmit={handleSubmit} className="flex flex-col max-h-[90dvh]">
          {/* Fixed header */}
          <DialogHeader className="px-5 pt-5 pb-4 border-b border-border shrink-0">
            <DialogTitle className="text-base">Add Members</DialogTitle>
            <DialogDescription className="text-xs">
              {isMulti
                ? `${rows.length} member${rows.length > 1 ? "s" : ""} ready to add`
                : "Enter details or pick from your contacts"}
            </DialogDescription>
          </DialogHeader>

          {/* Scrollable body */}
          <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
            {/* Contact Picker — native event listener, safe inside Portal */}
            <ContactPickerButton onPicked={handlePicked} disabled={loading} />

            {/* Divider — shown when ContactPickerButton renders (it returns null if unsupported) */}
            <ContactPickerDivider />

            {/* Member rows */}
            <div className="space-y-2">
              {rows.map((row, idx) => (
                <div
                  key={row.id}
                  className="rounded-xl border border-border bg-card p-3 space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <div className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary/10">
                        <UserIcon className="size-3 text-primary" />
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {isMulti ? `Member ${idx + 1}` : "Member"}
                      </span>
                    </div>
                    {rows.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeRow(row.id)}
                        className="flex size-6 items-center justify-center rounded-full text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
                      >
                        <XIcon className="size-3.5" />
                      </button>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <div className="relative">
                      <UserIcon className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground pointer-events-none" />
                      <Input
                        value={row.name}
                        onChange={(e) =>
                          updateRow(row.id, "name", e.target.value)
                        }
                        placeholder="Full name"
                        required
                        className="pl-8 h-9 text-sm"
                      />
                    </div>
                    <div className="relative">
                      <PhoneIcon className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground pointer-events-none" />
                      <Input
                        value={row.mobile}
                        onChange={(e) =>
                          updateRow(row.id, "mobile", e.target.value)
                        }
                        placeholder="Mobile number"
                        inputMode="numeric"
                        className="pl-8 h-9 text-sm"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Add another row */}
            <button
              type="button"
              onClick={addEmptyRow}
              className="w-full flex items-center justify-center gap-1.5 rounded-xl border border-dashed border-border py-2.5 text-xs text-muted-foreground hover:text-foreground hover:bg-muted/40 transition-colors"
            >
              <PlusIcon className="size-3.5" />
              Add another member
            </button>

            {error && <p className="text-sm text-red-500">{error}</p>}
          </div>

          {/* Fixed footer */}
          <DialogFooter className="px-5 py-4 border-t border-border shrink-0 flex-row gap-2">
            {isMulti ? (
              <>
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1 sm:flex-none"
                  onClick={resetForm}
                  disabled={loading}
                >
                  Clear all
                </Button>
                <Button
                  type="submit"
                  className="flex-1 sm:flex-none gap-1.5"
                  disabled={loading}
                >
                  <CheckIcon className="size-3.5" />
                  {loading ? "Adding…" : `Add ${rows.length} Members`}
                </Button>
              </>
            ) : (
              <>
                <DialogClose asChild>
                  <Button variant="outline" className="flex-1 sm:flex-none">
                    Cancel
                  </Button>
                </DialogClose>
                <Button
                  type="submit"
                  className="flex-1 sm:flex-none"
                  disabled={loading}
                >
                  {loading ? "Adding…" : "Add Member"}
                </Button>
              </>
            )}
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

// ── Divider — only shown when ContactPickerButton is supported ────────────────
function ContactPickerDivider() {
  const [supported, setSupported] = React.useState(false);

  React.useEffect(() => {
    const ok =
      typeof navigator !== "undefined" &&
      "contacts" in navigator &&
      typeof (navigator as any).contacts?.select === "function";
    setSupported(ok);
  }, []);

  // Render always so server/client HTML matches; hide via CSS until supported
  return (
    <div className={cn("flex items-center gap-3", !supported && "hidden")}>
      <div className="flex-1 border-t border-border" />
      <span className="text-xs text-muted-foreground">or enter manually</span>
      <div className="flex-1 border-t border-border" />
    </div>
  );
}
