import React from "react";
import { Box, Container, Typography } from "@mui/material";

export default function Footer() {
  return (
    <Box
      component="footer"
      sx={{
        py: 2,
        mt: "auto",
        backgroundColor: "primary.main",
        color: "white",
      }}
    >
      <Container maxWidth="lg">
        <Typography variant="body2" align="center">
          © {new Date().getFullYear()} MiERP. Todos los derechos reservados.
        </Typography>
      </Container>
    </Box>
  );
}
