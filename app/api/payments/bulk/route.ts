/* eslint-disable @typescript-eslint/no-explicit-any */
import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const supabase = await createClient();

    const { payments } = await req.json();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    const paymentsDataWithUser = payments?.map((paymentObj: any) => {
      return {
        ...paymentObj,
        created_by: user?.id,
      };
    });

    // Store chunk with embedding in database
    const { error, data } = await supabase
      .from("payments")
      .insert(paymentsDataWithUser);

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
    const { member_id, chit_id, month_id } = await req.json();

    if (!member_id || !chit_id || !month_id) {
      return NextResponse.json(
        {
          success: false,
          error: "member, chit and month details are required",
        },
        { status: 400 },
      );
    }

    const { error } = await supabase
      .from("payments")
      .delete()
      .eq("chit_id", chit_id)
      .eq("member_id", member_id)
      .eq("month_id", month_id);

    if (error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 },
      );
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to delete member payments",
      },
      { status: 500 },
    );
  }
}
