"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseBrowserClient } from "@/lib/supabaseClient";
import { KiboLogo, KiboArrow } from "@/components/KiboBrand";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("sending");
    setErrorMsg("");
    const supabase = getSupabaseBrowserClient();
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    if (error) {
      setStatus("error");
      setErrorMsg(
        "Ese email no tiene acceso al portal. Si crees que deberías tenerlo, contacta con tu interlocutor en Kibo Ventures."
      );
    } else {
      setStatus("sent");
    }
  }

  function handleDevBypass() {
    // Activa la cookie de bypass para navegación local inmediata
    document.cookie = "kibo_dev_bypass=true; path=/; max-age=86400";
    window.location.href = "/?bypass=true";
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
              Portal de Founders
            </h1>
            <p
              style={{
                color: "var(--text-light, rgba(0, 0, 48, 0.65))",
                fontSize: 13.5,
                lineHeight: 1.55,
                margin: 0,
              }}
            >
              Bienvenido al espacio de la comunidad de portfolio founders de <b>Kibo Ventures</b>. Accede mediante tu email
              autorizado o accede en modo local.
            </p>
          </div>
        </div>

        {/* Local Dev Fast Access — solo visible en entorno de desarrollo */}
        {process.env.NODE_ENV === "development" && (
        <div
          style={{
            background: "rgba(0, 0, 48, 0.03)",
            border: "1px dashed rgba(0, 0, 48, 0.15)",
            borderRadius: 12,
            padding: "14px 16px",
            marginBottom: 22,
            display: "flex",
            flexDirection: "column",
            gap: 8,
          }}
        >
          <div
            style={{
              fontSize: 11,
              textTransform: "uppercase",
              fontWeight: 700,
              letterSpacing: "0.06em",
              color: "var(--accent, #EF3A47)",
              display: "flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            <span
              style={{
                width: 7,
                height: 7,
                borderRadius: "50%",
                background: "var(--accent, #EF3A47)",
                display: "inline-block",
              }}
            />
            Entorno Local / Demo
          </div>
          <div style={{ fontSize: 12.5, color: "var(--text-light, #000030)" }}>
            Salta la autenticación de Supabase para ver e interactuar con todo el portal en local:
          </div>
          <button
            type="button"
            onClick={handleDevBypass}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              padding: "10px 14px",
              borderRadius: 8,
              border: "1px solid var(--accent, #EF3A47)",
              background: "rgba(239, 58, 71, 0.06)",
              color: "var(--accent, #EF3A47)",
              fontWeight: 700,
              fontSize: 13,
              cursor: "pointer",
              transition: "all 0.15s ease",
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.background = "var(--accent, #EF3A47)";
              e.currentTarget.style.color = "#FFFFFF";
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.background = "rgba(239, 58, 71, 0.06)";
              e.currentTarget.style.color = "var(--accent, #EF3A47)";
            }}
          >
            <KiboArrow size={14} color="currentColor" />
            Entrar al Portal (Bypass Desarrollo)
          </button>
        </div>
        )}

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            margin: "18px 0",
            color: "var(--text-lighter, rgba(0,0,48,0.35))",
            fontSize: 11,
            textTransform: "uppercase",
            letterSpacing: "0.05em",
            fontWeight: 600,
          }}
        >
          <div style={{ flex: 1, height: 1, background: "rgba(0,0,48,0.08)" }} />
          <span>o entrar con email oficial</span>
          <div style={{ flex: 1, height: 1, background: "rgba(0,0,48,0.08)" }} />
        </div>

        {status === "sent" ? (
          <div
            style={{
              background: "rgba(239, 58, 71, 0.08)",
              border: "1px solid rgba(239, 58, 71, 0.2)",
              padding: 16,
              borderRadius: 12,
              fontSize: 13.5,
              color: "var(--text, #000030)",
              lineHeight: 1.5,
            }}
          >
            Revisa tu bandeja de entrada — hemos enviado un link de acceso seguro a <b>{email}</b>.
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <label style={{ fontSize: 12.5, fontWeight: 600, color: "var(--text, #000030)" }}>
              Correo de Founder / Kibo
            </label>
            <input
              type="email"
              required
              placeholder="tu@startup.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
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
              {status === "sending" ? "Enviando enlace…" : "Enviar link de acceso"}
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
                {errorMsg}
              </div>
            )}
          </form>
        )}
      </div>
    </div>
  );
}
