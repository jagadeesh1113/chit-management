/* eslint-disable @typescript-eslint/no-explicit-any */
import { MemberContext } from "@/context/MemberContext";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import React from "react";

export const ChitMemberSelect = ({
  onChange,
  value,
}: {
  onChange: (_value: string) => void;
  value: string | undefined;
}) => {
  const { values } = React.useContext(MemberContext);

  const renderSelectOption = () => {
    return values?.map((memberObj: any) => {
      return (
        <SelectItem key={memberObj.id} value={memberObj.id}>
          {memberObj?.name}
        </SelectItem>
      );
    });
  };

  return (
    <Select onValueChange={onChange} value={value}>
      <SelectTrigger className="w-full max-w-48">
        <SelectValue placeholder="Select a member" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>{renderSelectOption()}</SelectGroup>
      </SelectContent>
    </Select>
  );
};
