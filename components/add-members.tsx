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
import {
  BookUserIcon,
  PlusIcon,
  UserIcon,
  XIcon,
  PhoneIcon,
  CheckIcon,
} from "lucide-react";

// ── Contact Picker API types ─────────────────────────────────────────────────
interface DeviceContact {
  name?: string[];
  tel?: string[];
}

interface MemberRow {
  id: number;
  name: string;
  mobile: string;
}

let _rowId = 0;
const newRow = (name = "", mobile = ""): MemberRow => ({
  id: ++_rowId,
  name,
  mobile,
});

const isContactsSupported =
  typeof window !== "undefined" &&
  "contacts" in navigator &&
  "ContactsManager" in window;

// ── Component ────────────────────────────────────────────────────────────────
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
  const [pickingContacts, setPickingContacts] = React.useState(false);

  // Single source of truth — always a list of rows (starts with one empty row)
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

  // ── Row helpers ──────────────────────────────────────────────────────────
  const addEmptyRow = () => setRows((prev) => [...prev, newRow()]);

  const removeRow = (id: number) =>
    setRows((prev) => {
      const next = prev.filter((r) => r.id !== id);
      return next.length ? next : [newRow()];
    });

  const updateRow = (
    id: number,
    field: keyof Omit<MemberRow, "id">,
    value: string,
  ) =>
    setRows((prev) =>
      prev.map((r) => (r.id === id ? { ...r, [field]: value } : r)),
    );

  // ── Contact Picker API ───────────────────────────────────────────────────
  const handlePickContacts = async () => {
    if (!isContactsSupported) return;
    setPickingContacts(true);
    try {
      const contacts: DeviceContact[] = await (
        navigator as any
      ).contacts.select(["name", "tel"], { multiple: true });
      if (!contacts || contacts.length === 0) return;

      const mapped: MemberRow[] = contacts
        .map((c) =>
          newRow(
            c.name?.[0]?.trim() ?? "",
            c.tel?.[0]?.replace(/\s+/g, "").trim() ?? "",
          ),
        )
        .filter((r) => r.name || r.mobile);

      setRows((prev) => {
        // Remove trailing empty rows before merging
        const cleaned = prev.filter((r) => r.name.trim() || r.mobile.trim());
        // Deduplicate by mobile
        const existingMobiles = new Set(cleaned.map((r) => r.mobile));
        const fresh = mapped.filter((r) => !existingMobiles.has(r.mobile));
        const merged = [...cleaned, ...fresh];
        return merged.length ? merged : [newRow()];
      });
    } catch (err: any) {
      if (err?.name !== "AbortError") {
        toast.error("Could not access contacts", { position: "top-right" });
      }
    } finally {
      setPickingContacts(false);
    }
  };

  // ── Submit ───────────────────────────────────────────────────────────────
  const addMembers = async (members: { name: string; mobile: string }[]) => {
    const res = await fetch("/api/members", {
      method: "POST",
      body: JSON.stringify({
        members: members,
        chit_id: chitId,
      }),
    });
    return res.json();
  };

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
      const data = await addMembers(valid);
      if (data.success) {
        toast.success(
          valid.length === 1
            ? "Member added successfully"
            : `${valid.length} members added`,
          { position: "top-right" },
        );
        setIsDialogOpen(false);
        refetch();
      } else {
        setError(data.error);
      }
    } catch (err: any) {
      setError(err?.message ?? "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  // ── Render ───────────────────────────────────────────────────────────────
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
            {/* Contact Picker button */}
            {isContactsSupported && (
              <button
                type="button"
                onClick={handlePickContacts}
                disabled={pickingContacts}
                className="w-full flex items-center gap-3 rounded-xl border border-dashed border-border bg-muted/40 px-4 py-3 text-left hover:bg-muted/70 transition-colors disabled:opacity-50"
              >
                <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/10">
                  <BookUserIcon className="size-4 text-primary" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium leading-tight">
                    {pickingContacts
                      ? "Opening contacts…"
                      : "Pick from contacts"}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Select one or multiple contacts at once
                  </p>
                </div>
              </button>
            )}

            {/* Divider */}
            {isContactsSupported && (
              <div className="flex items-center gap-3">
                <div className="flex-1 border-t border-border" />
                <span className="text-xs text-muted-foreground">
                  or enter manually
                </span>
                <div className="flex-1 border-t border-border" />
              </div>
            )}

            {/* Member rows */}
            <div className="space-y-2">
              {rows.map((row, idx) => (
                <div
                  key={row.id}
                  className="rounded-xl border border-border bg-card p-3 space-y-2"
                >
                  {/* Row header */}
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

                  {/* Fields */}
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
