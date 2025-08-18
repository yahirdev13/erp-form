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
  "Energía y Utilities",
];

// 3–5 preguntas generales (transversales)
const generalQuestions = [
  {
    key: "processDocs",
    text: "¿Tienen documentados los procesos clave (ventas, compras, inventario, contabilidad)?",
    options: ["Sí", "Parcialmente", "No"],
  },
  {
    key: "projectLead",
    text: "¿Existe un responsable interno para liderar la implementación y la gestión del cambio?",
    options: ["Sí", "No"],
  },
  {
    key: "dataQuality",
    text: "¿La información (clientes, proveedores, productos, inventario) está centralizada y actualizada?",
    options: ["Sí", "Parcialmente", "No"],
  },
  {
    key: "budget",
    text: "¿Cuentan con presupuesto mínimo de $35,000 MXN para la fase inicial de implementación?",
    options: ["Sí", "No"],
  },
  {
    key: "willingnessChange",
    text: "¿Qué tanto están dispuestos a adaptar procesos a mejores prácticas del ERP?",
    options: ["Alto", "Medio", "Bajo"],
  },
];

// Carga estática de JSONs por sector (coloca los archivos en src/data/sectores/*.json)
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

// --- Helper para pintar cada pregunta del paso 2 con layout uniforme ---
function QuestionItem({ label, options, value, onChange, error }) {
  return (
    <Box sx={{ mb: 4, px: 2 }}>
      <FormControl component="fieldset" fullWidth error={!!error}>
        <Typography
          variant="subtitle2"
          sx={{ mb: 2, textAlign: "center", fontSize: 17 }}
        >
          {label}
        </Typography>
        <Box sx={{ display: "flex", justifyContent: "center", gap: 4 }}>
          <RadioGroup
            row
            value={value || ""}
            onChange={(e) => onChange(e.target.value)}
            sx={{ gap: 4 }}
          >
            {options.map((opt, idx) => {
              // Si la opción es un objeto, usar opt.text o opt.value como key y value
              if (typeof opt === "object" && opt !== null) {
                return (
                  <FormControlLabel
                    key={opt.text || opt.value || idx}
                    value={opt.text || opt.value}
                    control={<Radio />}
                    label={
                      <Typography sx={{ fontSize: 16 }}>
                        {opt.text || opt.value}
                      </Typography>
                    }
                    sx={{ mx: 2 }}
                  />
                );
              }
              // Si es string, usar el string como key y value
              return (
                <FormControlLabel
                  key={opt}
                  value={opt}
                  control={<Radio />}
                  label={<Typography sx={{ fontSize: 16 }}>{opt}</Typography>}
                  sx={{ mx: 2 }}
                />
              );
            })}
          </RadioGroup>
        </Box>
        {!!error && <FormHelperText>{error}</FormHelperText>}
      </FormControl>
    </Box>
  );
}

