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

    const { data, error } = await supabase.rpc("get_chit_months_v8", {
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
