"use client";

import { useState } from "react";
import { KiboLogo, KiboArrow } from "@/components/KiboBrand";

export default function AccesoPage() {
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<"idle" | "checking" | "error">("idle");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("checking");
    const res = await fetch("/api/acceso", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    }).catch(() => null);
    if (res?.ok) {
      window.location.href = "/";
    } else {
      setStatus("error");
    }
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "var(--bg-sunk, #F2F2F9)",
        fontFamily: 'Pacaembu, "Space Grotesk", "Inter", sans-serif',
        padding: "24px 16px",
      }}
    >
      <div
        style={{
          maxWidth: 420,
          width: "100%",
          padding: "38px 34px",
          background: "#FFFFFF",
          borderRadius: 18,
          border: "1px solid rgba(0, 0, 48, 0.08)",
          boxShadow: "0 18px 48px rgba(0, 0, 48, 0.09), 0 2px 6px rgba(0, 0, 48, 0.04)",
        }}
      >
        <div style={{ marginBottom: 26, display: "flex", flexDirection: "column", gap: 14 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div
              style={{
                width: 38,
                height: 38,
                borderRadius: 10,
                background: "var(--accent, #EF3A47)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 4px 12px rgba(239, 58, 71, 0.3)",
              }}
            >
              <KiboArrow size={20} color="#FFFFFF" />
            </div>
            <KiboLogo width={140} color="var(--text, #000030)" />
          </div>
          <div>
            <h1
              style={{
                fontSize: 22,
                fontWeight: 700,
                color: "var(--text, #000030)",
                margin: "4px 0 6px",
                letterSpacing: "-0.015em",
              }}
            >
              Portal de Founders
            </h1>
            <p style={{ color: "var(--text-light, rgba(0, 0, 48, 0.65))", fontSize: 13.5, lineHeight: 1.55, margin: 0 }}>
              Introduce la contraseña de acceso para entrar.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <label htmlFor="password" style={{ fontSize: 12.5, fontWeight: 600, color: "var(--text, #000030)" }}>
            Contraseña
          </label>
          <input
            id="password"
            type="password"
            required
            autoFocus
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{
              padding: "11px 14px",
              borderRadius: 9,
              border: "1px solid rgba(0, 0, 48, 0.16)",
              fontSize: 14,
              color: "var(--text, #000030)",
              background: "#FAFAFD",
              outline: "none",
              fontFamily: "inherit",
            }}
          />
          <button
            type="submit"
            disabled={status === "checking"}
            style={{
              padding: "11px 14px",
              borderRadius: 9,
              border: "none",
              background: "var(--accent, #EF3A47)",
              color: "#FFFFFF",
              fontWeight: 700,
              fontSize: 14,
              cursor: status === "checking" ? "default" : "pointer",
              boxShadow: "0 4px 14px rgba(239, 58, 71, 0.25)",
              fontFamily: "inherit",
            }}
          >
            {status === "checking" ? "Comprobando…" : "Entrar"}
          </button>
          {status === "error" && (
            <div
              style={{
                color: "#D92E3B",
                fontSize: 12.5,
                lineHeight: 1.45,
                padding: "8px 12px",
                borderRadius: 8,
                background: "rgba(217, 46, 59, 0.08)",
              }}
            >
              Contraseña incorrecta.
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
