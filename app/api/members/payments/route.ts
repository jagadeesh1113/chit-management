/* eslint-disable @typescript-eslint/no-explicit-any */
import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

// GET /api/members/payments?memberId=xxx&chitId=xxx
// Returns every month for the chit, with this member's payment entries for each.
export async function GET(req: Request) {
  try {
    const reqUrl = new URL(req.url);
    const memberId = reqUrl.searchParams.get("memberId");
    const chitId = reqUrl.searchParams.get("chitId");

    if (!memberId || !chitId) {
      return NextResponse.json(
        { error: "memberId and chitId are required" },
        { status: 400 },
      );
    }

    const supabase = await createClient();

    const { data, error } = await supabase.rpc("get_members_payments_v3", {
      selected_member_id: memberId,
      selected_chit_id: chitId,
    });

    if (error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 },
      );
    }

    return NextResponse.json({ success: true, months: data });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to fetch member payments",
      },
      { status: 500 },
    );
  }
}
