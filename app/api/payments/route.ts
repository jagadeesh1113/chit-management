/* eslint-disable @typescript-eslint/no-explicit-any */
import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const supabase = await createClient();

    const { members, auction_user, amountPerMember, chit_id, month_id } =
      await req.json();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    const payments = members.map((memberObj: any) => {
      return {
        member_id: memberObj?.id,
        amount: amountPerMember,
        payment_status: memberObj?.id === auction_user ? true : false,
        chit_id,
        month_id,
        created_by: user?.id,
      };
    });

    // Store chunk with embedding in database
    const { error, data } = await supabase.from("payments").insert(payments);

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

    const { payment_id, payment_status } = await req.json();

    // Store chunk with embedding in database
    const { error, data } = await supabase
      .from("payments")
      .update({
        payment_status,
      })
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

export async function GET(req: Request) {
  try {
    const reqUrl = new URL(req.url);
    const monthId = reqUrl.searchParams.get("monthId");

    if (!monthId) {
      return NextResponse.json(
        { error: "Month Id not available" },
        { status: 404 },
      );
    }

    const supabase = await createClient();

    const { data: results, error } = await supabase.rpc(
      "get_chit_payments_v10",
      {
        selected_month_id: monthId,
      },
    );

    console.log("Error details", error);

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
