"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Slide from "@mui/material/Slide";
import Grid from "@mui/material/Grid";
import TextField from "@mui/material/TextField";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import FormHelperText from "@mui/material/FormHelperText";
import FormControlLabel from "@mui/material/FormControlLabel";
import Radio from "@mui/material/Radio";
import RadioGroup from "@mui/material/RadioGroup";
import Autocomplete from "@mui/material/Autocomplete";
import Divider from "@mui/material/Divider";
import LinearProgress from "@mui/material/LinearProgress";
import Chip from "@mui/material/Chip";
import Stack from "@mui/material/Stack";

import StepperWrapper from "./Stepper";

// 0 Datos generales, 1 Industria, 2 Transversal, 3 Sectorial, 4 Resultado
const TOTAL_STEPS = 5;

const initialForm = {
  companyName: "",
  companySize: "",
  contactEmail: "",
  phone: "",
  yearsInOperation: "",
  priorErpUsage: "no",
  industry: "",
};

const companySizes = [
  { value: "micro", label: "Micro (1-10)" },
  { value: "pequeña", label: "Pequeña (11-50)" },
  { value: "mediana", label: "Mediana (51-250)" },
  { value: "grande", label: "Grande (250+)" },
];

const industries = [
  "Manufactura",
  "Distribución y Logística",
  "Retail (Comercio Minorista)",
  "Comercio Electrónico",
  "Alimentación y Bebidas",
  "Hostelería y Turismo",
  "Salud y Farmacéutica",
  "Educación y Formación",
  "Construcción e Inmobiliario",
  "Automotriz",
  "Agricultura y Agroindustria",
  "Transporte y Movilidad",
  "Tecnología y Software",
  "Servicios Profesionales",
  "Finanzas y Seguros",
  "ONGs y Sector Social",
  "Energía",
];

// 3–5 preguntas generales (transversales)
import generalData from "../data/general.json";

// Conserva ambos: uno para UI (simplificado) y otro “raw” con los scores
const generalQuestionsUI = (generalData.questions || []).map((q) => ({
  key: q.id ?? q.text,
  text: q.text,
  // Para UI basta el texto. Si trae objetos, muestro el .text:
  options: (q.options || []).map((opt) =>
    typeof opt === "string" ? opt : opt.text
  ),
}));
const generalQuestionsRAW = generalData.questions || [];

// Carga estática de JSONs por sector (coloca los archivos en src/data/sectors/*.json)
const slugify = (s) =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/&/g, "y")
    .replace(/\s+/g, "_")
    .replace(/[^a-z0-9_]/g, "");

let sectorBundles = {};
try {
  const ctx = require.context("../data/sectors", false, /\.json$/);
  ctx.keys().forEach((k) => {
    const name = k.replace("./", "").replace(".json", "");
    const mod = ctx(k);
    sectorBundles[name] = mod.default || mod;
  });
} catch (e) {
  sectorBundles = {};
}

// Mapa de industrias a nombre de archivo esperado
const SECTOR_FILE_BY_INDUSTRY = {
  Manufactura: "manufactura",
  Automotriz: "automotriz",
  "Educación y Formación": "educacion",
  "Alimentación y Bebidas": "alimentacion",
  "Retail (Comercio Minorista)": "retail",
  "Comercio Electrónico": "ecommerce",
  "Distribución y Logística": "logistica",
  "Tecnología y Software": "tecnologia",
  "Construcción e Inmobiliario": "construccion",
  "Salud y Farmacéutica": "salud",
  "Transporte y Movilidad": "transporte",
  "Agricultura y Agroindustria": "agroindustria",
  "Hostelería y Turismo": "turismo",
  "Servicios Profesionales": "servicios_profesionales",
  "Finanzas y Seguros": "finanzas",
  "ONGs y Sector Social": "ongs",
  "Energía y Utilities": "energia",
};

