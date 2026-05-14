// =============================================================================
// TWILIO INBOUND SMS WEBHOOK — POST /api/webhooks/twilio
// Handles inbound SMS from tenants. Logs to communications table.
// Disabled at MVP — enable when Twilio is added in Month 3.
// =============================================================================
import { NextResponse, type NextRequest } from "next/server";

export async function POST(_request: NextRequest) {
  // TODO: Implement in Month 3 when Twilio SMS is enabled.
  // Steps:
  // 1. Parse Twilio form-encoded body (From, To, Body)
  // 2. Find org by the "To" Twilio number
  // 3. Find tenant by "From" phone number
  // 4. Insert into communications table (direction: inbound)
  // 5. Notify landlord of inbound message
  // 6. If message matches maintenance keywords, create a draft ticket
  // 7. Return TwiML response

  return new NextResponse(
    `<?xml version="1.0" encoding="UTF-8"?><Response></Response>`,
    { headers: { "Content-Type": "text/xml" } }
  );
}
