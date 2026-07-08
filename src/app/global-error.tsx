"use client";

import { branding } from "@/config/branding";

export default function GlobalError({
  error,
  reset
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          fontFamily: "Arial, Helvetica, sans-serif",
          background: "#ffffff",
          color: "#111827"
        }}
      >
        <main
          style={{
            minHeight: "100vh",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: "16px",
            padding: "24px",
            textAlign: "center"
          }}
        >
          <img
            src={branding.logo.src}
            alt={branding.logo.alt}
            width={96}
            height={96}
            style={{ objectFit: "contain" }}
          />
          <div>
            <p style={{ margin: 0, color: "#6b7280", fontSize: "14px" }}>
              {branding.organization}
            </p>
            <h1 style={{ margin: "8px 0 0", fontSize: "24px" }}>
              Application Error
            </h1>
            <p style={{ margin: "8px 0 0", color: "#6b7280", fontSize: "14px" }}>
              {error.message || "A critical error occurred."}
            </p>
          </div>
          <button
            type="button"
            onClick={() => reset()}
            style={{
              minHeight: "40px",
              padding: "0 16px",
              borderRadius: "8px",
              border: "1px solid #d1d5db",
              background: "#ffffff",
              cursor: "pointer"
            }}
          >
            Try again
          </button>
          <p style={{ margin: 0, color: "#6b7280", fontSize: "12px" }}>
            {branding.footer.copyright(new Date().getFullYear())}
          </p>
        </main>
      </body>
    </html>
  );
}
