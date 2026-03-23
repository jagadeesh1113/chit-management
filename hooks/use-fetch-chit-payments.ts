import React from "react";
import type { Payment } from "@/types";

interface ChitPaymentsState {
  values: Payment[];
  loading: boolean;
  error: string | null;
}

type ChitPaymentsAction =
  | { type: "SET_LOADING"; data: boolean }
  | { type: "SET_VALUES"; data: Payment[] }
  | { type: "SET_ERROR"; data: string | null };

const chitPaymentsReducer = (
  state: ChitPaymentsState,
  action: ChitPaymentsAction,
): ChitPaymentsState => {
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

export const useFetchChitPayments = (month_id: string, chit_id: string) => {
  const [state, dispatch] = React.useReducer(chitPaymentsReducer, {
    loading: true,
    values: [],
    error: null,
  });

  const fetchChitPayments = React.useCallback(async () => {
    if (!month_id) return;
    dispatch({ type: "SET_LOADING", data: true });
    try {
      const res = await fetch(
        `/api/payments?monthId=${month_id}&chitId=${chit_id}`,
      );
      const data = await res.json();
      if (data.error) {
        dispatch({ type: "SET_ERROR", data: data.error });
      } else {
        dispatch({ type: "SET_VALUES", data: data.payments });
      }
    } catch (err) {
      dispatch({
        type: "SET_ERROR",
        data: err instanceof Error ? err.message : "Failed to fetch payments",
      });
    } finally {
      dispatch({ type: "SET_LOADING", data: false });
    }
  }, [month_id]);

  React.useEffect(() => {
    fetchChitPayments();
  }, [fetchChitPayments]);

  return {
    values: state.values,
    loading: state.loading,
    error: state.error,
    refetch: fetchChitPayments,
  };
};
