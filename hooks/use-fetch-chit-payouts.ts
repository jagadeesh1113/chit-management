import { ChitPayout } from "@/types";
import React from "react";

interface ChitPayoutsState {
  values: ChitPayout[];
  loading: boolean;
  error: string | null;
}

type ChitPayoutsAction =
  | { type: "SET_LOADING"; data: boolean }
  | { type: "SET_VALUES"; data: ChitPayout[] }
  | { type: "SET_ERROR"; data: string | null };

const chitPayoutsReducer = (
  state: ChitPayoutsState,
  action: ChitPayoutsAction,
): ChitPayoutsState => {
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

export const useFetchChitPayouts = (month_id: string, chit_id: string) => {
  const [state, dispatch] = React.useReducer(chitPayoutsReducer, {
    loading: false,
    values: [],
    error: null,
  });

  const fetchChitPayouts = React.useCallback(async () => {
    if (!month_id || !chit_id) return;
    dispatch({ type: "SET_LOADING", data: true });
    try {
      const res = await fetch(
        `/api/payments/payouts?monthId=${month_id}&chitId=${chit_id}`,
      );
      const data = await res.json();

      if (data.error) {
        dispatch({ type: "SET_ERROR", data: data.error });
      } else {
        const payouts = (data.payouts ?? []) as ChitPayout[];
        dispatch({ type: "SET_VALUES", data: payouts });
      }
    } catch (err) {
      dispatch({
        type: "SET_ERROR",
        data: err instanceof Error ? err.message : "Failed to fetch payouts",
      });
    } finally {
      dispatch({ type: "SET_LOADING", data: false });
    }
  }, [month_id, chit_id]);

  React.useEffect(() => {
    fetchChitPayouts();
  }, [fetchChitPayouts]);

  return {
    values: state.values,
    loading: state.loading,
    error: state.error,
    refetch: fetchChitPayouts,
  };
};
