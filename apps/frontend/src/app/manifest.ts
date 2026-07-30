// src/app/manifest.ts

import { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Sistema Proplanta Web",
    short_name: "Proplanta Web",
    description: "Sistema de gestión",
    start_url: "/",
    display: "standalone",
    background_color: "#fff",
    theme_color: "#fff",
    icons: [
      {
        src: "/proIcon.png",
        sizes: "512x512",
        type: "image/png",
      },
      {
        src: "/proIcon.png",
        sizes: "192x192",
        type: "image/png",
      },
    ],
  };
}
