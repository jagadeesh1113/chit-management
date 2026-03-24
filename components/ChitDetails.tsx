/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { Card, CardContent } from "./ui/card";
import { ChitMembers } from "./ChitMembers";
import { MemberProvider } from "@/context/MemberContext";
import { ChitMonths } from "./ChitMonths";
import { ChitContext } from "@/context/ChitContext";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "./ui/tabs";
import {
  ArrowLeftIcon,
  UsersIcon,
  CalendarDaysIcon,
  IndianRupeeIcon,
  ChartColumnIncreasingIcon,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "./ui/button";
import React from "react";
import { ChitMonthProvider } from "@/context/MonthContext";
import { ChitReports } from "./ChitReports";

const formatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
});

export const ChitDetails = ({ id }: { id: string }) => {
  const { chitDetails } = React.useContext(ChitContext);
  const router = useRouter();

  const amount = chitDetails?.amount
    ? formatter.format(Number(chitDetails.amount))
    : "—";
  const charges = chitDetails?.charges
    ? formatter.format(Number(chitDetails.charges))
    : "—";

  return (
    <div className="space-y-5">
      {/* ── Back + title ─────────────────────────────────────────────── */}
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          className="size-8 shrink-0"
          onClick={() => router.back()}
        >
          <ArrowLeftIcon className="size-4" />
        </Button>
        <div className="min-w-0">
          <h1 className="text-base font-semibold sm:text-lg leading-tight truncate">
            {chitDetails?.name ?? "Chit Details"}
          </h1>
          <p className="text-xs text-muted-foreground">
            Started {chitDetails?.start_date ?? "—"}
          </p>
        </div>
      </div>

      {/* ── Summary stats strip ──────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard
          icon={<IndianRupeeIcon className="size-3.5" />}
          label="Chit amount"
          value={amount}
        />
        <StatCard
          icon={<IndianRupeeIcon className="size-3.5" />}
          label="Charges / month"
          value={charges}
        />
        <StatCard
          icon={<UsersIcon className="size-3.5" />}
          label="Members"
          value={chitDetails?.members ?? "—"}
        />
        <StatCard
          icon={<CalendarDaysIcon className="size-3.5" />}
          label="Duration"
          value={chitDetails?.months ? `${chitDetails.months} months` : "—"}
        />
      </div>

      {/* ── Tabs ─────────────────────────────────────────────────────── */}
      <MemberProvider chitId={id}>
        <ChitMonthProvider chitId={id}>
          <Tabs defaultValue="members">
            <TabsList>
              <TabsTrigger value="members">
                <UsersIcon className="size-3.5" />
                Members
              </TabsTrigger>
              <TabsTrigger value="months">
                <CalendarDaysIcon className="size-3.5" />
                Months
              </TabsTrigger>
              <TabsTrigger value="reports">
                <ChartColumnIncreasingIcon className="size-3.5" />
                Reports
              </TabsTrigger>
            </TabsList>
            <TabsContent value="members">
              <ChitMembers chitId={id} />
            </TabsContent>

            <TabsContent value="months">
              <ChitMonths chitId={id} />
            </TabsContent>
            <TabsContent value="reports">
              <ChitReports />
            </TabsContent>
          </Tabs>
        </ChitMonthProvider>
      </MemberProvider>
    </div>
  );
};

// ── Small stat card ───────────────────────────────────────────────────────────
function StatCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: any;
}) {
  return (
    <Card className="shadow-none">
      <CardContent className="p-3 space-y-1">
        <div className="flex items-center gap-1 text-muted-foreground">
          {icon}
          <span className="text-xs">{label}</span>
        </div>
        <p className="text-sm font-semibold leading-tight truncate">
          {value ?? "—"}
        </p>
      </CardContent>
    </Card>
  );
}
