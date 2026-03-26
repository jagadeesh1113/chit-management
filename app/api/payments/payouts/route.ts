/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

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

    const { data: results, error } = await supabase.rpc("get_chit_payouts_v4", {
      selected_month_id: monthId,
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
      payouts: results,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to get payouts",
      },
      { status: 500 },
    );
  }
}
