// src/theme.js
import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    primary: {
      main: "#714B67", // Purple (CTA)
    },
    secondary: {
      main: "#017E84", // Teal
    },
    grey: {
      500: "#8F8F8F", // Gray para links
    },
    text: {
      primary: "#333333", // Texto negro suave
    },
  },
  typography: {
    fontFamily: "Roboto, sans-serif",
    button: {
      textTransform: "none", // Que los botones no conviertan todo a mayúsculas
    },
  },
});

export default theme;
