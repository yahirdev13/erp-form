// src/utils/scoring.js

// Config por defecto (ajústala a tu gusto)
export const DEFAULT_SCORING = {
  weights: { general: 0.4, sector: 0.6 }, // ponderación global
  thresholds: { mature: 0.75, almost: 0.55 }, // 75% y 55%
  requireExplicitScores: true, // exige score en opciones
  fallbackScores: [
    // usado solo si requireExplicitScores === false
    { match: /sí|si/i, score: 5 },
    { match: /parcial|manual/i, score: 3 },
    { match: /no/i, score: 0 },
  ],
};

// -------- Helpers ----------
export const getMaxScoreFromOptions = (options = []) => {
  const withScores = options.filter(
    (o) => typeof o === "object" && typeof o.score === "number"
  );
  return withScores.length ? Math.max(...withScores.map((o) => o.score)) : 5;
};

export const getOptionScore = (
  answerValue,
  options = [],
  scoring = DEFAULT_SCORING
) => {
  const foundObj = options.find(
    (opt) =>
      typeof opt === "object" &&
      (opt.text === answerValue || opt.value === answerValue)
  );
  if (foundObj && typeof foundObj.score === "number") return foundObj.score;

  if (scoring.requireExplicitScores) {
    if (process.env.NODE_ENV !== "production") {
      console.warn(
        "[scoring] Falta 'score' explícito para opción:",
        answerValue
      );
    }
    return 0;
  }

  const asText = String(answerValue ?? "").trim();
  for (const rule of scoring.fallbackScores)
    if (rule.match.test(asText)) return rule.score;
  return 0;
};

const findGeneralRawByKey = (key, generalRAW = []) =>
  generalRAW.find((q) => q.id === key) ||
  generalRAW.find((q) => q.text === key) ||
  null;

// -------- Compute principal ----------
/**
 * @param {{
 *   generalQuestionsUI: Array<{key:string,text:string,options?:any[]}>,
 *   generalQuestionsRAW: Array<any>,
 *   generalAnswers: Record<string, string>,
 *   sectorQuestions: Array<any>,                 // string u objeto { text, options:[{text,score}], weight?, critical? }
 *   sectorAnswers: Record<string, string>,
 *   scoring?: typeof DEFAULT_SCORING
 * }} args
 */
export function computeScores({
  generalQuestionsUI = [],
  generalQuestionsRAW = [],
  generalAnswers = {},
  sectorQuestions = [],
  sectorAnswers = {},
  scoring = DEFAULT_SCORING,
}) {
  // ---- General ----
  let generalScore = 0,
    generalMax = 0,
    hasCriticalFailGeneral = false;
  const generalBreakdown = [];

  for (const qUI of generalQuestionsUI) {
    const raw = findGeneralRawByKey(qUI.key, generalQuestionsRAW);
    const optsForMax = raw?.options ?? qUI.options ?? ["Sí", "No"]; // para max
    const ans = generalAnswers[qUI.key];

    const gotBase = getOptionScore(ans, raw?.options ?? [], scoring);
    const maxBase = getMaxScoreFromOptions(optsForMax);
    const weight = raw?.weight ?? 1;

    const got = gotBase * weight;
    const max = maxBase * weight;

    if (raw?.critical) {
      const worst = Math.min(...(raw.options || []).map((o) => o.score ?? 0));
      if (gotBase <= worst) hasCriticalFailGeneral = true;
    }

    generalScore += got;
    generalMax += max;
    generalBreakdown.push({ label: qUI.text, got, max });
  }

  const pctGeneral = generalMax ? generalScore / generalMax : 0;

  // ---- Sector ----
  let sectorScore = 0,
    sectorMax = 0,
    hasCriticalFailSector = false;
  const sectorBreakdown = [];

  sectorQuestions.forEach((q, idx) => {
    const isString = typeof q === "string";
    const key = isString ? `s_${idx}` : q.key || q.id || `s_${idx}`;
    const label = isString ? q : q.text || q.pregunta || `Pregunta ${idx + 1}`;

    // Si la pregunta es string y exiges scores, creamos opciones explícitas por defecto
    const rawOptions = isString
      ? [
          { text: "Sí", score: 5 },
          { text: "No", score: 0 },
        ]
      : q.options || [];
    const ans = sectorAnswers[key];

    const gotBase = getOptionScore(ans, rawOptions, scoring);
    const maxBase = getMaxScoreFromOptions(rawOptions);
    const weight = isString ? 1 : q.weight ?? 1;

    const got = gotBase * weight;
    const max = maxBase * weight;

    if (!isString && q.critical) {
      const worst = Math.min(...rawOptions.map((o) => o.score ?? 0));
      if (gotBase <= worst) hasCriticalFailSector = true;
    }

    sectorScore += got;
    sectorMax += max;
    sectorBreakdown.push({ label, got, max });
  });

  const pctSector = sectorMax ? sectorScore / sectorMax : 0;

  // ---- Agregado ----
  const weighted =
    pctGeneral * (scoring.weights.general ?? 0.4) +
    pctSector * (scoring.weights.sector ?? 0.6);

  const hasCriticalFail = hasCriticalFailGeneral || hasCriticalFailSector;

  // Etiqueta final
  let maturity = { label: "Aún no", color: "error" };
  if (!hasCriticalFail && weighted >= (scoring.thresholds.mature ?? 0.75)) {
    maturity = { label: "Madura", color: "success" };
  } else if (
    !hasCriticalFail &&
    weighted >= (scoring.thresholds.almost ?? 0.55)
  ) {
    maturity = { label: "Casi lista", color: "warning" };
  }

  // Áreas débiles (top 4, ya ponderadas)
  const weakAreas = [...generalBreakdown, ...sectorBreakdown]
    .filter((b) => b.max > 0)
    .map((b) => ({ ...b, pct: b.got / b.max }))
    .sort((a, b) => a.pct - b.pct)
    .slice(0, 4);

  return {
    generalScore,
    generalMax,
    pctGeneral,
    sectorScore,
    sectorMax,
    pctSector,
    weighted,
    maturity,
    weakAreas,
    hasCriticalFail,
  };
}

// (Opcional) Validador para desarrollo
export function validateQuestions(questions = [], tag = "questions") {
  if (!Array.isArray(questions)) return;
  for (const q of questions) {
    if (typeof q === "string") continue;
    if (!Array.isArray(q.options)) {
      console.warn(
        `[validate] ${tag}: pregunta sin 'options' ->`,
        q?.text || q?.id
      );
      continue;
    }
    const missing = q.options.some(
      (o) => typeof o === "object" && typeof o.score !== "number"
    );
    if (missing)
      console.warn(
        `[validate] ${tag}: faltan 'score' en opciones ->`,
        q?.text || q?.id
      );
  }
}
app;
