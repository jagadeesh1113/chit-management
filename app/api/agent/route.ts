import { createClient } from "@/lib/supabase/server";
import { openai } from "@ai-sdk/openai";
import { streamText, tool, stepCountIs, convertToModelMessages } from "ai";
import { z } from "zod";

export const maxDuration = 60;

export async function POST(req: Request) {
  const { messages } = await req.json();
  const modelMessages = await convertToModelMessages(messages);

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return new Response("Unauthorized", { status: 401 });
  }

  const result = streamText({
    model: openai("gpt-4o"),
    system: `You are a helpful assistant for the Manage Chit application — a chit fund management system.
You help users manage their chit funds by performing actions on their behalf.

A "chit fund" (or chit) is a savings scheme where a group of people pool money monthly. Each month, one member wins the auction and takes the pooled amount.

Key concepts:
- Chit: the savings group (has amount, members count, months/auctions count, monthly charges, start date)
- Member: a participant in a chit (has name, mobile number; one is the owner)
- Month/Auction: a monthly auction round (has auction date, auction amount, winning member)
- Payment: a member's monthly contribution (has amount, payment type: cash/cheque/bank_transfer, payment date)

You can:
1. List and get details of chits, members, months, payments
2. Create chits, add members, add months/auctions, record payments
3. Edit chits, members, months
4. Delete chits, members, months, payments

Always confirm destructive actions (delete) with the user before proceeding.
When creating or editing, ask for missing required fields.
Be concise and friendly. Format amounts in Indian Rupees (₹).
When listing items, present them in a clean readable format.
Today's date is ${new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}.`,

    messages: modelMessages,

    tools: {
      // ── READ ──────────────────────────────────────────────────────────────

      listChits: tool({
        description: "Get all chit funds for the current user",
        inputSchema: z.object({}),
        execute: async () => {
          const { data, error } = await supabase.rpc("get_chit_v1", {
            selected_user_id: user.id,
          });
          if (error) return { error: error.message };
          return { chits: data };
        },
      }),

      getChitDetails: tool({
        description: "Get details of a specific chit including its stats",
        inputSchema: z.object({
          chit_id: z.string().describe("The chit ID"),
        }),
        execute: async ({ chit_id }: { chit_id: string }) => {
          const { data, error } = await supabase
            .from("chits")
            .select("*")
            .eq("id", chit_id)
            .eq("deleted", false)
            .single();
          if (error) return { error: error.message };
          return { chit: data };
        },
      }),

      listMembers: tool({
        description: "List all members of a chit",
        inputSchema: z.object({
          chit_id: z.string().describe("The chit ID"),
        }),
        execute: async ({ chit_id }: { chit_id: string }) => {
          const { data, error } = await supabase.rpc("get_chit_members_v10", {
            selected_chit_id: chit_id,
          });
          if (error) return { error: error.message };
          return { members: data };
        },
      }),

      listMonths: tool({
        description: "List all monthly auctions for a chit",
        inputSchema: z.object({
          chit_id: z.string().describe("The chit ID"),
        }),
        execute: async ({ chit_id }: { chit_id: string }) => {
          const { data, error } = await supabase.rpc("get_chit_months_v18", {
            selected_chit_id: chit_id,
          });
          if (error) return { error: error.message };
          return { months: data };
        },
      }),

      listPayments: tool({
        description: "List all payments for a specific month of a chit",
        inputSchema: z.object({
          month_id: z.string().describe("The month/auction ID"),
          chit_id: z.string().describe("The chit ID"),
        }),
        execute: async ({
          month_id,
          chit_id,
        }: {
          month_id: string;
          chit_id: string;
        }) => {
          const { data, error } = await supabase.rpc("get_chit_payments_v21", {
            selected_month_id: month_id,
            selected_chit_id: chit_id,
          });
          if (error) return { error: error.message };
          return { payments: data };
        },
      }),

      getMemberPayments: tool({
        description:
          "Get all payments made by a specific member across all months",
        inputSchema: z.object({
          member_id: z.string().describe("The member ID"),
          chit_id: z.string().describe("The chit ID"),
        }),
        execute: async ({
          member_id,
          chit_id,
        }: {
          member_id: string;
          chit_id: string;
        }) => {
          const { data: months, error: mErr } = await supabase
            .from("months")
            .select("id, name, auction_date, auction_amount")
            .eq("chit_id", chit_id)
            .order("created_at", { ascending: true });
          if (mErr) return { error: mErr.message };

          const { data: payments, error: pErr } = await supabase
            .from("payments")
            .select("id, month_id, amount, payment_date, payment_type")
            .eq("member_id", member_id)
            .eq("chit_id", chit_id)
            .eq("is_payout", false);
          if (pErr) return { error: pErr.message };

          const byMonth: Record<string, typeof payments> = {};
          for (const p of payments ?? []) {
            if (!byMonth[p.month_id]) byMonth[p.month_id] = [];
            byMonth[p.month_id].push(p);
          }

          return {
            memberMonths: (months ?? []).map((m) => ({
              ...m,
              payments: byMonth[m.id] ?? [],
            })),
          };
        },
      }),

      // ── CREATE ────────────────────────────────────────────────────────────

      createChit: tool({
        description: "Create a new chit fund",
        inputSchema: z.object({
          name: z.string().describe("Name of the chit"),
          amount: z.number().describe("Total chit amount in rupees"),
          members: z.number().describe("Number of members"),
          months: z.number().describe("Number of months/auctions"),
          charges: z.number().describe("Monthly charges/commission in rupees"),
          start_date: z.string().describe("Start date in YYYY-MM-DD format"),
        }),
        execute: async ({
          name,
          amount,
          members,
          months,
          charges,
          start_date,
        }) => {
          const { data, error } = await supabase
            .from("chits")
            .insert({
              user_id: user.id,
              name,
              amount,
              members,
              months,
              charges,
              start_date,
            })
            .select()
            .single();
          if (error) return { error: error.message };
          return { success: true, chit: data };
        },
      }),

      addMembers: tool({
        description: "Add one or more members to a chit",
        inputSchema: z.object({
          chit_id: z.string().describe("The chit ID"),
          members: z
            .array(
              z.object({
                name: z.string().describe("Member name"),
                mobile: z.string().describe("Mobile number"),
              }),
            )
            .describe("List of members to add"),
        }),
        execute: async ({ chit_id, members: membersToAdd }) => {
          const rows = membersToAdd.map((m) => ({
            name: m.name,
            mobile: m.mobile,
            chit_id,
            created_by: user.id,
            owner: false,
          }));
          const { data, error } = await supabase
            .from("members")
            .insert(rows)
            .select();
          if (error) return { error: error.message };
          return { success: true, members: data };
        },
      }),

      addMonth: tool({
        description: "Add a monthly auction entry to a chit",
        inputSchema: z.object({
          chit_id: z.string().describe("The chit ID"),
          name: z
            .string()
            .describe("Month label e.g. 'Month 1' or 'January 2025'"),
          auction_date: z
            .string()
            .describe("Auction date in YYYY-MM-DD format"),
          auction_amount: z
            .number()
            .describe("Amount at which the auction was won"),
          auction_user: z.string().describe("Member ID of the auction winner"),
        }),
        execute: async ({
          chit_id,
          name,
          auction_date,
          auction_amount,
          auction_user,
        }) => {
          const { data, error } = await supabase
            .from("months")
            .insert({
              chit_id,
              name,
              auction_date,
              auction_amount,
              auction_user,
              created_by: user.id,
            })
            .select()
            .single();
          if (error) return { error: error.message };
          return { success: true, month: data };
        },
      }),

      recordPayment: tool({
        description: "Record a payment from a member for a specific month",
        inputSchema: z.object({
          chit_id: z.string().describe("The chit ID"),
          month_id: z.string().describe("The month ID"),
          member_id: z.string().describe("The member ID"),
          amount: z.number().describe("Amount paid in rupees"),
          payment_date: z
            .string()
            .describe("Payment date in YYYY-MM-DD format"),
          payment_type: z
            .enum(["cash", "cheque", "bank_transfer"])
            .describe("Payment method"),
        }),
        execute: async ({
          chit_id,
          month_id,
          member_id,
          amount,
          payment_date,
          payment_type,
        }) => {
          const { data, error } = await supabase
            .from("payments")
            .insert({
              chit_id,
              month_id,
              member_id,
              amount,
              payment_date,
              payment_type,
              created_by: user.id,
              is_payout: false,
            })
            .select()
            .single();
          if (error) return { error: error.message };
          return { success: true, payment: data };
        },
      }),

      // ── UPDATE ────────────────────────────────────────────────────────────

      updateChit: tool({
        description: "Update an existing chit fund's details",
        inputSchema: z.object({
          chit_id: z.string().describe("The chit ID"),
          name: z.string().optional(),
          amount: z.number().optional(),
          members: z.number().optional(),
          months: z.number().optional(),
          charges: z.number().optional(),
          start_date: z.string().optional().describe("YYYY-MM-DD"),
        }),
        execute: async ({ chit_id, ...fields }) => {
          const { data, error } = await supabase
            .from("chits")
            .update(fields)
            .eq("id", chit_id)
            .select()
            .single();
          if (error) return { error: error.message };
          return { success: true, chit: data };
        },
      }),

      updateMember: tool({
        description: "Update a member's name or mobile number",
        inputSchema: z.object({
          member_id: z.string().describe("The member ID"),
          name: z.string().optional(),
          mobile: z.string().optional(),
        }),
        execute: async ({ member_id, name, mobile }) => {
          const updates: Record<string, string> = {};
          if (name) updates.name = name;
          if (mobile) updates.mobile = mobile;
          const { data, error } = await supabase
            .from("members")
            .update(updates)
            .eq("id", member_id)
            .select()
            .single();
          if (error) return { error: error.message };
          return { success: true, member: data };
        },
      }),

      updateMonth: tool({
        description: "Update a monthly auction's name or date",
        inputSchema: z.object({
          month_id: z.string().describe("The month ID"),
          name: z.string().optional(),
          auction_date: z.string().optional().describe("YYYY-MM-DD"),
        }),
        execute: async ({ month_id, name, auction_date }) => {
          const updates: Record<string, string> = {};
          if (name) updates.name = name;
          if (auction_date) updates.auction_date = auction_date;
          const { data, error } = await supabase
            .from("months")
            .update(updates)
            .eq("id", month_id)
            .select()
            .single();
          if (error) return { error: error.message };
          return { success: true, month: data };
        },
      }),

      updatePayment: tool({
        description: "Update an existing payment entry",
        inputSchema: z.object({
          payment_id: z.string().describe("The payment ID"),
          amount: z.number().optional(),
          payment_date: z.string().optional().describe("YYYY-MM-DD"),
          payment_type: z.enum(["cash", "cheque", "bank_transfer"]).optional(),
        }),
        execute: async ({ payment_id, amount, payment_date, payment_type }) => {
          const updates: Record<string, unknown> = {};
          if (amount !== undefined) updates.amount = amount;
          if (payment_date !== undefined) updates.payment_date = payment_date;
          if (payment_type !== undefined) updates.payment_type = payment_type;
          const { data, error } = await supabase
            .from("payments")
            .update(updates)
            .eq("id", payment_id)
            .select()
            .single();
          if (error) return { error: error.message };
          return { success: true, payment: data };
        },
      }),

      // ── DELETE ────────────────────────────────────────────────────────────

      deleteChit: tool({
        description: "Soft-delete a chit fund (marks it as deleted)",
        inputSchema: z.object({
          chit_id: z.string().describe("The chit ID to delete"),
        }),
        execute: async ({ chit_id }) => {
          const { error } = await supabase
            .from("chits")
            .update({ deleted: true })
            .eq("id", chit_id);
          if (error) return { error: error.message };
          return { success: true };
        },
      }),

      deleteMember: tool({
        description: "Remove a member from a chit",
        inputSchema: z.object({
          member_id: z.string().describe("The member ID to remove"),
        }),
        execute: async ({ member_id }) => {
          const { error } = await supabase
            .from("members")
            .delete()
            .eq("id", member_id);
          if (error) return { error: error.message };
          return { success: true };
        },
      }),

      deleteMonth: tool({
        description: "Delete a monthly auction and all its associated payments",
        inputSchema: z.object({
          month_id: z.string().describe("The month ID to delete"),
        }),
        execute: async ({ month_id }) => {
          await supabase.from("payments").delete().eq("month_id", month_id);
          const { error } = await supabase
            .from("months")
            .delete()
            .eq("id", month_id);
          if (error) return { error: error.message };
          return { success: true };
        },
      }),

      deletePayment: tool({
        description: "Delete a specific payment entry",
        inputSchema: z.object({
          payment_id: z.string().describe("The payment ID to delete"),
        }),
        execute: async ({ payment_id }) => {
          const { error } = await supabase
            .from("payments")
            .delete()
            .eq("id", payment_id);
          if (error) return { error: error.message };
          return { success: true };
        },
      }),
    },

    stopWhen: stepCountIs(10),
  });

  return result.toUIMessageStreamResponse();
}
