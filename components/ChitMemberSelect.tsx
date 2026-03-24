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
import { Member } from "@/types";
import { OwnerBadge } from "./custom-badges";

export const ChitMemberSelect = ({
  onChange,
  value,
  className,
  excludeMemberIds = [],
}: {
  onChange: (_value: string) => void;
  value: string | undefined;
  className?: string;
  excludeMemberIds?: string[];
}) => {
  const { values } = React.useContext(MemberContext);

  const renderSelectOption = () => {
    return values
      ?.filter((memberObj) => !excludeMemberIds?.includes(memberObj?.id))
      ?.sort((a, b) => a.name.localeCompare(b.name))
      ?.map((memberObj: Member) => {
        return (
          <SelectItem key={memberObj.id} value={memberObj.id}>
            {memberObj?.name}
            {memberObj?.owner ? (
              <span className="ml-2">
                <OwnerBadge />
              </span>
            ) : null}
          </SelectItem>
        );
      });
  };

  return (
    <Select onValueChange={onChange} value={value}>
      <SelectTrigger className={`w-full ${className ?? ""}`}>
        <SelectValue placeholder="Select a member" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>{renderSelectOption()}</SelectGroup>
      </SelectContent>
    </Select>
  );
};
