import React from "react";

/* eslint-disable @typescript-eslint/no-explicit-any */
const chitPaymentsReducer = (
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

export const useFetchChitPayments = (month_id: string) => {
  const [chitPaymentsState, dispatch] = React.useReducer(chitPaymentsReducer, {
    loading: true,
    values: [],
    error: null,
  });

  const { values, loading, error } = chitPaymentsState;

  const fetchChitPayments = React.useCallback(async () => {
    if (!month_id) {
      return;
    }
    try {
      dispatch({
        type: "SET_LOADING",
        data: true,
      });
      const res = await fetch(`/api/payments?monthId=${month_id}`);
      const data = await res.json();
      if (data.error) {
        dispatch({
          type: "SET_ERROR",
          data: data.error,
        });
      } else {
        dispatch({
          type: "SET_VALUES",
          data: data.payments,
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
  }, [month_id]);

  React.useEffect(() => {
    fetchChitPayments();
  }, [fetchChitPayments]);

  return {
    values,
    loading,
    error,
    refetch: fetchChitPayments,
  };
};
