// src/hooks/useMediaQuery.ts

import { useEffect, useState } from "react";

export function useBreakpoint() {
  const [breakpoint, setBreakpoint] = useState<"sm" | "md" | "lg" | "xl" | "2xl">("lg");

  useEffect(() => {
    const sm = window.matchMedia("(min-width: 640px)");
    const md = window.matchMedia("(min-width: 768px)");
    const lg = window.matchMedia("(min-width: 1024px)");
    const xl = window.matchMedia("(min-width: 1280px)");
    const xxl = window.matchMedia("(min-width: 1536px)");

    const update = () => {
      if (xxl.matches) setBreakpoint("2xl");
      else if (xl.matches) setBreakpoint("xl");
      else if (lg.matches) setBreakpoint("lg");
      else if (md.matches) setBreakpoint("md");
      else if (sm.matches) setBreakpoint("sm");
      else setBreakpoint("sm"); // Default to smallest for anything below 640px
    };

    update();

    sm.addEventListener("change", update);
    md.addEventListener("change", update);
    lg.addEventListener("change", update);
    xl.addEventListener("change", update);
    xxl.addEventListener("change", update);

    return () => {
      sm.removeEventListener("change", update);
      md.removeEventListener("change", update);
      lg.removeEventListener("change", update);
      xl.removeEventListener("change", update);
      xxl.removeEventListener("change", update);
    };
  }, []);

  return breakpoint;
}
