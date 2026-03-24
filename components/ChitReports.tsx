"use client";

import React from "react";
import { Card, CardContent } from "./ui/card";
import { MemberContext } from "@/context/MemberContext";
import { ChitMonthContext } from "@/context/MonthContext";
import { ChitContext } from "@/context/ChitContext";
import { getMonthlyPaymentAmount } from "@/lib/utils";
import { Skeleton } from "./ui/skeleton";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const currencyFormatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
});

const compactCurrencyFormatter = new Intl.NumberFormat("en-IN", {
  notation: "compact",
  compactDisplay: "short",
  maximumFractionDigits: 1,
});

export const ChitReports = () => {
  const { values: members, loading: membersLoading } =
    React.useContext(MemberContext);
  const { values: months, loading: monthsLoading } =
    React.useContext(ChitMonthContext);
  const { chitDetails } = React.useContext(ChitContext);

  const loading = membersLoading || monthsLoading;
  const [isMobile, setIsMobile] = React.useState(false);

  React.useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 640px)");
    const update = () => setIsMobile(mediaQuery.matches);
    update();
    mediaQuery.addEventListener("change", update);
    return () => mediaQuery.removeEventListener("change", update);
  }, []);

  const monthChartData = React.useMemo(
    () =>
      months.map((month) => {
        const amountPerPerson = getMonthlyPaymentAmount({
          chit: chitDetails,
          month,
          isOwnerAuction: month?.is_owner_auction,
        });
        const totalMembers = Number(
          chitDetails?.members ?? members.length ?? 0,
        );
        const expected = amountPerPerson * totalMembers;
        const received = month?.payments_received ?? 0;
        return {
          name: month.name,
          expected,
          received,
          pending: Math.max(0, expected - received),
        };
      }),
    [months, chitDetails, members.length],
  );
  const chartMinWidth = React.useMemo(
    () => Math.max(520, monthChartData.length * 84),
    [monthChartData.length],
  );

  return (
    <div className="space-y-4">
      <div className="grid min-w-0 gap-4 xl:grid-cols-3">
        <Card className="min-w-0 shadow-none xl:col-span-2">
          <CardContent className="min-w-0 p-4">
            <h3 className="text-sm font-semibold mb-3">
              Expected vs Received by Month
            </h3>
            <div className="h-64 w-full overflow-x-auto overflow-y-hidden sm:h-72">
              {loading ? (
                <Skeleton className="h-full w-full" />
              ) : (
                <div
                  className="h-full min-w-max"
                  style={{ minWidth: `${chartMinWidth}px` }}
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={monthChartData}
                      margin={{
                        top: 8,
                        right: isMobile ? 4 : 16,
                        left: isMobile ? -20 : 0,
                        bottom: 8,
                      }}
                      barCategoryGap={isMobile ? "26%" : "20%"}
                    >
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis
                        dataKey="name"
                        fontSize={isMobile ? 10 : 12}
                        tickLine={false}
                        axisLine={false}
                        tickMargin={8}
                        interval={0}
                        tickFormatter={(value: string) =>
                          isMobile ? value.slice(0, 3) : value
                        }
                      />
                      <YAxis
                        fontSize={isMobile ? 10 : 12}
                        tickLine={false}
                        axisLine={false}
                        width={isMobile ? 36 : 48}
                        tickFormatter={(value: number) =>
                          compactCurrencyFormatter.format(value)
                        }
                      />
                      <Tooltip
                        cursor={{ fill: "hsl(var(--muted) / 0.35)" }}
                        content={({ active, payload, label }) => {
                          if (!active || !payload?.length) return null;
                          const row = payload[0]?.payload as
                            | {
                                expected: number;
                                received: number;
                                pending: number;
                              }
                            | undefined;
                          if (!row) return null;

                          return (
                            <div className="max-w-[220px] rounded-lg border border-border bg-background px-3 py-2 text-xs shadow-md">
                              <p className="font-medium text-foreground mb-1">
                                {label}
                              </p>
                              <p className="text-muted-foreground">
                                Expected:{" "}
                                <span className="font-medium text-foreground">
                                  {currencyFormatter.format(row.expected)}
                                </span>
                              </p>
                              <p className="text-muted-foreground">
                                Received:{" "}
                                <span className="font-medium text-green-700 dark:text-green-400">
                                  {currencyFormatter.format(row.received)}
                                </span>
                              </p>
                              <p className="text-muted-foreground">
                                Pending:{" "}
                                <span className="font-medium text-amber-600 dark:text-amber-400">
                                  {currencyFormatter.format(row.pending)}
                                </span>
                              </p>
                            </div>
                          );
                        }}
                      />
                      <Legend
                        iconSize={10}
                        wrapperStyle={{
                          fontSize: isMobile ? "11px" : "12px",
                          paddingTop: "8px",
                        }}
                      />
                      <Bar
                        dataKey="expected"
                        fill="#2563eb"
                        radius={[4, 4, 0, 0]}
                        maxBarSize={isMobile ? 14 : 22}
                      />
                      <Bar
                        dataKey="received"
                        fill="#16a34a"
                        radius={[4, 4, 0, 0]}
                        maxBarSize={isMobile ? 14 : 22}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
