import { PaymentType } from "@/types";

// ── Payment type options ──────────────────────────────────────────────────────
export const PAYMENT_TYPES: {
  value: PaymentType;
  label: string;
  icon: string;
}[] = [
  { value: "cash", label: "Cash", icon: "💵" },
  { value: "cheque", label: "Cheque", icon: "📝" },
  { value: "bank_transfer", label: "Bank Transfer", icon: "🏦" },
];

export const PAYMENT_TYPE_LABELS: Record<string, string> = {
  cash: "💵 Cash",
  cheque: "📝 Cheque",
  bank_transfer: "🏦 Bank Transfer",
};
