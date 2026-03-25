import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface NotificationEmailRequest {
  to_email: string;
  to_name: string;
  notification_type: "match" | "message" | "like";
  from_name: string;
  message_preview?: string;
}

const getEmailContent = (type: string, fromName: string, toName: string, messagePreview?: string) => {
  switch (type) {
    case "match":
      return {
        subject: `💕 It's a Match! You matched with ${fromName}`,
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background-color: #fdf8f8;">
            <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
              <div style="background: linear-gradient(135deg, #e8d4d4 0%, #d4c4b0 100%); border-radius: 20px; padding: 40px; text-align: center;">
                <div style="font-size: 60px; margin-bottom: 20px;">💕</div>
                <h1 style="color: #1a1a1a; font-size: 28px; margin: 0 0 10px 0;">It's a Match!</h1>
                <p style="color: #666; font-size: 16px; margin: 0 0 30px 0;">
                  Hi ${toName}, you and <strong>${fromName}</strong> have liked each other!
                </p>
                <a href="https://jainjodi.com/chat" style="display: inline-block; background-color: #1a1a1a; color: white; padding: 14px 32px; text-decoration: none; border-radius: 30px; font-weight: 600;">
                  Start Chatting
                </a>
              </div>
              <p style="text-align: center; color: #999; font-size: 12px; margin-top: 30px;">
                Jain Jodi - Designed to be deleted 💕
              </p>
            </div>
          </body>
          </html>
        `,
      };
    case "message":
      return {
        subject: `💬 New message from ${fromName}`,
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background-color: #fdf8f8;">
            <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
              <div style="background: white; border-radius: 20px; padding: 40px; box-shadow: 0 4px 20px rgba(0,0,0,0.08);">
                <div style="font-size: 40px; margin-bottom: 20px;">💬</div>
                <h1 style="color: #1a1a1a; font-size: 24px; margin: 0 0 10px 0;">New Message</h1>
                <p style="color: #666; font-size: 16px; margin: 0 0 20px 0;">
                  Hi ${toName}, <strong>${fromName}</strong> sent you a message:
                </p>
                <div style="background: #f5f5f5; border-radius: 12px; padding: 16px; margin-bottom: 30px;">
                  <p style="color: #333; font-size: 15px; margin: 0; font-style: italic;">
                    "${messagePreview || 'Sent you a message'}"
                  </p>
                </div>
                <a href="https://jainjodi.com/chat" style="display: inline-block; background-color: #1a1a1a; color: white; padding: 14px 32px; text-decoration: none; border-radius: 30px; font-weight: 600;">
                  Reply Now
                </a>
              </div>
              <p style="text-align: center; color: #999; font-size: 12px; margin-top: 30px;">
                Jain Jodi - Designed to be deleted 💕
              </p>
            </div>
          </body>
          </html>
        `,
      };
    case "like":
      return {
        subject: `❤️ ${fromName} liked your profile!`,
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background-color: #fdf8f8;">
            <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
              <div style="background: linear-gradient(135deg, #ffe4e6 0%, #fce7f3 100%); border-radius: 20px; padding: 40px; text-align: center;">
                <div style="font-size: 60px; margin-bottom: 20px;">❤️</div>
                <h1 style="color: #1a1a1a; font-size: 28px; margin: 0 0 10px 0;">Someone Likes You!</h1>
                <p style="color: #666; font-size: 16px; margin: 0 0 30px 0;">
                  Hi ${toName}, <strong>${fromName}</strong> liked your profile!
                </p>
                <a href="https://jainjodi.com/likes" style="display: inline-block; background-color: #1a1a1a; color: white; padding: 14px 32px; text-decoration: none; border-radius: 30px; font-weight: 600;">
                  View Profile
                </a>
              </div>
              <p style="text-align: center; color: #999; font-size: 12px; margin-top: 30px;">
                Jain Jodi - Designed to be deleted 💕
              </p>
            </div>
          </body>
          </html>
        `,
      };
    default:
      return {
        subject: "Notification from Jain Jodi",
        html: `<p>You have a new notification on Jain Jodi.</p>`,
      };
  }
};

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

  if (!RESEND_API_KEY) {
    console.error("RESEND_API_KEY is not configured");
    return new Response(
      JSON.stringify({ error: "Email service not configured" }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }

  try {
    const { to_email, to_name, notification_type, from_name, message_preview }: NotificationEmailRequest = await req.json();

    if (!to_email || !notification_type || !from_name) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const { subject, html } = getEmailContent(notification_type, from_name, to_name, message_preview);

    const emailResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "Jain Jodi <notifications@resend.dev>",
        to: [to_email],
        subject,
        html,
      }),
    });

    const result = await emailResponse.json();

    if (!emailResponse.ok) {
      console.error("Resend API error:", result);
      return new Response(
        JSON.stringify({ error: result.message || "Failed to send email" }),
        { status: emailResponse.status, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    console.log("Email sent successfully:", result);

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error sending notification email:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