export default function QuestionnaireStepper() {
  const [activeStep, setActiveStep] = useState(0);
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [direction, setDirection] = useState("left");
  const [generalAnswers, setGeneralAnswers] = useState({});
  const [sectorQuestions, setSectorQuestions] = useState([]);
  const [sectorAnswers, setSectorAnswers] = useState({});
  const [sectorPage, setSectorPage] = useState(0); // For paginating sectorial questions
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
    generalQuestions.forEach((q) => {
      if (!generalAnswers[q.key]) er[`g_${q.key}`] = "Requerido.";
    });
    setErrors(er);
    return Object.keys(er).length === 0;
  };

  const validateStep3 = () => {
    const er = {};
    sectorQuestions.forEach((q, idx) => {
      const key = typeof q === "string" ? `s_${idx}` : q.key || `s_${idx}`;
      if (!sectorAnswers[key]) er[key] = "Requerido.";
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
    setSectorPage(0); // Reset to first page when loading new questions
  }, [activeStep, form.industry]);

  const handleNext = () => {
    if (activeStep === 0 && !validateStep0()) return;
    if (activeStep === 1 && !validateStep1()) return;
    if (activeStep === 2 && !validateStep2()) return;
    // Custom sectorial pagination logic
    if (activeStep === 3) {
      // Validate only visible questions
      const startIdx = sectorPage * 5;
      const endIdx = Math.min(startIdx + 5, sectorQuestions.length);
      const er = {};
      for (let idx = startIdx; idx < endIdx; idx++) {
        const q = sectorQuestions[idx];
        const key =
          typeof q === "string" ? `s_${idx}` : q.key || q.id || `s_${idx}`;
        if (!sectorAnswers[key]) er[key] = "Requerido.";
      }
      setErrors(er);
      if (Object.keys(er).length > 0) return;
      // If more pages, go to next page, else stay (do not advance to results)
      if (endIdx < sectorQuestions.length) {
        setSectorPage((p) => p + 1);
        return;
      }
      // If last page, do not advance to results, just stay
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
    }
  };

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

  // Paso 1 — industria (campo grande y centrado)
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
              <b>Es importante seleccionar correctamente la industria</b> para
              adaptar el diagnóstico, priorizar módulos y proponer flujos
              acordes a tu operación (por ejemplo: inventarios en Manufactura,
              POS en Retail o e‑commerce B2C/B2B). Esto mejora la precisión de
              la evaluación y la calidad de las recomendaciones.
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
                width: {
                  xs: "100%",
                  sm: "100%",
                  md: "95%",
                  lg: "90%",
                  xl: "80%",
                },
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

  // Paso 2 — alineación corregida (dos columnas fijas)
  const renderStep2 = () => {
    return (
      <Box sx={{ maxWidth: 700, mx: "auto", mt: 2 }}>
        <Box sx={{ textAlign: "center", mb: 3 }}>
          <Typography
            variant="h5"
            fontWeight={700}
            align="center"
            sx={{ mb: 1 }}
          >
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
          {generalQuestions.map((q) => (
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
  };

  // Paso 3 — preguntas sectoriales desde JSON
  const renderStep3 = () => {
    const pageSize = 5;
    const startIdx = sectorPage * pageSize;
    const endIdx = Math.min(startIdx + pageSize, sectorQuestions.length);
    const currentQuestions = sectorQuestions.slice(startIdx, endIdx);
    return (
      <Box sx={{ maxWidth: 700, mx: "auto", mt: 2 }}>
        <Box sx={{ mb: 3 }}>
          <Typography variant="h5" fontWeight={700} align="left" sx={{ mb: 1 }}>
            Cuestionario Sectorial
          </Typography>
          <Typography
            variant="body2"
            color="text.secondary"
            align="left"
            sx={{ mb: 2 }}
          >
            Preguntas específicas del sector seleccionadas según tu industria.
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
                <FormControl
                  key={key}
                  component="fieldset"
                  fullWidth
                  error={!!errors[key]}
                  sx={{ alignItems: "flex-start" }}
                >
                  <Typography
                    variant="subtitle2"
                    sx={{ mb: 1.5, textAlign: "left", fontSize: 17 }}
                  >
                    {label}
                  </Typography>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "flex-start",
                      gap: 4,
                    }}
                  >
                    <RadioGroup
                      row
                      value={sectorAnswers[key] || ""}
                      onChange={(e) =>
                        setSectorAnswers((prev) => ({
                          ...prev,
                          [key]: e.target.value,
                        }))
                      }
                      sx={{ gap: 4 }}
                    >
                      {opts.map((opt, oidx) => {
                        if (typeof opt === "object" && opt !== null) {
                          return (
                            <FormControlLabel
                              key={opt.text || opt.value || oidx}
                              value={opt.text || opt.value}
                              control={<Radio />}
                              label={
                                <Typography sx={{ fontSize: 16 }}>
                                  {opt.text || opt.value}
                                </Typography>
                              }
                              sx={{ mx: 2 }}
                            />
                          );
                        }
                        return (
                          <FormControlLabel
                            key={opt}
                            value={opt}
                            control={<Radio />}
                            label={
                              <Typography sx={{ fontSize: 16 }}>
                                {opt}
                              </Typography>
                            }
                            sx={{ mx: 2 }}
                          />
                        );
                      })}
                    </RadioGroup>
                  </Box>
                  {!!errors[key] && (
                    <FormHelperText>{errors[key]}</FormHelperText>
                  )}
                </FormControl>
              );
            })}
            <Box
              sx={{ display: "flex", justifyContent: "space-between", mt: 4 }}
            >
              <Button
                disabled={sectorPage === 0}
                onClick={handleBack}
                variant="outlined"
              >
                Atrás
              </Button>
              <Button variant="contained" onClick={handleNext}>
                {endIdx < sectorQuestions.length ? "Siguiente" : "Finalizar"}
              </Button>
            </Box>
          </Box>
        )}
      </Box>
    );
  };

  // Paso 4 — resultado (borrador)
  const renderStep4 = () => (
    <Box sx={{ maxWidth: 980, mx: "auto" }}>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <Typography variant="h5" fontWeight={700} align="center">
            Resultado (borrador)
          </Typography>
          <Divider sx={{ mt: 2, mb: 2 }} />
        </Grid>
        <Grid item xs={12} md={6}>
          <Card variant="outlined">
            <CardContent>
              <Typography fontWeight={600} sx={{ mb: 1 }}>
                Datos generales
              </Typography>
              <Typography variant="body2">
                Empresa: <b>{form.companyName || "—"}</b>
              </Typography>
              <Typography variant="body2">
                Tamaño: <b>{form.companySize || "—"}</b>
              </Typography>
              <Typography variant="body2">
                Años en operación: <b>{form.yearsInOperation || "—"}</b>
              </Typography>
              <Typography variant="body2">
                ERP previo: <b>{form.priorErpUsage === "si" ? "Sí" : "No"}</b>
              </Typography>
              <Typography variant="body2">
                Industria: <b>{form.industry || "—"}</b>
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card variant="outlined">
            <CardContent>
              <Typography fontWeight={600} sx={{ mb: 1 }}>
                Respuestas transversales
              </Typography>
              {generalQuestions.map((q) => (
                <Typography key={q.key} variant="body2">
                  {q.text} — <b>{generalAnswers[q.key] || "—"}</b>
                </Typography>
              ))}
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12}>
          <Card variant="outlined" sx={{ mt: 3 }}>
            <CardContent>
              <Typography fontWeight={600} sx={{ mb: 1 }}>
                Respuestas sectoriales
              </Typography>
              {(() => {
                // Obtener preguntas sectoriales del JSON según industria
                const base =
                  SECTOR_FILE_BY_INDUSTRY[form.industry] ||
                  slugify(form.industry || "");
                const sectorData = sectorBundles[base];
                const sectorList = Array.isArray(sectorData)
                  ? sectorData
                  : sectorData?.preguntas || sectorData?.questions || [];
                return sectorList.length > 0 ? (
                  sectorList.map((q, idx) => {
                    // Si el formato es objeto con opciones tipo objeto
                    const key = q.key || q.id || `s_${idx}`;
                    const label = q.text || q.pregunta || `Pregunta ${idx + 1}`;
                    let answer = sectorAnswers[key] || "—";
                    // Si las opciones son objetos, mostrar el texto
                    if (
                      Array.isArray(q.options) &&
                      typeof q.options[0] === "object"
                    ) {
                      const found = q.options.find(
                        (opt) => opt.text === answer || opt.value === answer
                      );
                      answer = found ? found.text : answer;
                    }
                    return (
                      <Typography key={key} variant="body2" sx={{ mb: 1 }}>
                        {label} — <b>{answer}</b>
                      </Typography>
                    );
                  })
                ) : (
                  <Typography variant="body2">
                    No hay preguntas sectoriales para esta industria.
                  </Typography>
                );
              })()}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );

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
                  console.log("Formulario listo para enviar:", {
                    form,
                    generalAnswers,
                    sectorAnswers,
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
