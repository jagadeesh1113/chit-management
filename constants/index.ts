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
