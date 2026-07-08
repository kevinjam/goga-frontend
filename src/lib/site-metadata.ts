import type { Metadata } from "next";
import { branding } from "@/config/branding";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3001";

export function buildRootMetadata(): Metadata {
  const ogImage = `${siteUrl}${branding.social.imagePath}`;

  return {
    metadataBase: new URL(siteUrl),
    title: {
      default: branding.applicationName,
      template: `%s | ${branding.shortName}`
    },
    description: branding.description,
    applicationName: branding.shortName,
    authors: [{ name: branding.author }],
    publisher: branding.publisher,
    keywords: [...branding.keywords],
    themeColor: branding.themeColor,
    icons: {
      icon: [
        { url: branding.logo.src, type: "image/png" },
        { url: "/favicon.ico", sizes: "any" }
      ],
      apple: [{ url: "/apple-touch-icon.png", type: "image/png" }]
    },
    manifest: "/manifest.webmanifest",
    openGraph: {
      type: "website",
      locale: "en_UG",
      siteName: branding.social.title,
      title: branding.social.title,
      description: branding.social.description,
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: branding.logo.alt
        }
      ]
    },
    twitter: {
      card: "summary_large_image",
      title: branding.social.title,
      description: branding.social.description,
      images: [ogImage]
    }
  };
}
