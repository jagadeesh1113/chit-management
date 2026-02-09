/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { TableSkletonRows } from "@/components/table-skleton-rows";

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

export const ChitTable = () => {
  const [chitState, dispatch] = React.useReducer(chitReducer, {
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

  const renderTableRows = () => {
    if (chitState?.loading) {
      return <TableSkletonRows rowsCount={5} colsCount={6} />;
    }

    return chitState?.values?.map((chitObj: any) => {
      return (
        <TableRow key={chitObj.id}>
          <TableCell className="font-medium">{chitObj.name}</TableCell>
          <TableCell>{chitObj.amount}</TableCell>
          <TableCell>{chitObj.members}</TableCell>
          <TableCell>{chitObj.months}</TableCell>
          <TableCell>{chitObj.charges}</TableCell>
          <TableCell>{chitObj.start_date}</TableCell>
        </TableRow>
      );
    });
  };

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Amount</TableHead>
          <TableHead>No of Members</TableHead>
          <TableHead>No Of Months</TableHead>
          <TableHead>Charges / Month</TableHead>
          <TableHead>Start Date</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>{renderTableRows()}</TableBody>
    </Table>
  );
};
