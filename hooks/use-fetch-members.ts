/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";

const chitMembersReducer = (
  state: any,
  action: { type: string; data: any },
) => {
  const { type, data } = action;

  switch (type) {
    case "SET_LOADING": {
      return {
        ...state,
        loading: data,
      };
    }
    case "SET_VALUES": {
      return {
        ...state,
        values: data,
      };
    }
    case "SET_ERROR": {
      return {
        ...state,
        error: data,
      };
    }
    default:
      return state;
  }
};

export const useFetchMembers = (chitId: string) => {
  const [chitMembersState, dispatch] = React.useReducer(chitMembersReducer, {
    loading: true,
    values: [],
    error: null,
  });

  const { values, loading, error } = chitMembersState;

  const fetchChitMembers = React.useCallback(async () => {
    try {
      dispatch({
        type: "SET_LOADING",
        data: true,
      });
      const res = await fetch(`/api/members?chitId=${chitId}`);
      const data = await res.json();
      if (data.error) {
        dispatch({
          type: "SET_ERROR",
          data: data.error,
        });
      } else {
        dispatch({
          type: "SET_VALUES",
          data: data.members,
        });
      }
    } catch (err) {
      dispatch({
        type: "SET_ERROR",
        data: err instanceof Error ? err.message : "Failed to fetch documents",
      });
    } finally {
      dispatch({
        type: "SET_LOADING",
        data: false,
      });
    }
  }, [chitId]);

  React.useEffect(() => {
    fetchChitMembers();
  }, [fetchChitMembers]);

  return {
    values,
    loading,
    error,
    refetch: fetchChitMembers,
  };
};
