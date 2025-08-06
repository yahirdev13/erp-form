import React from "react";
import { Box, Container } from "@mui/material";
import NavBar from "./NavBar";
import Footer from "./Footer";

export default function Layout({ children }) {
  return (
    <Box display="flex" flexDirection="column" minHeight="100vh">
      <NavBar />

      {/* Aquí irá el contenido de cada página */}
      <Container component="main" sx={{ flexGrow: 1, py: 4 }} maxWidth="lg">
        {children}
      </Container>

      <Footer />
    </Box>
  );
}
