// src/components/sections/ServicesSections.js
"use client";

import React from "react";
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  Stack,
  Button,
} from "@mui/material";
import CheckIcon from "@mui/icons-material/CheckCircle";
import BuildIcon from "@mui/icons-material/Build";
import IntegrationInstructionsIcon from "@mui/icons-material/IntegrationInstructions";
import SupportAgentIcon from "@mui/icons-material/SupportAgent";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import CodeIcon from "@mui/icons-material/Code";
import SecurityIcon from "@mui/icons-material/Security";
import { useTheme } from "@mui/material/styles";

const services = [
  {
    title: "Implementación Completa",
    icon: <BuildIcon fontSize="large" />,
    description:
      "Instalación, configuración y personalización completa de Odoo ERP adaptada a las necesidades específicas de tu empresa.",
    bullets: [
      "Análisis de procesos",
      "Configuración personalizada",
      "Migración de datos",
    ],
  },
  {
    title: "Integraciones Avanzadas",
    icon: <IntegrationInstructionsIcon fontSize="large" />,
    description:
      "Conectamos Odoo con tus sistemas existentes para crear un ecosistema tecnológico unificado y eficiente.",
    bullets: [
      "APIs personalizadas",
      "Sincronización de datos",
      "Terceros sistemas",
    ],
  },
  {
    title: "Capacitación & Soporte",
    icon: <SupportAgentIcon fontSize="large" />,
    description:
      "Formación integral para tu equipo y soporte técnico continuo para garantizar el éxito de tu implementación.",
    bullets: [
      "Entrenamiento personalizado",
      "Soporte 24/7",
      "Documentación completa",
    ],
  },
  {
    title: "Optimización Continua",
    icon: <TrendingUpIcon fontSize="large" />,
    description:
      "Monitoreo y mejora constante de tu sistema ERP para maximizar la eficiencia y el retorno de inversión.",
    bullets: [
      "Análisis de rendimiento",
      "Actualizaciones regulares",
      "Reportes detallados",
    ],
  },
  {
    title: "Desarrollo Custom",
    icon: <CodeIcon fontSize="large" />,
    description:
      "Módulos y funcionalidades personalizadas para cubrir las necesidades específicas que requiere tu industria.",
    bullets: [
      "Módulos específicos",
      "Workflows personalizados",
      "Interfaz adaptada",
    ],
  },
  {
    title: "Seguridad & Respaldo",
    icon: <SecurityIcon fontSize="large" />,
    description:
      "Implementación de protocolos de seguridad avanzados y sistemas de respaldo para proteger tu información crítica.",
    bullets: ["Cifrado avanzado", "Backups automáticos", "Acceso controlado"],
  },
];

export default function ServicesSections() {
  const theme = useTheme();
  const primary = theme.palette.primary.main;
  const secondary = theme.palette.secondary.main;
  const grey = theme.palette.grey[500];
  const textPrimary = theme.palette.text.primary;

  return (
    <Box sx={{ background: "#fff", py: { xs: 8, md: 12 } }}>
      <Container maxWidth="lg">
        {/* Título */}
        <Typography
          variant="h3"
          align="center"
          fontWeight={900}
          sx={{ mb: 1, color: textPrimary }}
        >
          Nuestros{" "}
          <Box component="span" sx={{ color: secondary }}>
            Servicios
          </Box>
        </Typography>
        <Typography
          variant="subtitle1"
          align="center"
          sx={{ mb: 6, color: grey, maxWidth: 700, mx: "auto" }}
        >
          Ofrecemos soluciones integrales de Odoo ERP diseñadas para transformar
          y optimizar cada aspecto de tu negocio
        </Typography>

        {/* Grid de 6 cards: 3 columnas x 2 filas */}
        <Grid
          container
          spacing={4}
          sx={{ mb: 7, justifyContent: "center", maxWidth: 1200, mx: "auto" }}
        >
          {services.map((service, idx) => (
            <Grid
              item
              xs={12}
              sm={6}
              md={4}
              key={service.title}
              display="flex"
              sx={{
                display: "flex",
                alignItems: "stretch",
                justifyContent: "center",
                minWidth: 0,
              }}
            >
              <Card
                elevation={3}
                sx={{
                  borderRadius: 3,
                  p: 3,
                  minHeight: 320,
                  maxWidth: 360,
                  width: "100%",
                  display: "flex",
                  flexDirection: "column",
                  gap: 2,
                  boxShadow: "0 4px 24px rgba(60,60,120,0.08)",
                  background: "#fff",
                  flex: 1,
                  alignItems: "flex-start",
                }}
              >
                <Box
                  sx={{
                    background: idx % 2 === 0 ? primary : secondary,
                    color: "#fff",
                    width: 48,
                    height: 48,
                    borderRadius: 2,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    mb: 2,
                  }}
                >
                  {service.icon}
                </Box>
                <Typography
                  variant="h6"
                  fontWeight={700}
                  sx={{
                    color: textPrimary,
                    width: "100%",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {service.title}
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    color: grey,
                    mb: 1,
                    width: "100%",
                    display: "-webkit-box",
                    WebkitLineClamp: 3,
                    WebkitBoxOrient: "vertical",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {service.description}
                </Typography>
                <Stack spacing={0.5} sx={{ width: "100%" }}>
                  {service.bullets.map((b) => (
                    <Box
                      key={b}
                      sx={{ display: "flex", alignItems: "center", gap: 1 }}
                    >
                      <CheckIcon
                        sx={{
                          color: idx % 2 === 0 ? primary : secondary,
                          fontSize: 18,
                        }}
                      />
                      <Typography
                        variant="body2"
                        sx={{
                          color: textPrimary,
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                      >
                        {b}
                      </Typography>
                    </Box>
                  ))}
                </Stack>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Call to action */}
        <Box
          sx={{
            borderRadius: 3,
            p: { xs: 4, md: 5 },
            boxShadow: `0 4px 24px rgba(${secondary}22)`,
            textAlign: "center",
            color: textPrimary,
            maxWidth: 900,
            mx: "auto",
            mt: 2,
          }}
        >
          <Typography variant="h5" fontWeight={900} sx={{ mb: 1 }}>
            ¿Listo para transformar tu empresa?
          </Typography>
          <Typography variant="subtitle1" sx={{ mb: 3, color: grey }}>
            Descubre si tu organización está preparada para una implementación
            exitosa de Odoo ERP
          </Typography>
          <Button
            variant="contained"
            size="large"
            sx={{
              background: secondary,
              color: "#fff",
              fontWeight: 700,
              borderRadius: 2,
              px: 4,
              py: 1.5,
              fontSize: 18,
              boxShadow: `0 2px 8px rgba(${secondary}22)`,
              textTransform: "none",
              "&:hover": { background: primary },
            }}
          >
            Evaluar Madurez ERP Ahora
          </Button>
        </Box>
      </Container>
    </Box>
  );
}
