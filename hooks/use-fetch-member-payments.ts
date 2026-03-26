"use client";

import React from "react";

export interface MemberMonthPayment {
  id: string;
  name: string;
  auction_date: string;
  auction_amount: number;
  auction_user: string;
  auction_user_name: string;
  is_owner_auction: boolean;
  payments: {
    payment_id: string;
    month_id: string;
    amount: number;
    payment_date: string | null;
    payment_type: "cash" | "cheque" | "bank_transfer" | null;
  }[];
}

interface State {
  values: MemberMonthPayment[];
  loading: boolean;
  error: string | null;
}

type Action =
  | { type: "SET_LOADING"; data: boolean }
  | { type: "SET_VALUES"; data: MemberMonthPayment[] }
  | { type: "SET_ERROR"; data: string | null };

const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case "SET_LOADING":
      return { ...state, loading: action.data };
    case "SET_VALUES":
      return { ...state, values: action.data };
    case "SET_ERROR":
      return { ...state, error: action.data };
    default:
      return state;
  }
};

export const useFetchMemberPayments = (
  memberId: string | null,
  chitId: string | null,
) => {
  const [state, dispatch] = React.useReducer(reducer, {
    loading: false,
    values: [],
    error: null,
  });

  const fetch_ = React.useCallback(async () => {
    if (!memberId || !chitId) return;
    dispatch({ type: "SET_LOADING", data: true });
    try {
      const res = await fetch(
        `/api/members/payments?memberId=${memberId}&chitId=${chitId}`,
      );
      const data = await res.json();
      if (!data.success) {
        dispatch({ type: "SET_ERROR", data: data.error });
      } else {
        dispatch({ type: "SET_VALUES", data: data.months });
      }
    } catch (err) {
      dispatch({
        type: "SET_ERROR",
        data: err instanceof Error ? err.message : "Failed to fetch",
      });
    } finally {
      dispatch({ type: "SET_LOADING", data: false });
    }
  }, [memberId, chitId]);

  React.useEffect(() => {
    fetch_();
  }, [fetch_]);

  return {
    values: state.values,
    loading: state.loading,
    error: state.error,
    refetch: fetch_,
  };
};
