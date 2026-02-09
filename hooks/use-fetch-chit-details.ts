/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";

function chitDetailReducer(state: any, action: { type: string; data: any }) {
  const { type, data } = action;
  switch (type) {
    case "SET_CHIT_DETAILS": {
      return {
        ...state,
        chitDetails: data,
      };
    }
    case "SET_ERROR": {
      return {
        ...state,
        error: data,
      };
    }
    case "SET_LOADING": {
      return {
        ...state,
        loading: data,
      };
    }
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

  React.useEffect(() => {
    fetchChitDetails(id);
  }, [id]);

  const fetchChitDetails = async (id: string) => {
    try {
      dispatch({
        type: "SET_LOADING",
        data: true,
      });
      const res = await fetch(`/api/chit-detail/${id}`);
      const data = await res.json();
      if (data.error) {
        dispatch({
          type: "SET_ERROR",
          data: data.error,
        });
      } else {
        dispatch({
          type: "SET_CHIT_DETAILS",
          data: data.chitDetails,
        });
      }
    } catch (err) {
      dispatch({
        type: "SET_ERROR",
        data: err,
      });
    } finally {
      dispatch({
        type: "SET_LOADING",
        data: false,
      });
    }
  };

  return state;
};
