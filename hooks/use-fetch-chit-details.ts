import React from "react";
import type { Chit } from "@/types";

interface ChitDetailState {
  chitDetails: Chit | null;
  loading: boolean;
  error: string | null;
}

type ChitDetailAction =
  | { type: "SET_CHIT_DETAILS"; data: Chit }
  | { type: "SET_LOADING"; data: boolean }
  | { type: "SET_ERROR"; data: string | null };

function chitDetailReducer(
  state: ChitDetailState,
  action: ChitDetailAction,
): ChitDetailState {
  switch (action.type) {
    case "SET_CHIT_DETAILS":
      return { ...state, chitDetails: action.data };
    case "SET_LOADING":
      return { ...state, loading: action.data };
    case "SET_ERROR":
      return { ...state, error: action.data };
    default:
      return state;
  }
}

export const useFetchChitDetails = (id: string) => {
  const [state, dispatch] = React.useReducer(chitDetailReducer, {
    chitDetails: null,
    error: null,
    loading: true,
  });

  const fetchChitDetails = React.useCallback(async () => {
    dispatch({ type: "SET_LOADING", data: true });
    try {
      const res = await fetch(`/api/chit-detail/${id}`);
      const data = await res.json();
      if (data.error) {
        dispatch({ type: "SET_ERROR", data: data.error });
      } else {
        dispatch({ type: "SET_CHIT_DETAILS", data: data.chitDetails });
      }
    } catch (err) {
      dispatch({
        type: "SET_ERROR",
        data: err instanceof Error ? err.message : "Failed to fetch chit details",
      });
    } finally {
      dispatch({ type: "SET_LOADING", data: false });
    }
  }, [id]);

  React.useEffect(() => {
    fetchChitDetails();
  }, [fetchChitDetails]);

  return state;
};
