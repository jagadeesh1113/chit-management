import React from "react";
import type { Chit } from "@/types";

interface ChitsState {
  values: Chit[];
  loading: boolean;
  error: string | null;
}

type ChitsAction =
  | { type: "SET_LOADING"; data: boolean }
  | { type: "SET_VALUES"; data: Chit[] }
  | { type: "SET_ERROR"; data: string | null };

const chitReducer = (state: ChitsState, action: ChitsAction): ChitsState => {
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

export const useFetchChits = () => {
  const [state, dispatch] = React.useReducer(chitReducer, {
    loading: true,
    values: [],
    error: null,
  });

  const fetchChits = React.useCallback(async () => {
    dispatch({ type: "SET_LOADING", data: true });
    try {
      const res = await fetch("/api/chits");
      const data = await res.json();
      if (data.error) {
        dispatch({ type: "SET_ERROR", data: data.error });
      } else {
        dispatch({ type: "SET_VALUES", data: data.chits });
      }
    } catch (err) {
      dispatch({
        type: "SET_ERROR",
        data: err instanceof Error ? err.message : "Failed to fetch chits",
      });
    } finally {
      dispatch({ type: "SET_LOADING", data: false });
    }
  }, []);

  React.useEffect(() => {
    fetchChits();
  }, [fetchChits]);

  return {
    values: state.values,
    loading: state.loading,
    error: state.error,
    refetch: fetchChits,
  };
};
