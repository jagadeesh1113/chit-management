/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";

async function sendWhatsappMessage({
  payment_reminder_recipient,
}: {
  payment_reminder_recipient: any;
}) {
  try {
    const sendMessageResponse = await fetch(
      "https://graph.facebook.com/v22.0/1044734202046881/messages",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.WHATSAPP_TOKEN}`,
        },
        body: JSON.stringify({
          messaging_product: "whatsapp",
          to: `91${payment_reminder_recipient?.mobile}`,
          type: "template",
          template: {
            name: "jaspers_market_order_confirmation_v1",
            language: { code: "en_US" },
            components: [
              {
                type: "body",
                parameters: [
                  { type: "text", text: payment_reminder_recipient?.name }, // Value for {{1}}
                  { type: "text", text: payment_reminder_recipient?.amount }, // Value for {{2}}
                  { type: "text", text: "Friday" }, // Value for {{3}}
                ],
              },
            ],
          },
        }),
      },
    );

    const data = await sendMessageResponse.json();

    return data;
  } catch (error: any) {
    return error;
  }
}

export async function POST(req: Request) {
  const { payment_reminder_recipients } = await req.json();

  try {
    const messagePromises = payment_reminder_recipients.map(
      (payment_reminder_obj: any) =>
        sendWhatsappMessage({
          payment_reminder_recipient: payment_reminder_obj,
        }),
    );

    const data = await Promise.all(messagePromises);

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
