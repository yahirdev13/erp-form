// app/layout.js
"use client";

import { CacheProvider } from "@emotion/react";
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";

import createEmotionCache from "../src/createEmotionCache";
import theme from "../src/theme";
import NavBar from "../src/components/NavBar";
import Footer from "../src/components/Footer";

const clientSideEmotionCache = createEmotionCache();

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <head>
        <meta name="viewport" content="initial-scale=1, width=device-width" />
      </head>
      <body>
        <CacheProvider value={clientSideEmotionCache}>
          <ThemeProvider theme={theme}>
            <CssBaseline />
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                minHeight: "100vh",
              }}
            >
              <NavBar />
              <main style={{ flex: 1, padding: "2rem" }}>{children}</main>
              <Footer />
            </div>
          </ThemeProvider>
        </CacheProvider>
      </body>
    </html>
  );
}
