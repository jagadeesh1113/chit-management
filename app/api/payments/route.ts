/* eslint-disable @typescript-eslint/no-explicit-any */
import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const supabase = await createClient();

    const {
      amount,
      chit_id,
      month_id,
      payment_date,
      member_id,
      payment_type,
      is_payout = false,
    } = await req.json();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    // Store chunk with embedding in database
    const { error, data } = await supabase.from("payments").insert({
      member_id,
      amount: amount,
      chit_id,
      month_id,
      created_by: user?.id,
      payment_date,
      payment_type,
      is_payout,
    });

    if (error) {
      return NextResponse.json(
        {
          success: false,
          error: error.message,
        },
        { status: 500 },
      );
    }

    return NextResponse.json({
      success: true,
      values: data,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to add payment to months",
      },
      { status: 500 },
    );
  }
}

export async function PUT(req: Request) {
  try {
    const supabase = await createClient();

    const { payment_id, payment_status, payment_date, payment_type, amount } =
      await req.json();

    const updatePayload: Record<string, any> = { payment_status };
    if (payment_date !== undefined) updatePayload.payment_date = payment_date;
    if (payment_type !== undefined) updatePayload.payment_type = payment_type;
    if (amount !== undefined) updatePayload.amount = amount;

    const { error, data } = await supabase
      .from("payments")
      .update(updatePayload)
      .eq("id", payment_id)
      .select();

    if (error) {
      return NextResponse.json(
        {
          success: false,
          error: error.message,
        },
        { status: 500 },
      );
    }

    return NextResponse.json({
      success: true,
      values: data,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to add payment to months",
      },
      { status: 500 },
    );
  }
}

export async function DELETE(req: Request) {
  try {
    const supabase = await createClient();
    const { payment_id } = await req.json();

    if (!payment_id) {
      return NextResponse.json(
        { success: false, error: "Payment id is required" },
        { status: 400 },
      );
    }

    const { error } = await supabase
      .from("payments")
      .delete()
      .eq("id", payment_id);

    if (error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 },
      );
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to delete payment" },
      { status: 500 },
    );
  }
}

export async function GET(req: Request) {
  try {
    const reqUrl = new URL(req.url);
    const monthId = reqUrl.searchParams.get("monthId");
    const chitId = reqUrl.searchParams.get("chitId");

    if (!monthId) {
      return NextResponse.json(
        { error: "Month Id not available" },
        { status: 404 },
      );
    }

    const supabase = await createClient();

    const { data: results, error } = await supabase.rpc(
      "get_chit_payments_v20",
      {
        selected_month_id: monthId,
        selected_chit_id: chitId,
      },
    );

    if (error) {
      return NextResponse.json(
        {
          success: false,
          error: error.message,
        },
        { status: 500 },
      );
    }

    return NextResponse.json({
      success: true,
      payments: results,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to get payments",
      },
      { status: 500 },
    );
  }
}
