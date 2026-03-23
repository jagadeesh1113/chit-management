import React from "react";
import type { ChitMonth } from "@/types";

interface ChitMonthsState {
  values: ChitMonth[];
  loading: boolean;
  error: string | null;
}

type ChitMonthsAction =
  | { type: "SET_LOADING"; data: boolean }
  | { type: "SET_VALUES"; data: ChitMonth[] }
  | { type: "SET_ERROR"; data: string | null };

const chitMonthsReducer = (
  state: ChitMonthsState,
  action: ChitMonthsAction,
): ChitMonthsState => {
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

export const useFetchChitMonths = (chitId: string) => {
  const [state, dispatch] = React.useReducer(chitMonthsReducer, {
    loading: true,
    values: [],
    error: null,
  });

  const fetchChitMonths = React.useCallback(async () => {
    dispatch({ type: "SET_LOADING", data: true });
    try {
      const res = await fetch(`/api/months?chitId=${chitId}`);
      const data = await res.json();
      if (data.error) {
        dispatch({ type: "SET_ERROR", data: data.error });
      } else {
        dispatch({ type: "SET_VALUES", data: data.months });
      }
    } catch (err) {
      dispatch({
        type: "SET_ERROR",
        data: err instanceof Error ? err.message : "Failed to fetch months",
      });
    } finally {
      dispatch({ type: "SET_LOADING", data: false });
    }
  }, [chitId]);

  React.useEffect(() => {
    fetchChitMonths();
  }, [fetchChitMonths]);

  return {
    values: state.values,
    loading: state.loading,
    error: state.error,
    refetch: fetchChitMonths,
  };
};
