/* eslint-disable @typescript-eslint/no-explicit-any */
import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const supabase = await createClient();

    const formDataDetails = await req.formData();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    // Store chunk with embedding in database
    const { error, data } = await supabase
      .from("months")
      .insert({
        name: formDataDetails.get("name"),
        auction_date: formDataDetails.get("auction_date"),
        auction_amount: formDataDetails.get("auction_amount"),
        auction_user: formDataDetails.get("auction_user"),
        created_by: user?.id,
        chit_id: formDataDetails.get("chit_id"),
      })
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
        error: error.message || "Failed to add member to chit",
      },
      { status: 500 },
    );
  }
}

export async function PUT(req: Request) {
  try {
    const supabase = await createClient();
    const { id, name, auction_date } = await req.json();

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Month id is required" },
        { status: 400 },
      );
    }

    const { error, data } = await supabase
      .from("months")
      .update({ name, auction_date })
      .eq("id", id)
      .select();

    if (error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 },
      );
    }

    return NextResponse.json({ success: true, values: data });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to update month" },
      { status: 500 },
    );
  }
}

export async function DELETE(req: Request) {
  try {
    const supabase = await createClient();
    const { id } = await req.json();

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Month id is required" },
        { status: 400 },
      );
    }

    // delete payments before deleting months
    const { error: paymentError } = await supabase
      .from("payments")
      .delete()
      .eq("month_id", id);

    const { error } = await supabase.from("months").delete().eq("id", id);

    if (error || paymentError) {
      return NextResponse.json(
        { success: false, error: error?.message ?? paymentError?.message },
        { status: 500 },
      );
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to delete month" },
      { status: 500 },
    );
  }
}

export async function GET(req: Request) {
  try {
    const reqUrl = new URL(req.url);
    const chitId = reqUrl.searchParams.get("chitId");

    if (!chitId) {
      return NextResponse.json(
        { error: "Chit Id not available" },
        { status: 404 },
      );
    }

    const supabase = await createClient();

    const { data, error } = await supabase.rpc("get_chit_months_v17", {
      selected_chit_id: chitId,
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
      months: data,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to get members",
      },
      { status: 500 },
    );
  }
}
