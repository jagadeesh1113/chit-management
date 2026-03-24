"use client";

import React from "react";
import { Card, CardContent } from "./ui/card";
import { MemberContext } from "@/context/MemberContext";
import { ChitMonthContext } from "@/context/MonthContext";
import { ChitContext } from "@/context/ChitContext";
import { useFetchChitPayments } from "@/hooks/use-fetch-chit-payments";
import { getMonthlyPaymentAmount } from "@/lib/utils";
import { Skeleton } from "./ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  Legend,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Button } from "./ui/button";
import { RefreshCcwIcon } from "lucide-react";

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
  const {
    values: members,
    loading: membersLoading,
    refetch: refetchMembers,
  } = React.useContext(MemberContext);
  const {
    values: months,
    loading: monthsLoading,
    refetch: refetchMonths,
  } = React.useContext(ChitMonthContext);
  const { chitDetails } = React.useContext(ChitContext);

  const loading = membersLoading || monthsLoading;
  const [isMobile, setIsMobile] = React.useState(false);
  const [selectedMonthId, setSelectedMonthId] = React.useState("");

  React.useEffect(() => {
    if (!selectedMonthId && months.length > 0) {
      setSelectedMonthId(months[0].id);
    }
  }, [months, selectedMonthId]);

  const selectedMonth = React.useMemo(
    () => months.find((m) => m.id === selectedMonthId) ?? null,
    [months, selectedMonthId],
  );

  const { values: selectedMonthPayments, loading: monthPaymentsLoading } =
    useFetchChitPayments(selectedMonthId, chitDetails?.id ?? "");
  const isRefreshing = loading || monthPaymentsLoading;

  const handleRefreshReports = async () => {
    await Promise.all([refetchMembers(), refetchMonths()]);
  };

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
  const paymentTimelineData = React.useMemo(() => {
    const groupedByDate = selectedMonthPayments
      .flatMap((memberPayment) => memberPayment.payments ?? [])
      .filter((payment) => !!payment?.payment_date)
      .reduce<Record<string, number>>((acc, payment) => {
        const key = payment.payment_date as string;
        acc[key] = (acc[key] ?? 0) + (payment.amount ?? 0);
        return acc;
      }, {});

    let initialValue = 0;
    return Object.entries(groupedByDate)
      .sort(([a], [b]) => new Date(a).getTime() - new Date(b).getTime())
      .map(([date, amount]) => {
        initialValue += amount;
        return {
          date,
          label: new Date(date).toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
          }),
          amount: initialValue,
        };
      });
  }, [selectedMonthPayments]);

  const selectedMonthTargetAmount = React.useMemo(() => {
    if (!selectedMonth) return 0;
    const monthlyPaymentAmount = getMonthlyPaymentAmount({
      chit: chitDetails,
      month: selectedMonth,
      isOwnerAuction: selectedMonth?.is_owner_auction,
    });
    const totalMembers = Number(chitDetails?.members ?? members.length ?? 0);
    return monthlyPaymentAmount * totalMembers;
  }, [selectedMonth, chitDetails, members.length]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-end">
        <Button
          variant="outline"
          size="sm"
          onClick={handleRefreshReports}
          disabled={isRefreshing}
          className="h-8 px-2 sm:px-3"
        >
          <RefreshCcwIcon
            className={`size-3.5 ${isRefreshing ? "animate-spin" : ""}`}
          />
          <span className="hidden sm:inline">Refresh</span>
        </Button>
      </div>
      <div className="grid min-w-0 gap-4 xl:grid-cols-3">
        <Card className="min-w-0 shadow-none xl:col-span-3">
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

      <Card className="shadow-none">
        <CardContent className="p-4 space-y-3">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <h3 className="text-sm font-semibold">Monthly Payment Timeline</h3>
            <Select value={selectedMonthId} onValueChange={setSelectedMonthId}>
              <SelectTrigger className="w-full sm:w-56">
                <SelectValue placeholder="Select month" />
              </SelectTrigger>
              <SelectContent>
                {months.map((month) => (
                  <SelectItem key={month.id} value={month.id}>
                    {month.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <p className="text-xs text-muted-foreground">
            Amount vs payment date{" "}
            {selectedMonth?.name ? `for ${selectedMonth.name}` : ""}
          </p>

          <div className="h-64 sm:h-72">
            {monthPaymentsLoading || loading ? (
              <Skeleton className="h-full w-full" />
            ) : paymentTimelineData.length === 0 ? (
              <div className="h-full rounded-md border border-dashed border-border flex items-center justify-center text-sm text-muted-foreground">
                No dated payments available for selected month.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={paymentTimelineData}
                  margin={{ top: 8, right: 16, left: 0, bottom: 8 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis
                    dataKey="label"
                    fontSize={isMobile ? 10 : 12}
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
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
                    cursor={{
                      stroke: "hsl(var(--muted-foreground))",
                      strokeDasharray: "4 4",
                    }}
                    content={({ active, payload, label }) => {
                      if (!active || !payload?.length) return null;
                      const point = payload[0]?.payload as
                        | { amount: number; date: string }
                        | undefined;
                      if (!point) return null;
                      return (
                        <div className="max-w-[220px] rounded-lg border border-border bg-background px-3 py-2 text-xs shadow-md">
                          <p className="font-medium text-foreground mb-1">
                            {label}
                          </p>
                          <p className="text-muted-foreground">
                            Date:{" "}
                            <span className="font-medium text-foreground">
                              {new Date(point.date).toLocaleDateString(
                                "en-IN",
                                {
                                  day: "2-digit",
                                  month: "short",
                                  year: "numeric",
                                },
                              )}
                            </span>
                          </p>
                          <p className="text-muted-foreground">
                            Amount:{" "}
                            <span className="font-medium text-foreground">
                              {currencyFormatter.format(point.amount)}
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
                  <Line
                    type="monotone"
                    dataKey="amount"
                    name="Payment Amount"
                    stroke="#2563eb"
                    strokeWidth={2}
                    dot={{ r: 3 }}
                    activeDot={{ r: 5 }}
                  />
                  <ReferenceLine
                    y={selectedMonthTargetAmount}
                    stroke="#d97706"
                    strokeDasharray="6 4"
                    strokeWidth={1.5}
                    ifOverflow="extendDomain"
                    label={{
                      value: "Target",
                      position: "insideTopRight",
                      fill: "#d97706",
                      fontSize: 11,
                    }}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
