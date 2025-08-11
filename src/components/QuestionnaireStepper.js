"use client";

import React, { useMemo, useRef, useState } from "react";
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

// Pasos actuales: 0 Datos generales, 1 Industria
const TOTAL_STEPS = 2;

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

export default function QuestionnaireStepper() {
  const [activeStep, setActiveStep] = useState(0);
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [direction, setDirection] = useState("left");
  const prevStepRef = useRef(activeStep);

  const handleChange = (field) => (e, valueFromAuto) => {
    const value =
      typeof valueFromAuto === "string" ? valueFromAuto : e?.target?.value ?? e;
    setForm((f) => ({ ...f, [field]: value }));
    setErrors((er) => ({ ...er, [field]: undefined }));
  };

  // Validación Paso 0
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

  // Validación Paso 1
  const validateStep1 = () => {
    const er = {};
    if (!form.industry) er.industry = "Selecciona la industria.";
    setErrors(er);
    return Object.keys(er).length === 0;
  };

  const handleNext = () => {
    if (activeStep === 0 && !validateStep0()) return;
    if (activeStep === 1 && !validateStep1()) return;
    if (activeStep < TOTAL_STEPS - 1) {
      setDirection("left");
      setActiveStep((s) => s + 1);
    }
  };

  const handleBack = () => {
    if (activeStep > 0) {
      setDirection("right");
      setActiveStep((s) => s - 1);
    }
  };

  const slideKey = useMemo(() => `step-${activeStep}`, [activeStep]);
  prevStepRef.current = activeStep;

  // ---------- UI PASO 0 (centrado como el de Industria) ----------
  const renderStep0 = () => (
    <Box sx={{ maxWidth: 880, mx: "auto" }}>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Typography variant="h5" fontWeight={700} align="center">
            Datos de la empresa
          </Typography>
          <Typography
            variant="body2"
            color="text.secondary"
            align="center"
            sx={{ mt: 0.5 }}
          >
            Completa los campos clave para entender el contexto de tu negocio.
          </Typography>
          <Divider sx={{ mt: 2 }} />
        </Grid>

        {/* Dos columnas equilibradas */}
        <Grid item xs={12} md={6}>
          <Grid container spacing={2.5}>
            <Grid item xs={12}>
              <TextField
                label="Nombre de la empresa"
                value={form.companyName}
                onChange={handleChange("companyName")}
                fullWidth
                error={!!errors.companyName}
                helperText={errors.companyName}
              />
            </Grid>
            <Grid item xs={12}>
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
            </Grid>
            <Grid item xs={12}>
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
            </Grid>
          </Grid>
        </Grid>

        <Grid item xs={12} md={6}>
          <Grid container spacing={2.5}>
            <Grid item xs={12}>
              <TextField
                label="Correo de contacto"
                value={form.contactEmail}
                onChange={handleChange("contactEmail")}
                fullWidth
                error={!!errors.contactEmail}
                helperText={errors.contactEmail}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Teléfono"
                type="tel"
                value={form.phone}
                onChange={handleChange("phone")}
                fullWidth
                error={!!errors.phone}
                helperText={errors.phone}
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl error={!!errors.priorErpUsage} component="fieldset">
                <Typography variant="subtitle2" sx={{ mb: 1 }}>
                  ¿Han utilizado un ERP previamente?
                </Typography>
                <RadioGroup
                  row
                  value={form.priorErpUsage}
                  onChange={handleChange("priorErpUsage")}
                >
                  <FormControlLabel value="no" control={<Radio />} label="No" />
                  <FormControlLabel value="si" control={<Radio />} label="Sí" />
                </RadioGroup>
                {!!errors.priorErpUsage && (
                  <FormHelperText>{errors.priorErpUsage}</FormHelperText>
                )}
              </FormControl>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </Box>
  );

  // ---------- UI PASO 1 (Industria) ----------
  const renderStep1 = () => (
    <Box sx={{ maxWidth: 880, mx: "auto" }}>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Typography variant="h5" fontWeight={700} align="center">
            Industria
          </Typography>
          <Typography
            variant="body2"
            color="text.secondary"
            align="center"
            sx={{ mt: 0.5 }}
          >
            Elegir correctamente tu industria nos permite adaptar el
            diagnóstico, priorizar módulos y proponer flujos acordes a tu
            operación (por ejemplo: inventarios en Manufactura, POS en Retail o
            e‑commerce B2C/B2B). Esto mejora la precisión de la evaluación y la
            calidad de las recomendaciones.
          </Typography>
          <Divider sx={{ mt: 2 }} />
        </Grid>

        <Grid item xs={12}>
          <Autocomplete
            options={industries}
            value={form.industry || null}
            onChange={(e, val) => handleChange("industry")(e, val ?? "")}
            clearOnEscape
            renderInput={(params) => (
              <TextField
                {...params}
                label="Selecciona o escribe tu industria"
                placeholder="Ej. Manufactura, Retail, Tecnología…"
                error={!!errors.industry}
                helperText={errors.industry}
                fullWidth
              />
            )}
          />
          <FormHelperText sx={{ mt: 1 }}>
            * Puedes empezar a escribir para buscar más rápido.
          </FormHelperText>
        </Grid>
      </Grid>
    </Box>
  );

  const renderStepContent = (step) => {
    switch (step) {
      case 0:
        return renderStep0();
      case 1:
        return renderStep1();
      default:
        return null;
    }
  };

  return (
    <Box sx={{ width: "100%" }}>
      <StepperWrapper activeStep={activeStep} />

      <Box sx={{ display: "flex", justifyContent: "center", mt: 5, px: 2 }}>
        <Card
          elevation={2}
          sx={{
            width: "100%",
            maxWidth: 980,
            borderRadius: 3,
            overflow: "hidden",
          }}
        >
          <CardContent sx={{ p: { xs: 3, md: 4 }, minHeight: 420 }}>
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
            <Button onClick={handleBack} disabled={activeStep === 0}>
              Atrás
            </Button>
            {activeStep < TOTAL_STEPS - 1 ? (
              <Button variant="contained" onClick={handleNext}>
                Siguiente
              </Button>
            ) : (
              <Button
                variant="contained"
                color="primary" // ← usa el color del tema (no verde)
                onClick={() => {
                  console.log("Formulario listo para enviar:", form);
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
