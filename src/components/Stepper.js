"use client";

import React from "react";
import PropTypes from "prop-types";
import { styled } from "@mui/material/styles";
import Stepper from "@mui/material/Stepper";
import Step from "@mui/material/Step";
import StepLabel from "@mui/material/StepLabel";
import StepConnector, {
  stepConnectorClasses,
} from "@mui/material/StepConnector";

import BusinessIcon from "@mui/icons-material/Business";
import CategoryIcon from "@mui/icons-material/Category";
import QuizIcon from "@mui/icons-material/Quiz";
import DomainIcon from "@mui/icons-material/Domain";
import AssessmentIcon from "@mui/icons-material/Assessment";

// Conector sólido con colores del theme
const SolidConnector = styled(StepConnector)(({ theme }) => ({
  // Centrar la línea en el medio del icono (40px alto)
  [`&.${stepConnectorClasses.alternativeLabel}`]: {
    top: 20,
  },
  [`& .${stepConnectorClasses.line}`]: {
    height: 3,
    border: 0,
    backgroundColor: theme.palette.grey[500],
    borderRadius: 1,
  },
  [`&.${stepConnectorClasses.active} .${stepConnectorClasses.line}`]: {
    backgroundColor: theme.palette.primary.main,
  },
  [`&.${stepConnectorClasses.completed} .${stepConnectorClasses.line}`]: {
    backgroundColor: theme.palette.primary.main,
  },
}));

// Icono de paso sólido
const SolidStepIconRoot = styled("div")(({ theme, ownerState }) => ({
  backgroundColor: theme.palette.grey[500],
  zIndex: 1,
  color: "#fff",
  width: 40,
  height: 40,
  display: "flex",
  borderRadius: "50%",
  justifyContent: "center",
  alignItems: "center",
  ...(ownerState.active && {
    backgroundColor: theme.palette.primary.main,
    boxShadow: theme.shadows[4],
  }),
  ...(ownerState.completed && {
    backgroundColor: theme.palette.primary.main,
  }),
}));

function SolidStepIcon(props) {
  const { active, completed, className, icon } = props;
  const icons = {
    1: <BusinessIcon />, // Datos Generales
    2: <CategoryIcon />, // Categoría de negocio
    3: <QuizIcon />, // Cuestionario Transversal
    4: <DomainIcon />, // Cuestionario Sectorial
    5: <AssessmentIcon />, // Resultados y Recomendaciones
  };

  return (
    <SolidStepIconRoot ownerState={{ active, completed }} className={className}>
      {icons[String(icon)]}
    </SolidStepIconRoot>
  );
}

SolidStepIcon.propTypes = {
  active: PropTypes.bool,
  className: PropTypes.string,
  completed: PropTypes.bool,
  icon: PropTypes.node,
};

// Pasos del Stepper
const steps = [
  "Datos Generales",
  "Categoría de negocio",
  "Cuestionario Transversal",
  "Cuestionario Sectorial",
  "Resultado",
];

function StepperWrapper({ activeStep }) {
  return (
    <Stepper
      alternativeLabel
      activeStep={activeStep}
      connector={<SolidConnector />}
      sx={{ py: 3 }}
    >
      {steps.map((label) => (
        <Step key={label}>
          <StepLabel StepIconComponent={SolidStepIcon}>{label}</StepLabel>
        </Step>
      ))}
    </Stepper>
  );
}

StepperWrapper.propTypes = {
  activeStep: PropTypes.number.isRequired,
};

export default StepperWrapper;
