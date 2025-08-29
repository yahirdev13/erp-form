// app/api/sheets/append/route.js (o el path que uses)
export const runtime = "nodejs";

import { appendDiagnosisToSheet } from "../../../../src/api/sheets";

export async function POST(req) {
  try {
    const body = await req.json();
    const result = await appendDiagnosisToSheet(body);
    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
