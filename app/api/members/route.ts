/* eslint-disable @typescript-eslint/no-explicit-any */
import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const supabase = await createClient();

    const { members, chit_id, owner } = await req.json();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    // const owner = formDataDetails.get("owner") as string;

    const membersToBeAdded = members?.map(
      (memberObj: { name: string; mobile: string }) => {
        return {
          name: memberObj?.name,
          mobile: memberObj?.mobile,
          created_by: user?.id,
          chit_id,
          owner: owner ?? false,
        };
      },
    );

    // Store chunk with embedding in database
    const { error, data } = await supabase
      .from("members")
      .insert(membersToBeAdded);

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
        error: error.message || "Failed to add members to chit",
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

    const { data, error } = await supabase.rpc("get_chit_members_v3", {
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
      members: data,
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
