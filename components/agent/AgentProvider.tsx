"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { AgentChat, AgentTrigger } from "./AgentChat";

export type PageContext =
  | { page: "home" }
  | { page: "chit"; chitId: string; chitName?: string };

export const AgentProvider = () => {
  const [isOpen, setIsOpen] = React.useState(false);
  const pathname = usePathname();

  // Derive page context from the URL
  const pageContext = React.useMemo<PageContext>(() => {
    const chitMatch = pathname.match(/^\/chit\/([^/]+)/);
    if (chitMatch) {
      return { page: "chit", chitId: chitMatch[1] };
    }
    return { page: "home" };
  }, [pathname]);

  // When on a chit page, fetch the chit name so the agent can reference it
  const [chitName, setChitName] = React.useState<string | undefined>();

  React.useEffect(() => {
    if (pageContext.page !== "chit") {
      setChitName(undefined);
      return;
    }
    fetch(`/api/chit-detail/${pageContext.chitId}`)
      .then((r) => r.json())
      .then((d) => {
        if (d?.chitDetails?.name) setChitName(d.chitDetails.name);
      })
      .catch(() => {});
  }, [pageContext]);

  const resolvedContext: PageContext =
    pageContext.page === "chit" ? { ...pageContext, chitName } : pageContext;

  // Clear messages when navigating to a different chit
  const [resetKey, setResetKey] = React.useState(0);
  const prevChitId = React.useRef<string | undefined>(null);

  React.useEffect(() => {
    if (pageContext.page === "chit") {
      if (prevChitId.current && prevChitId.current !== pageContext.chitId) {
        setResetKey((k) => k + 1);
      }
      prevChitId.current = pageContext.chitId;
    }
  }, [pageContext]);

  return (
    <>
      <AgentTrigger isOpen={isOpen} onClick={() => setIsOpen(true)} />
      <AgentChat
        key={resetKey}
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        pageContext={resolvedContext}
      />
    </>
  );
};
