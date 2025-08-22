// src/components/sections/HeroSection.js
"use client";

import Image from "next/image";
import {
  Box,
  Container,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  Stack,
} from "@mui/material";
import RocketLaunchIcon from "@mui/icons-material/RocketLaunch";
import PeopleIcon from "@mui/icons-material/People";
import AssessmentIcon from "@mui/icons-material/Assessment";

export default function HeroSection() {
  return (
    <Box
      component="section"
      sx={{
        backgroundColor: "#fff",
        py: { xs: 6, md: 12 },
      }}
    >
      <Container maxWidth="lg">
        {/* Primera fila: Título + subtítulo + botones */}
        <Grid container spacing={4}>
          <Grid item xs={12} sm={6}>
            <Typography variant="h3" fontWeight="bold" gutterBottom>
              Transformamos tu{" "}
              <Box component="span" color="primary.main">
                Empresa
              </Box>{" "}
              con{" "}
              <Box component="span" color="secondary.main">
                Odoo
              </Box>{" "}
              ERP
            </Typography>
            <Typography variant="subtitle1" color="text.secondary" paragraph>
              Especializados en integraciones de Odoo para empresas que buscan
              optimizar sus procesos y acelerar su crecimiento.
            </Typography>

            <Stack direction="row" spacing={2} sx={{ mb: 6 }}>
              <Button
                variant="contained"
                color="primary"
                size="large"
                href="/evaluacion-erp"
              >
                Evaluar Madurez ERP
              </Button>
              <Button
                variant="outlined"
                color="primary"
                size="large"
                href="/servicios"
              >
                Ver Servicios
              </Button>
            </Stack>
          </Grid>
        </Grid>

        {/* Segunda fila: Features a la izquierda + Logo a la derecha */}
        <Grid container spacing={4} alignItems="flex-end">
          {/* Features */}
          <Grid item xs={12} sm={6}>
            <Grid container spacing={2}>
              {[
                {
                  icon: (
                    <RocketLaunchIcon
                      sx={{ fontSize: 40, mb: 1 }}
                      color="primary"
                    />
                  ),
                  title: "Implementación Rápida",
                  subtitle: "Proyectos optimizados en tiempo récord",
                },
                {
                  icon: (
                    <PeopleIcon sx={{ fontSize: 40, mb: 1 }} color="primary" />
                  ),
                  title: "Equipo Experto",
                  subtitle: "Especialistas certificados en Odoo",
                },
                {
                  icon: (
                    <AssessmentIcon
                      sx={{ fontSize: 40, mb: 1 }}
                      color="primary"
                    />
                  ),
                  title: "ROI Garantizado",
                  subtitle: "Resultados medibles y sostenibles",
                },
              ].map((feat) => (
                <Grid key={feat.title} item xs={12} sm={4}>
                  <Card elevation={0} sx={{ textAlign: "center" }}>
                    <CardContent>
                      {feat.icon}
                      <Typography variant="h6">{feat.title}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {feat.subtitle}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Grid>

          {/* Logo */}
          <Grid item xs={12} sm={6} sx={{ textAlign: "center" }}>
            <Box
              sx={{
                display: "inline-block",
                position: "relative",
                p: 2,
                borderRadius: 2,
                boxShadow: 3,
                bgcolor: "#fff",
              }}
            >
              <Image
                src="/odoo_logo.png"
                alt="Odoo Logo"
                width={280}
                height={120}
              />
              <Box
                sx={{
                  position: "absolute",
                  bottom: -16,
                  right: -16,
                }}
              >
                <Card
                  elevation={4}
                  sx={{
                    py: 0.5,
                    px: 1.5,
                    borderRadius: 1,
                    display: "flex",
                    alignItems: "center",
                    bgcolor: "grey.50",
                  }}
                >
                  <Typography variant="subtitle2" fontWeight="bold">
                    98%
                  </Typography>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ ml: 0.5 }}
                  >
                    Satisfacción Cliente
                  </Typography>
                </Card>
              </Box>
            </Box>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}
