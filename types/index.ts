// ── Member ────────────────────────────────────────────────────────────────────
export interface Member {
  id: string;
  name: string;
  mobile: string;
  owner: boolean;
  chit_id: string;
  created_by: string;
  payments_count?: number;
  payments_received?: number;
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
  month_count: number;
  member_count: number;
}

// ── Month / Auction ───────────────────────────────────────────────────────────
export interface ChitMonth {
  id: string;
  name: string;
  auction_date: string;
  auction_amount: number;
  auction_user: string;
  chit_id: string;
  created_by: string;
  payments_count: number;
  is_owner_auction?: boolean;
  payments_received: number;
  cash_received?: number;
  cheque_received?: number;
  bank_transfer_received?: number;
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

export interface MonthContextValue {
  values: ChitMonth[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export interface ChitContextValue {
  chitDetails: Chit | null;
}

export interface ChitPayment {
  id?: string;
  member_id?: string;
  amount?: number;
  payment_date?: string | null;
  payment_type?: PaymentType | null;
  payment_status?: boolean;
  is_payout?: boolean;
}
