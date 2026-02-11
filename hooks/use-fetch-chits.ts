import React from "react";

/* eslint-disable @typescript-eslint/no-explicit-any */
const chitReducer = (state: any, action: { type: string; data: any }) => {
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

export const useFetchChits = () => {
  const [{ loading, values, error }, dispatch] = React.useReducer(chitReducer, {
    loading: true,
    values: [],
    error: null,
  });

  React.useEffect(() => {
    fetchChits();
  }, []);

  const fetchChits = async () => {
    try {
      dispatch({
        type: "SET_LOADING",
        data: true,
      });
      const res = await fetch("/api/chits");
      const data = await res.json();
      if (data.error) {
        dispatch({
          type: "SET_ERROR",
          data: data.error,
        });
      } else {
        dispatch({
          type: "SET_VALUES",
          data: data.chits,
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
  };

  return {
    loading,
    values,
    error,
    refetch: fetchChits,
  };
};
