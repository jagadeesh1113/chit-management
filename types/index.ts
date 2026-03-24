// ── Member ────────────────────────────────────────────────────────────────────
export interface Member {
  id: string;
  name: string;
  mobile: string;
  owner: boolean;
  chit_id: string;
  created_by: string;
  payments_count?: number;
}

// ── Chit ──────────────────────────────────────────────────────────────────────
export interface Chit {
  id: string;
  name: string;
  amount: number;
  members: number;
  months: number;
  charges: number;
  start_date: string;
  user_id: string;
  deleted: boolean;
}

// ── Month / Auction ───────────────────────────────────────────────────────────
export interface ChitMonth {
  id: string;
  name: string;
  auction_date: string;
  auction_amount: number;
  auction_user: string | null;
  chit_id: string;
  created_by: string;
  payments_count: number;
  is_owner_auction?: boolean;
}

// ── Payment ───────────────────────────────────────────────────────────────────
export type PaymentType = "cash" | "cheque" | "bank_transfer";

export interface Payment {
  member_id: string;
  name: string;
  mobile: string;
  owner?: boolean;
  payments: PaymentEntry[];
}

export interface PaymentEntry {
  amount: number;
  payment_date: string | null;
  payment_type: PaymentType | null;
  month_id: string;
  payment_id: string;
}

// ── Context shapes ────────────────────────────────────────────────────────────
export interface MemberContextValue {
  values: Member[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export interface ChitContextValue {
  chitDetails: Chit | null;
}
