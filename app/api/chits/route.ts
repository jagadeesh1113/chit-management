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

    const { error, data } = await supabase
      .from("chits")
      .insert({
        user_id: user?.id,
        name: formDataDetails.get("name"),
        amount: formDataDetails.get("amount"),
        members: formDataDetails.get("noOfMembers"),
        months: formDataDetails.get("noOfAuctions"),
        charges: formDataDetails.get("charges"),
        start_date: formDataDetails.get("startDate"),
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
        error: error.message || "Failed to create chit",
      },
      { status: 500 },
    );
  }
}

export async function PUT(req: Request) {
  try {
    const supabase = await createClient();

    const formDataDetails = await req.formData();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    const { error, data } = await supabase
      .from("chits")
      .update({
        user_id: user?.id,
        name: formDataDetails.get("name"),
        amount: formDataDetails.get("amount"),
        members: formDataDetails.get("noOfMembers"),
        months: formDataDetails.get("noOfAuctions"),
        charges: formDataDetails.get("charges"),
        start_date: formDataDetails.get("startDate"),
      })
      .eq("id", formDataDetails.get("id"));

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
        error: error.message || "Failed to update chit",
      },
      { status: 500 },
    );
  }
}

export async function DELETE(req: Request) {
  try {
    const supabase = await createClient();
    const { chit_id } = await req.json();

    const { error, data } = await supabase
      .from("chits")
      .update({
        deleted: true,
      })
      .eq("id", chit_id);

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
        error: error.message || "Failed to delete chit",
      },
      { status: 500 },
    );
  }
}

export async function GET() {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    const { data, error } = await supabase.rpc("get_chit_v1", {
      selected_user_id: user?.id,
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
      chits: data,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to get chits",
      },
      { status: 500 },
    );
  }
}
