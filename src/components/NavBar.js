// src/components/NavBar.js
"use client";

import Image from "next/image";
import Link from "next/link";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import { useTheme } from "@mui/material/styles";

export default function NavBar() {
  const theme = useTheme();

  // Define aquí tus rutas y textos:
  const links = [{ label: "Servicios", href: "#servicios" }];

  return (
    <AppBar
      position="static"
      elevation={0}
      color="transparent"
      sx={{ backgroundColor: "#fff" }}
    >
      <Toolbar sx={{ justifyContent: "space-between" }}>
        {/* Logo + Nombre */}
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <Image
            src="/logo_tersoft.png" // Ajusta al path de tu logo
            alt="Tersoft"
            width={40}
            height={40}
          />
          <Typography
            variant="h6"
            sx={{
              ml: 1,
              color: theme.palette.text.primary,
              fontWeight: 700,
            }}
          >
            Tersoft
          </Typography>
        </Box>

        {/* Links de navegación y Botón CTA juntos */}
        <Box sx={{ display: "flex", alignItems: "center" }}>
          {links.map(({ label, href }) => (
            <Button
              key={href}
              component={Link}
              href={href}
              sx={{
                color: theme.palette.grey[500],
                mx: 1.5,
              }}
            >
              {label}
            </Button>
          ))}
          <Button
            variant="contained"
            color="primary"
            sx={{
              borderRadius: 2,
              px: 3,
              ml: 2,
            }}
            component={Link}
            href="#cuestionario"
          >
            Evaluar Madurez ERP
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
}
