// app/page.js
import Typography from "@mui/material/Typography";

import HeroSection from "../src/components/sections/HeroSection";
import ParthersSection from "../src/components/sections/ParthersSection";
import ServicesSection from "@/src/components/sections/ServicesSections";

export default function Page() {
  return (
    <div style={{ textAlign: "center" }}>
      <HeroSection />

      <ParthersSection />
      <ServicesSection />
    </div>
  );
}