// -------- Config de scoring (intenta cargar archivo, si no, usa defaults) -----
const DEFAULT_SCORING = {
  weights: { general: 0.4, sector: 0.6 }, // ponderación
  thresholds: { mature: 0.75, almost: 0.55 }, // 75% y 55%
  // Si no hay score en las opciones, se usa este mapeo heurístico:
  fallbackScores: [
    { match: /sí|si/i, score: 5 },
    { match: /parcial|manual/i, score: 3 },
    { match: /no/i, score: 0 },
  ],
};

let SCORING = DEFAULT_SCORING;
try {
  // Opcional: crea src/data/scoring.json para sobreescribir
  // { "weights": { "general": 0.5, "sector": 0.5 }, "thresholds": { "mature": 0.8, "almost": 0.6 } }
  // Nota: No rompas el build si no existe.
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const cfg = require("../data/scoring.json");
  SCORING = { ...DEFAULT_SCORING, ...cfg };
} catch (_e) {
  // usa defaults
}

// --------------- Helpers de scoring ----------------
const getOptionScore = (answerValue, options) => {
  if (!options || options.length === 0) return 0;
  // Si hay score explícito:
  const foundObj = options.find(
    (opt) =>
      typeof opt === "object" &&
      (opt.text === answerValue || opt.value === answerValue)
  );
  if (foundObj && typeof foundObj.score === "number") return foundObj.score;

  // Si son strings o no traen score: usa fallback
  const asText = String(answerValue ?? "").trim();
  for (const rule of SCORING.fallbackScores) {
    if (rule.match.test(asText)) return rule.score;
  }
  // Último recurso: asigna 0
  return 0;
};

const getMaxScoreFromOptions = (options) => {
  if (!options || options.length === 0) return 0;
  // Si hay scores explícitos
  const withScores = options.filter(
    (o) => typeof o === "object" && typeof o.score === "number"
  );
  if (withScores.length > 0) {
    return Math.max(...withScores.map((o) => o.score));
  }
  // Fallback: asume el máximo de la heurística es 5
  return 5;
};

const findGeneralRawByKey = (key) => {
  // Empareja por id o por texto
  return (
    generalQuestionsRAW.find((q) => q.id === key) ||
    generalQuestionsRAW.find((q) => q.text === key) ||
    null
  );
};

// --- Helper para pintar cada pregunta (UI) ---
function QuestionItem({ label, options, value, onChange, error }) {
  return (
    <Card elevation={3} sx={{ mb: 4, px: 3, py: 2, borderRadius: 3 }}>
      <FormControl component="fieldset" fullWidth error={!!error}>
        <Typography
          variant="subtitle2"
          sx={{
            mb: 2,
            textAlign: "left",
            fontSize: 17,
            fontWeight: 600,
            color: "primary.main",
          }}
        >
          {label}
        </Typography>
        <RadioGroup
          row
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          sx={{
            gap: 2,
            flexWrap: "wrap",
            alignItems: "center",
            justifyContent: "flex-start",
            mt: 1,
          }}
        >
          {options.map((opt, idx) => {
            if (typeof opt === "object" && opt !== null) {
              return (
                <FormControlLabel
                  key={opt.text || opt.value || idx}
                  value={opt.text || opt.value}
                  control={<Radio />}
                  label={
                    <Typography sx={{ fontSize: 16, fontWeight: 500 }}>
                      {opt.text || opt.value}
                    </Typography>
                  }
                  sx={{
                    mx: 1,
                    my: 0.5,
                    borderRadius: 2,
                    background: "#f7f7fa",
                    px: 2,
                  }}
                />
              );
            }
            return (
              <FormControlLabel
                key={opt}
                value={opt}
                control={<Radio />}
                label={
                  <Typography sx={{ fontSize: 16, fontWeight: 500 }}>
                    {opt}
                  </Typography>
                }
                sx={{
                  mx: 1,
                  my: 0.5,
                  borderRadius: 2,
                  background: "#f7f7fa",
                  px: 2,
                }}
              />
            );
          })}
        </RadioGroup>
        {!!error && <FormHelperText sx={{ mt: 1 }}>{error}</FormHelperText>}
      </FormControl>
    </Card>
  );
}

