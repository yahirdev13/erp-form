// src/components/sections/PartnersSection.js
"use client";

import Image from "next/image";
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Stack,
  Button,
} from "@mui/material";
import HandshakeIcon from "@mui/icons-material/Handshake";
import VerifiedUserIcon from "@mui/icons-material/VerifiedUser";
import SchoolIcon from "@mui/icons-material/School";
import HeadsetMicIcon from "@mui/icons-material/HeadsetMic";
import StarIcon from "@mui/icons-material/Star";
import SettingsIcon from "@mui/icons-material/Settings";
import { useTheme } from "@mui/material/styles";

export default function PartnersSection() {
  const theme = useTheme();
  const primary = theme.palette.primary.main;
  const secondary = theme.palette.secondary.main;
  const grey = theme.palette.grey[500];
  const textPrimary = theme.palette.text.primary;
  return (
    <Box
      component="section"
      sx={{
        background: "#fff",
        py: { xs: 10, md: 14 },
        borderRadius: 0,
        boxShadow: "none",
      }}
    >
      <Container maxWidth="lg">
        {/* Cabecera */}
        <Stack alignItems="center" spacing={2} mb={5}>
          <Box
            sx={{
              p: 2.5,
              background: primary,
              borderRadius: "50%",
              color: "#fff",
              boxShadow: `0 4px 16px 0 ${primary}22`,
            }}
          >
            <HandshakeIcon sx={{ fontSize: 40 }} />
          </Box>
          <Typography
            variant="h3"
            fontWeight={900}
            align="center"
            sx={{ letterSpacing: -1, color: textPrimary }}
          >
            Somos{" "}
            <Box
              component="span"
              sx={{ color: secondary, fontWeight: 900, display: "inline" }}
            >
              Partners Oficiales
            </Box>{" "}
            de Odoo
          </Typography>
          <Typography
            variant="subtitle1"
            sx={{ color: grey, maxWidth: 600, fontWeight: 400 }}
            align="center"
          >
            Somos partners certificados de Odoo, lo que nos permite ofrecerte
            las mejores soluciones y el soporte más completo para tu
            implementación ERP
          </Typography>
        </Stack>

        <Grid
          container
          spacing={4}
          alignItems="flex-start"
          justifyContent="center"
        >
          {/* Izquierda: tarjeta Odoo */}
          <Grid item xs={12} md={5}>
            <Card
              elevation={0}
              sx={{
                borderRadius: 4,
                position: "relative",
                overflow: "visible",
                background: "#fff",
                boxShadow: `0 4px 24px 0 ${primary}18`,
                p: 4,
                minHeight: 260,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Box
                sx={{
                  position: "relative",
                  width: 220,
                  height: 110,
                  mb: 2,
                }}
              >
                <Image
                  src="/odoo_partner.png"
                  alt="Odoo Ready Partner"
                  fill
                  style={{ objectFit: "contain" }}
                />
              </Box>
              <Box
                sx={{
                  position: "absolute",
                  top: -24,
                  right: -24,
                  background: secondary,
                  borderRadius: "50%",
                  width: 48,
                  height: 48,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: `0 2px 8px 0 ${secondary}22`,
                }}
              >
                <SettingsIcon sx={{ color: "#fff", fontSize: 28 }} />
              </Box>
            </Card>
            <Grid container spacing={2} sx={{ mt: 3 }}>
              <Grid item xs={6}>
                <Card
                  elevation={0}
                  sx={{
                    p: 3,
                    borderRadius: 3,
                    boxShadow: `0 2px 8px 0 ${primary}12`,
                    textAlign: "center",
                  }}
                >
                  <Typography
                    variant="h5"
                    fontWeight={900}
                    sx={{ color: primary }}
                  >
                    5+
                  </Typography>
                  <Typography variant="caption" sx={{ color: grey }}>
                    Años como Partner
                  </Typography>
                </Card>
              </Grid>
              <Grid item xs={6}>
                <Card
                  elevation={0}
                  sx={{
                    p: 3,
                    borderRadius: 3,
                    boxShadow: `0 2px 8px 0 ${secondary}12`,
                    textAlign: "center",
                  }}
                >
                  <Typography
                    variant="h5"
                    fontWeight={900}
                    sx={{ color: secondary }}
                  >
                    100+
                  </Typography>
                  <Typography variant="caption" sx={{ color: grey }}>
                    Implementaciones
                  </Typography>
                </Card>
              </Grid>
            </Grid>
          </Grid>

          {/* Derecha: cards de beneficios */}
          <Grid item xs={12} md={7}>
            <Typography
              variant="h5"
              fontWeight={700}
              sx={{ mb: 2, color: textPrimary }}
            >
              ¿Qué significa ser Partner de Odoo?
            </Typography>
            <Stack spacing={2}>
              <Card
                elevation={0}
                sx={{
                  p: 3,
                  borderRadius: 3,
                  boxShadow: `0 2px 8px 0 ${primary}12`,
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 2,
                }}
              >
                <VerifiedUserIcon
                  sx={{ color: primary, fontSize: 28, mt: 0.5 }}
                />
                <Box>
                  <Typography
                    variant="subtitle1"
                    fontWeight={700}
                    sx={{ color: primary }}
                  >
                    Certificación Oficial
                  </Typography>
                  <Typography variant="body2" sx={{ color: grey }}>
                    Contamos con la certificación y respaldo directo de Odoo
                    para garantizar implementaciones exitosas
                  </Typography>
                </Box>
              </Card>
              <Card
                elevation={0}
                sx={{
                  p: 3,
                  borderRadius: 3,
                  boxShadow: `0 2px 8px 0 ${secondary}12`,
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 2,
                }}
              >
                <SchoolIcon sx={{ color: secondary, fontSize: 28, mt: 0.5 }} />
                <Box>
                  <Typography
                    variant="subtitle1"
                    fontWeight={700}
                    sx={{ color: secondary }}
                  >
                    Formación Continua
                  </Typography>
                  <Typography variant="body2" sx={{ color: grey }}>
                    Nuestro equipo recibe formación constante en las últimas
                    actualizaciones y mejores prácticas
                  </Typography>
                </Box>
              </Card>
              <Card
                elevation={0}
                sx={{
                  p: 3,
                  borderRadius: 3,
                  boxShadow: `0 2px 8px 0 ${primary}12`,
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 2,
                }}
              >
                <HeadsetMicIcon
                  sx={{ color: primary, fontSize: 28, mt: 0.5 }}
                />
                <Box>
                  <Typography
                    variant="subtitle1"
                    fontWeight={700}
                    sx={{ color: primary }}
                  >
                    Soporte Especializado
                  </Typography>
                  <Typography variant="body2" sx={{ color: grey }}>
                    Acceso directo al soporte técnico de Odoo y resolución
                    prioritaria de incidencias
                  </Typography>
                </Box>
              </Card>
              <Card
                elevation={0}
                sx={{
                  p: 3,
                  borderRadius: 3,
                  boxShadow: `0 2px 8px 0 ${secondary}12`,
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 2,
                }}
              >
                <StarIcon sx={{ color: secondary, fontSize: 28, mt: 0.5 }} />
                <Box>
                  <Typography
                    variant="subtitle1"
                    fontWeight={700}
                    sx={{ color: secondary }}
                  >
                    Calidad Garantizada
                  </Typography>
                  <Typography variant="body2" sx={{ color: grey }}>
                    Cumplimos con los estándares de calidad más altos
                    establecidos por Odoo para sus partners
                  </Typography>
                </Box>
              </Card>
            </Stack>
            {/* Botón eliminado por solicitud */}
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}
