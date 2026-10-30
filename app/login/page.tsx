"use client";

import { useEffect, useState } from "react";
import { KiboLogo, KiboArrow } from "@/components/KiboBrand";
import { t, setCurrentLang, type Lang } from "@/lib/i18n";

export default function LoginPage() {
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "error">("idle");
  const [, setLang] = useState<Lang>("es");

  useEffect(() => {
    let lang: Lang = navigator.language?.toLowerCase().startsWith("es") ? "es" : "en";
    try {
      const saved = localStorage.getItem("kibo_lang");
      if (saved === "es" || saved === "en") lang = saved;
    } catch {
      // ignore
    }
    setCurrentLang(lang);
    document.documentElement.lang = lang;
    setLang(lang);
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("sending");
    const res = await fetch("/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    if (res.ok) {
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
        {/* Brand Header */}
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
                fontFamily: 'Pacaembu, "Space Grotesk", sans-serif',
                fontSize: 22,
                fontWeight: 700,
                color: "var(--text, #000030)",
                margin: "4px 0 6px",
                letterSpacing: "-0.015em",
              }}
            >
              {t("login.title")}
            </h1>
            <p
              style={{
                color: "var(--text-light, rgba(0, 0, 48, 0.65))",
                fontSize: 13.5,
                lineHeight: 1.55,
                margin: 0,
              }}
            >
              {t("login.lead1")} <b>Kibo Ventures</b>. {t("login.lead2")}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <label htmlFor="login-password" style={{ fontSize: 12.5, fontWeight: 600, color: "var(--text, #000030)" }}>{t("login.password")}</label>
          <input
            id="login-password"
            type="password"
            autoComplete="current-password"
            autoFocus
            required
            aria-invalid={status === "error"}
            aria-describedby={status === "error" ? "login-error" : undefined}
            placeholder="••••••••"
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
            onFocus={(e) => {
              e.target.style.borderColor = "var(--accent, #EF3A47)";
            }}
            onBlur={(e) => {
              e.target.style.borderColor = "rgba(0, 0, 48, 0.16)";
            }}
          />
          <button
            type="submit"
            disabled={status === "sending"}
            style={{
              padding: "11px 14px",
              borderRadius: 9,
              border: "none",
              background: "var(--accent, #EF3A47)",
              color: "#FFFFFF",
              fontWeight: 700,
              fontSize: 14,
              cursor: status === "sending" ? "default" : "pointer",
              boxShadow: "0 4px 14px rgba(239, 58, 71, 0.25)",
              transition: "background 0.15s ease",
              fontFamily: "inherit",
            }}
            onMouseOver={(e) => {
              if (status !== "sending") e.currentTarget.style.background = "#D92E3B";
            }}
            onMouseOut={(e) => {
              if (status !== "sending") e.currentTarget.style.background = "var(--accent, #EF3A47)";
            }}
          >
            {status === "sending" ? t("login.submitting") : t("login.submit")}
          </button>
          {status === "error" && (
            <div
              id="login-error"
              role="alert"
              style={{
                color: "#D92E3B",
                fontSize: 12.5,
                lineHeight: 1.45,
                padding: "8px 12px",
                borderRadius: 8,
                background: "rgba(217, 46, 59, 0.08)",
              }}
            >
              {t("login.error")}
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
