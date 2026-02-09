/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";

const chitMonthsReducer = (state: any, action: { type: string; data: any }) => {
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

export const useFetchChitMonths = (chitId: string) => {
  const [chitMonthsState, dispatch] = React.useReducer(chitMonthsReducer, {
    loading: true,
    values: [],
    error: null,
  });

  const fetchChitMonths = React.useCallback(async () => {
    try {
      dispatch({
        type: "SET_LOADING",
        data: true,
      });
      const res = await fetch(`/api/months?chitId=${chitId}`);
      const data = await res.json();
      if (data.error) {
        dispatch({
          type: "SET_ERROR",
          data: data.error,
        });
      } else {
        dispatch({
          type: "SET_VALUES",
          data: data.months,
        });
      }
    } catch (err) {
      dispatch({
        type: "SET_ERROR",
        data: err instanceof Error ? err.message : "Failed to fetch months",
      });
    } finally {
      dispatch({
        type: "SET_LOADING",
        data: false,
      });
    }
  }, [chitId]);

  React.useEffect(() => {
    fetchChitMonths();
  }, [fetchChitMonths]);

  return { ...chitMonthsState, refetch: fetchChitMonths };
};
