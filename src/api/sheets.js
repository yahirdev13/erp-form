// src/api/sheets.js
import { google } from "googleapis";

const SCOPES = ["https://www.googleapis.com/auth/spreadsheets"];

/**
 * Autenticación:
 * 1) Preferente: GOOGLE_CREDENTIALS_B64 = JSON del service account en base64
 * 2) Fallback: GS_CLIENT_EMAIL/GS_PRIVATE_KEY o GOOGLE_SERVICE_ACCOUNT_EMAIL/GOOGLE_SERVICE_ACCOUNT_KEY
 */
function getAuth() {
  const b64 = process.env.GOOGLE_CREDENTIALS_B64;

  if (b64) {
    try {
      const credsJson = Buffer.from(b64, "base64").toString("utf8");
      const creds = JSON.parse(credsJson);

      if (!creds.client_email || !creds.private_key) {
        throw new Error("JSON inválido: falta client_email o private_key");
      }

      return new google.auth.JWT({
        email: creds.client_email,
        key: creds.private_key,
        scopes: SCOPES,
      });
    } catch (e) {
      throw new Error(`GOOGLE_CREDENTIALS_B64 inválido: ${e.message || e}`);
    }
  }

  // Fallback por compatibilidad
  const email =
    process.env.GS_CLIENT_EMAIL || process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;

  const rawKey =
    process.env.GS_PRIVATE_KEY || process.env.GOOGLE_SERVICE_ACCOUNT_KEY || "";

  // Soporta claves con "\n" escapados
  const key = rawKey.replace(/\\n/g, "\n");

  if (!email || !key) {
    throw new Error(
      "Faltan credenciales: usa GOOGLE_CREDENTIALS_B64 o bien GS_CLIENT_EMAIL/GS_PRIVATE_KEY (o GOOGLE_SERVICE_ACCOUNT_EMAIL/GOOGLE_SERVICE_ACCOUNT_KEY)"
    );
  }

  return new google.auth.JWT({ email, key, scopes: SCOPES });
}

function headersBase() {
  return [
    "Timestamp",
    "Empresa",
    "Tamaño",
    "Industria",
    "Correo",
    "Teléfono",
    "Años en operación",
    "¿Usó ERP antes?",
    "% Transversal",
    "% Sectorial",
    "% Ponderado",
    "Estado de madurez",
    "Áreas débiles",
  ];
}

async function ensureBaseHeaders(sheets, spreadsheetId, sheetName) {
  const expected = headersBase();

  const read = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: `${sheetName}!1:1`,
  });

  const current = read.data.values?.[0] || [];
  const needUpdate =
    current.length === 0 ||
    current.length < expected.length ||
    expected.some((h, i) => current[i] !== h);

  if (needUpdate) {
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: `${sheetName}!A1`,
      valueInputOption: "RAW",
      requestBody: { values: [expected] },
    });
  }
}

/**
 * payload esperado:
 * {
 *   form: {
 *     companyName, companySize, industry, contactEmail, phone,
 *     yearsInOperation, priorErpUsage
 *   },
 *   scores: {
 *     pctGeneral, pctSector, weighted, maturity: { label }, weakAreas: [...]
 *   }
 * }
 * -> NO guardamos respuestas.
 */
export async function appendDiagnosisToSheet(payload = {}) {
  const { form = {}, scores = {} } = payload;

  const spreadsheetId =
    process.env.GS_SHEET_ID || process.env.SHEETS_SPREADSHEET_ID;
  const sheetName =
    process.env.GS_SHEET_NAME || process.env.SHEETS_TAB_NAME || "Respuestas";

  if (!spreadsheetId)
    throw new Error("Falta GS_SHEET_ID o SHEETS_SPREADSHEET_ID");

  const auth = getAuth();
  const sheets = google.sheets({ version: "v4", auth });

  // Asegurar encabezados
  await ensureBaseHeaders(sheets, spreadsheetId, sheetName);

  // Texto de áreas débiles
  const weak =
    (scores.weakAreas || [])
      .map((w) => `${w.label} (${Math.round((w.got / w.max) * 100)}%)`)
      .join(" | ") || "";

  // Fila sin respuestas
  const values = [
    new Date().toISOString(), // Timestamp
    form.companyName || "", // Empresa
    form.companySize || "", // Tamaño
    form.industry || "", // Industria
    form.contactEmail || "", // Correo
    form.phone || "", // Teléfono
    form.yearsInOperation ?? "", // Años en operación
    form.priorErpUsage || "", // ¿Usó ERP antes?
    Math.round((scores.pctGeneral || 0) * 100), // % Transversal
    Math.round((scores.pctSector || 0) * 100), // % Sectorial
    Math.round((scores.weighted || 0) * 100), // % Ponderado
    scores?.maturity?.label || "", // Estado de madurez
    weak, // Áreas débiles
  ];

  await sheets.spreadsheets.values.append({
    spreadsheetId,
    range: `${sheetName}!A1`,
    valueInputOption: "RAW",
    insertDataOption: "INSERT_ROWS",
    requestBody: { values: [values] },
  });

  return { ok: true };
}
