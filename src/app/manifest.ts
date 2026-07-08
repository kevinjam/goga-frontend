import type { MetadataRoute } from "next";
import { branding } from "@/config/branding";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: branding.pwa.name,
    short_name: branding.pwa.shortName,
    description: branding.pwa.description,
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: branding.themeColor,
    icons: [
      {
        src: branding.logo.src,
        sizes: "512x512",
        type: "image/png",
        purpose: "any"
      },
      {
        src: branding.logo.src,
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable"
      }
    ]
  };
}
