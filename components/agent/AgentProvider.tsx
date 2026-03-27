"use client";

import React from "react";
import { AgentChat, AgentTrigger } from "./AgentChat";

export const AgentProvider = () => {
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <>
      <AgentTrigger isOpen={isOpen} onClick={() => setIsOpen(true)} />
      <AgentChat isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
};