export default function QuestionnaireStepper() {
  const [activeStep, setActiveStep] = useState(0);
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [sectorQuestions, setSectorQuestions] = useState([]);
  const [sectorAnswers, setSectorAnswers] = useState({});
  const [generalAnswers, setGeneralAnswers] = useState({});
  const [sectorPage, setSectorPage] = useState(0);
  const [direction, setDirection] = useState("left");
  const prevStepRef = useRef(activeStep);

  const handleChange = (field) => (e, valueFromAuto) => {
    const value =
      typeof valueFromAuto === "string" ? valueFromAuto : e?.target?.value ?? e;
    setForm((f) => ({ ...f, [field]: value }));
    setErrors((er) => ({ ...er, [field]: undefined }));
  };

  const slideKey = useMemo(() => `step-${activeStep}`, [activeStep]);
  prevStepRef.current = activeStep;

  // Validaciones
  const validateStep0 = () => {
    const er = {};
    if (!form.companyName?.trim())
      er.companyName = "Escribe el nombre de la empresa.";
    if (!form.companySize)
      er.companySize = "Selecciona el tamaño de la empresa.";
    if (
      !form.contactEmail?.trim() ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.contactEmail)
    )
      er.contactEmail = "Escribe un correo de contacto válido.";
    if (!form.phone?.trim()) er.phone = "Escribe un teléfono de contacto.";
    if (
      !form.yearsInOperation?.toString().length ||
      isNaN(Number(form.yearsInOperation)) ||
      Number(form.yearsInOperation) < 0
    )
      er.yearsInOperation = "Indica los años en operación (0 si es nueva).";
    if (!form.priorErpUsage) er.priorErpUsage = "Selecciona una opción.";
    setErrors(er);
    return Object.keys(er).length === 0;
  };

  const validateStep1 = () => {
    const er = {};
    if (!form.industry) er.industry = "Selecciona la industria.";
    setErrors(er);
    return Object.keys(er).length === 0;
  };

  const validateStep2 = () => {
    const er = {};
    generalQuestionsUI.forEach((q) => {
      if (!generalAnswers[q.key]) er[`g_${q.key}`] = "Requerido.";
    });
    setErrors(er);
    return Object.keys(er).length === 0;
  };

  // Carga de preguntas sectoriales al entrar al paso 3
  useEffect(() => {
    if (activeStep !== 3) return;
    const base =
      SECTOR_FILE_BY_INDUSTRY[form.industry] || slugify(form.industry || "");
    const data = sectorBundles[base];
    if (!data) {
      setSectorQuestions([]);
      setSectorPage(0);
      return;
    }
    const list = Array.isArray(data)
      ? data
      : data?.preguntas || data?.questions || [];
    setSectorQuestions(list);
    setSectorPage(0);
  }, [activeStep, form.industry]);

  const validateStep3 = () => {
    const er = {};
    sectorQuestions.forEach((q, idx) => {
      const key = typeof q === "string" ? `s_${idx}` : q.key || `s_${idx}`;
      if (!sectorAnswers[key]) er[key] = "Requerido.";
    });
    setErrors(er);
    return Object.keys(er).length === 0;
  };

  const handleNext = () => {
    if (activeStep === 0 && !validateStep0()) return;
    if (activeStep === 1 && !validateStep1()) return;
    if (activeStep === 2 && !validateStep2()) return;
    if (activeStep === 3) {
      const pageSize = 5;
      const startIdx = sectorPage * pageSize;
      const endIdx = Math.min(startIdx + pageSize, sectorQuestions.length);
      const er = {};
      for (let idx = startIdx; idx < endIdx; idx++) {
        const q = sectorQuestions[idx];
        const key =
          typeof q === "string" ? `s_${idx}` : q.key || q.id || `s_${idx}`;
        if (!sectorAnswers[key]) er[key] = "Requerido.";
      }
      setErrors(er);
      if (Object.keys(er).length > 0) return;
      if (endIdx < sectorQuestions.length) {
        setSectorPage((p) => p + 1);
        return;
      }
      if (activeStep < TOTAL_STEPS - 1) {
        setDirection("left");
        setActiveStep((s) => s + 1);
      }
      return;
    }
    if (activeStep < TOTAL_STEPS - 1) {
      setDirection("left");
      setActiveStep((s) => s + 1);
    }
  };

  const handleBack = () => {
    if (activeStep === 3 && sectorPage > 0) {
      setSectorPage((p) => p - 1);
      return;
    }
    if (activeStep > 0) {
      setDirection("right");
      setActiveStep((s) => s - 1);
      if (activeStep === 3) setSectorPage(0);
    }
  };

  // ------------------- CÁLCULO DE PUNTAJES -------------------
  const computeScores = useMemo(() => {
    // General
    let generalScore = 0;
    let generalMax = 0;
    let generalBreakdown = []; // [{label, got, max}]
    for (const qUI of generalQuestionsUI) {
      const raw = findGeneralRawByKey(qUI.key);
      const opts = raw?.options ?? qUI.options ?? ["Sí", "No"];
      const ans = generalAnswers[qUI.key];
      const got = getOptionScore(ans, raw?.options ?? []);
      const max = getMaxScoreFromOptions(opts);
      generalScore += got;
      generalMax += max;
      generalBreakdown.push({ label: qUI.text, got, max });
    }

    // Sector
    let sectorScore = 0;
    let sectorMax = 0;
    let sectorBreakdown = [];
    sectorQuestions.forEach((q, idx) => {
      const isString = typeof q === "string";
      const key = isString ? `s_${idx}` : q.key || q.id || `s_${idx}`;
      const label = isString
        ? q
        : q.text || q.pregunta || `Pregunta ${idx + 1}`;
      const opts = isString ? ["Sí", "No"] : q.options || ["Sí", "No"];
      const ans = sectorAnswers[key];
      const got = getOptionScore(ans, q?.options ?? []);
      const max = getMaxScoreFromOptions(opts);
      sectorScore += got;
      sectorMax += max;
      sectorBreakdown.push({ label, got, max });
    });

    const pctGeneral = generalMax ? generalScore / generalMax : 0;
    const pctSector = sectorMax ? sectorScore / sectorMax : 0;

    const weighted =
      pctGeneral * (SCORING.weights.general ?? 0.4) +
      pctSector * (SCORING.weights.sector ?? 0.6);

    // Etiqueta de madurez
    let maturity = { label: "Aún no", color: "error" };
    if (weighted >= (SCORING.thresholds.mature ?? 0.75)) {
      maturity = { label: "Madura", color: "success" };
    } else if (weighted >= (SCORING.thresholds.almost ?? 0.55)) {
      maturity = { label: "Casi lista", color: "warning" };
    }

    // Detectar áreas débiles (Top 4 con menor % relativo)
    const allBreakdown = [...generalBreakdown, ...sectorBreakdown]
      .filter((b) => b.max > 0)
      .map((b) => ({ ...b, pct: b.got / b.max }))
      .sort((a, b) => a.pct - b.pct)
      .slice(0, 4);

    return {
      generalScore,
      generalMax,
      sectorScore,
      sectorMax,
      pctGeneral,
      pctSector,
      weighted,
      maturity,
      weakAreas: allBreakdown,
    };
  }, [generalAnswers, sectorAnswers, sectorQuestions]);

  // ------------------- UI: Pasos -------------------

  // Paso 0 — datos generales
  const renderStep0 = () => (
    <Box sx={{ maxWidth: 600, mx: "auto", mt: 2 }}>
      <Box sx={{ textAlign: "center", mb: 3 }}>
        <Typography variant="h5" fontWeight={700} align="center" sx={{ mb: 1 }}>
          Datos de la empresa
        </Typography>
        <Typography
          variant="body2"
          color="text.secondary"
          align="center"
          sx={{ mb: 2 }}
        >
          Completa los campos clave para entender el contexto de tu negocio.
        </Typography>
        <Divider sx={{ mb: 3 }} />
      </Box>
      <Box
        component="form"
        sx={{ display: "flex", flexDirection: "column", gap: 2 }}
      >
        <TextField
          label="Nombre de la empresa"
          value={form.companyName}
          onChange={handleChange("companyName")}
          fullWidth
          error={!!errors.companyName}
          helperText={errors.companyName}
        />
        <Box sx={{ display: "flex", gap: 2 }}>
          <FormControl fullWidth error={!!errors.companySize}>
            <InputLabel>Tamaño</InputLabel>
            <Select
              label="Tamaño"
              value={form.companySize}
              onChange={handleChange("companySize")}
            >
              {companySizes.map((opt) => (
                <MenuItem key={opt.value} value={opt.value}>
                  {opt.label}
                </MenuItem>
              ))}
            </Select>
            {!!errors.companySize && (
              <FormHelperText>{errors.companySize}</FormHelperText>
            )}
          </FormControl>
          <TextField
            label="Años en operación"
            type="number"
            inputProps={{ min: 0 }}
            value={form.yearsInOperation}
            onChange={handleChange("yearsInOperation")}
            fullWidth
            error={!!errors.yearsInOperation}
            helperText={errors.yearsInOperation}
          />
        </Box>
        <Box sx={{ display: "flex", gap: 2 }}>
          <TextField
            label="Correo de contacto"
            value={form.contactEmail}
            onChange={handleChange("contactEmail")}
            fullWidth
            error={!!errors.contactEmail}
            helperText={errors.contactEmail}
          />
          <TextField
            label="Teléfono"
            type="tel"
            value={form.phone}
            onChange={handleChange("phone")}
            fullWidth
            error={!!errors.phone}
            helperText={errors.phone}
          />
        </Box>
        <FormControl
          error={!!errors.priorErpUsage}
          component="fieldset"
          sx={{ mt: 2 }}
        >
          <Typography variant="subtitle2" sx={{ mb: 1 }}>
            ¿Han utilizado un ERP previamente?
          </Typography>
          <RadioGroup
            row
            value={form.priorErpUsage}
            onChange={handleChange("priorErpUsage")}
            sx={{ justifyContent: "center" }}
          >
            <FormControlLabel value="no" control={<Radio />} label="No" />
            <FormControlLabel value="si" control={<Radio />} label="Sí" />
          </RadioGroup>
          {!!errors.priorErpUsage && (
            <FormHelperText>{errors.priorErpUsage}</FormHelperText>
          )}
        </FormControl>
      </Box>
    </Box>
  );

  // Paso 1 — industria
  const renderStep1 = () => (
    <Box sx={{ maxWidth: 980, mx: "auto" }}>
      <Grid container spacing={3} justifyContent="center" alignItems="center">
        <Grid item xs={12}>
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <Typography variant="h5" fontWeight={700} align="center">
              Industria
            </Typography>
            <Typography
              variant="body2"
              color="text.secondary"
              align="center"
              sx={{ mt: 0.5 }}
            >
              <b>Selecciona correctamente la industria</b> para adaptar el
              diagnóstico, priorizar módulos y proponer flujos acordes a tu
              operación.
            </Typography>
            <Divider sx={{ mt: 2, width: "100%" }} />
          </Box>
        </Grid>

        <Grid item xs={12}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              width: "100%",
              mt: 2,
            }}
          >
            <Box
              sx={{
                width: { xs: "100%", md: "95%", lg: "90%", xl: "80%" },
                maxWidth: 700,
                mx: "auto",
              }}
            >
              <Autocomplete
                options={industries}
                value={form.industry || null}
                onChange={(e, val) => handleChange("industry")(e, val ?? "")}
                disablePortal
                clearOnEscape
                renderInput={(params) => (
                  <TextField
                    {...params}
                    fullWidth
                    label="Selecciona o escribe tu industria"
                    placeholder="Ej. Manufactura, Retail, Tecnología…"
                    error={!!errors.industry}
                    helperText={errors.industry}
                    sx={{
                      "& .MuiInputBase-root": { height: 60, fontSize: 16 },
                      fontSize: 18,
                      minWidth: 400,
                      maxWidth: 700,
                    }}
                  />
                )}
              />
              <FormHelperText sx={{ mt: 1 }}>
                * Puedes empezar a escribir para buscar más rápido.
              </FormHelperText>
            </Box>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );

  // Paso 2 — transversal
  const renderStep2 = () => (
    <Box sx={{ maxWidth: 700, mx: "auto", mt: 2 }}>
      <Box sx={{ textAlign: "center", mb: 3 }}>
        <Typography variant="h5" fontWeight={700} align="center" sx={{ mb: 1 }}>
          Cuestionario Transversal
        </Typography>
        <Typography
          variant="body2"
          color="text.secondary"
          align="center"
          sx={{ mb: 2 }}
        >
          Preguntas generales para evaluar la madurez de tu organización.
        </Typography>
        <Divider sx={{ mb: 3 }} />
      </Box>
      <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
        {generalQuestionsUI.map((q) => (
          <QuestionItem
            key={q.key}
            label={q.text}
            options={q.options}
            value={generalAnswers[q.key]}
            onChange={(val) =>
              setGeneralAnswers((prev) => ({ ...prev, [q.key]: val }))
            }
            error={errors[`g_${q.key}`]}
          />
        ))}
      </Box>
    </Box>
  );

  // Paso 3 — sectorial (paginado 5 en 5)
  const renderStep3 = () => {
    const pageSize = 5;
    const startIdx = sectorPage * pageSize;
    const endIdx = Math.min(startIdx + pageSize, sectorQuestions.length);
    const currentQuestions = sectorQuestions.slice(startIdx, endIdx);
    return (
      <Box sx={{ maxWidth: 700, mx: "auto", mt: 2 }}>
        <Box sx={{ textAlign: "center", mb: 3 }}>
          <Typography
            variant="h5"
            fontWeight={700}
            align="center"
            sx={{ mb: 1 }}
          >
            Cuestionario Sectorial
          </Typography>
          <Typography
            variant="body2"
            color="text.secondary"
            align="center"
            sx={{ mb: 2 }}
          >
            Preguntas específicas según la industria seleccionada.
          </Typography>
          <Divider sx={{ mb: 3 }} />
        </Box>
        {sectorQuestions.length === 0 ? (
          <Card variant="outlined" sx={{ p: 2 }}>
            <Typography align="center">
              No se encontró el archivo JSON del sector seleccionado. Agrega el
              archivo en <b>src/data/sectors/</b> con el nombre esperado y
              vuelve a intentar.
            </Typography>
          </Card>
        ) : (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
            {currentQuestions.map((q, idx) => {
              const globalIdx = startIdx + idx;
              const isString = typeof q === "string";
              const key = isString
                ? `s_${globalIdx}`
                : q.key || q.id || `s_${globalIdx}`;
              const label = isString
                ? q
                : q.text || q.pregunta || `Pregunta ${globalIdx + 1}`;
              const opts = isString ? ["Sí", "No"] : q.options || ["Sí", "No"];
              return (
                <QuestionItem
                  key={key}
                  label={label}
                  options={opts}
                  value={sectorAnswers[key]}
                  onChange={(val) =>
                    setSectorAnswers((prev) => ({ ...prev, [key]: val }))
                  }
                  error={errors[key]}
                />
              );
            })}
          </Box>
        )}
      </Box>
    );
  };

  // Paso 4 — resultado con barras y áreas débiles
  const renderStep4 = () => {
    const { pctGeneral, pctSector, weighted, maturity, weakAreas } =
      computeScores;

    const percent = (x) => Math.round(x * 100);

    const taglineByState = {
      success: "¡La empresa está lista para una implementación de Odoo!",
      warning:
        "La empresa está cerca: conviene preparar terreno en áreas clave.",
      error: "Aún no es el momento: prioriza mejoras básicas antes del ERP.",
    };

    return (
      <Box sx={{ maxWidth: 980, mx: "auto" }}>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Typography variant="h5" fontWeight={700} align="center">
              Resultado del Diagnóstico
            </Typography>
            <Divider sx={{ mt: 2, mb: 2 }} />
          </Grid>

          {/* Resumen y etiqueta */}
          <Grid item xs={12}>
            <Card variant="outlined" sx={{ p: 2.5 }}>
              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
                flexWrap="wrap"
                gap={2}
              >
                <Box>
                  <Typography variant="h6" fontWeight={700}>
                    Madurez para implementar Odoo:
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {taglineByState[maturity.color]}
                  </Typography>
                </Box>
                <Chip
                  label={`${maturity.label} • ${percent(weighted)}%`}
                  color={maturity.color}
                  sx={{ fontWeight: 700, fontSize: 16, px: 1.5, py: 0.5 }}
                />
              </Stack>

              <Box sx={{ mt: 3 }}>
                <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
                  Transversal ({percent(pctGeneral)}%)
                </Typography>
                <LinearProgress
                  variant="determinate"
                  value={percent(pctGeneral)}
                  sx={{ height: 10, borderRadius: 1 }}
                />
              </Box>

              <Box sx={{ mt: 2 }}>
                <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
                  Sectorial ({percent(pctSector)}%)
                </Typography>
                <LinearProgress
                  variant="determinate"
                  value={percent(pctSector)}
                  sx={{ height: 10, borderRadius: 1 }}
                />
              </Box>
            </Card>
          </Grid>

          {/* Áreas a fortalecer */}
          <Grid item xs={12}>
            <Card variant="outlined" sx={{ mt: 3 }}>
              <CardContent>
                <Typography fontWeight={700} sx={{ mb: 1 }}>
                  Áreas a fortalecer antes/durante la implementación
                </Typography>
                {weakAreas.length === 0 ? (
                  <Typography variant="body2">
                    Sin áreas críticas detectadas.
                  </Typography>
                ) : (
                  <Box
                    sx={{
                      display: "grid",
                      gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
                      gap: 1.5,
                    }}
                  >
                    {weakAreas.map((w, i) => (
                      <Card key={i} variant="outlined" sx={{ p: 1.5 }}>
                        <Typography variant="body2" sx={{ mb: 0.5 }}>
                          {w.label}
                        </Typography>
                        <LinearProgress
                          variant="determinate"
                          value={Math.round((w.got / w.max) * 100)}
                          sx={{ height: 8, borderRadius: 1 }}
                        />
                      </Card>
                    ))}
                  </Box>
                )}
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ display: "block", mt: 1 }}
                >
                  * Recomendación: si el estado es “Casi lista”, atiende primero
                  estas áreas y agenda plan de arranque.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    );
  };

  const renderStepContent = (step) => {
    if (step === 0) return renderStep0();
    if (step === 1) return renderStep1();
    if (step === 2) return renderStep2();
    if (step === 3) return renderStep3();
    if (step === 4) return renderStep4();
    return null;
  };

  return (
    <Box sx={{ width: "100%" }}>
      <StepperWrapper activeStep={activeStep} />

      <Box sx={{ display: "flex", justifyContent: "center", mt: 5, px: 2 }}>
        <Card
          elevation={2}
          sx={{
            width: "100%",
            maxWidth: 1040,
            borderRadius: 3,
            overflow: "hidden",
          }}
        >
          <CardContent sx={{ p: { xs: 3, md: 4 }, minHeight: 460 }}>
            <Slide
              key={slideKey}
              in
              direction={direction}
              mountOnEnter
              unmountOnExit
              appear
            >
              <Box>{renderStepContent(activeStep)}</Box>
            </Slide>
          </CardContent>

          <Divider />

          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              p: 2.5,
            }}
          >
            {activeStep === 0 ? (
              <Box />
            ) : (
              <Button onClick={handleBack}>Atrás</Button>
            )}

            {activeStep < TOTAL_STEPS - 1 ? (
              <Button variant="contained" onClick={handleNext}>
                Siguiente
              </Button>
            ) : (
              <Button
                variant="contained"
                color="primary"
                onClick={() => {
                  // Aquí ya puedes enviar al backend si quieres
                  console.log("Formulario listo para enviar:", {
                    form,
                    generalAnswers,
                    sectorAnswers,
                    scores: computeScores,
                  });
                }}
              >
                Finalizar
              </Button>
            )}
          </Box>
        </Card>
      </Box>
    </Box>
  );
}
