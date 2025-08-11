"use client";

import React, { useState } from "react";
import PropTypes from "prop-types";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Slide from "@mui/material/Slide";

import StepperWrapper from "./Stepper";

export default function QuestionnaireStepper() {
  const [activeStep, setActiveStep] = useState(0);

  const handleNext = () => {
    if (activeStep < 4) setActiveStep((prev) => prev + 1);
  };

  const renderStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Box sx={{ display: "grid", gap: 2 }}>
            <Typography variant="h6">Datos de la empresa</Typography>
            {/* Reemplaza con tus TextFields */}
            <Typography>
              Formulario para capturar nombre, ubicación y tamaño.
            </Typography>
          </Box>
        );
      case 1:
        return (
          <Box sx={{ display: "grid", gap: 2 }}>
            <Typography variant="h6">Categoría de negocio</Typography>
            <Typography>
              Selecciona el sector y entiende por qué es importante para tu ERP.
            </Typography>
          </Box>
        );
      case 2:
        return (
          <Box sx={{ display: "grid", gap: 2 }}>
            <Typography variant="h6">Cuestionario Transversal</Typography>
            <Typography>
              Aquí van las preguntas generales a todos los sectores.
            </Typography>
          </Box>
        );
      case 3:
        return (
          <Box sx={{ display: "grid", gap: 2 }}>
            <Typography variant="h6">Cuestionario Sectorial</Typography>
            <Typography>
              Preguntas específicas para el sector elegido.
            </Typography>
          </Box>
        );
      case 4:
        return (
          <Box sx={{ display: "grid", gap: 2 }}>
            <Typography variant="h6">Resultados y Recomendaciones</Typography>
            <Typography>
              Presenta el score y sugerencias para tu implementación ERP.
            </Typography>
          </Box>
        );
      default:
        return null;
    }
  };

  return (
    <Box sx={{ width: "100%" }}>
      <StepperWrapper activeStep={activeStep} />

      <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
        <Card sx={{ width: "600px", position: "relative", overflow: "hidden" }}>
          <CardContent sx={{ minHeight: "200px", position: "relative" }}>
            {renderStepContent(activeStep)}
          </CardContent>

          <Button
            variant="contained"
            onClick={handleNext}
            sx={{ position: "absolute", bottom: 16, right: 16 }}
          >
            Siguiente
          </Button>
        </Card>
      </Box>
    </Box>
  );
}

QuestionnaireStepper.propTypes = {};
