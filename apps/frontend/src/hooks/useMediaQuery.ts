// src/hooks/useMediaQuery.ts

import { useEffect, useState } from "react";

export function useBreakpoint() {
  const [breakpoint, setBreakpoint] = useState<"sm" | "md" | "lg">("lg");

  useEffect(() => {
    const sm = window.matchMedia("(max-width: 639px)");
    const md = window.matchMedia("(min-width: 768px)");

    const update = () => {
      if (sm.matches) setBreakpoint("sm");
      else if (md.matches) setBreakpoint("md");
      else setBreakpoint("lg");
    };

    update();

    sm.addEventListener("change", update);
    md.addEventListener("change", update);

    return () => {
      sm.removeEventListener("change", update);
      md.removeEventListener("change", update);
    };
  }, []);

  return breakpoint;
}
