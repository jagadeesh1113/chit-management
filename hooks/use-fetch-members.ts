import React from "react";
import type { Member } from "@/types";

interface MembersState {
  values: Member[];
  loading: boolean;
  error: string | null;
}

type MembersAction =
  | { type: "SET_LOADING"; data: boolean }
  | { type: "SET_VALUES"; data: Member[] }
  | { type: "SET_ERROR"; data: string | null };

const chitMembersReducer = (
  state: MembersState,
  action: MembersAction,
): MembersState => {
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

export const useFetchMembers = (chitId: string) => {
  const [state, dispatch] = React.useReducer(chitMembersReducer, {
    loading: true,
    values: [],
    error: null,
  });

  const fetchChitMembers = React.useCallback(async () => {
    dispatch({ type: "SET_LOADING", data: true });
    try {
      const res = await fetch(`/api/members?chitId=${chitId}`);
      const data = await res.json();
      if (data.error) {
        dispatch({ type: "SET_ERROR", data: data.error });
      } else {
        dispatch({ type: "SET_VALUES", data: data.members });
      }
    } catch (err) {
      dispatch({
        type: "SET_ERROR",
        data: err instanceof Error ? err.message : "Failed to fetch members",
      });
    } finally {
      dispatch({ type: "SET_LOADING", data: false });
    }
  }, [chitId]);

  React.useEffect(() => {
    fetchChitMembers();
  }, [fetchChitMembers]);

  return {
    values: state.values,
    loading: state.loading,
    error: state.error,
    refetch: fetchChitMembers,
  };
};
