"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

type Intro = {
  id: number;
  founder_name: string;
  founder_email: string | null;
  startup_name: string | null;
  contact_requested: string;
  reason: string;
  status: string;
  created_at: string;
  decided_at: string | null;
  admin_note: string | null;
};
type Collection = { key: string; label: string; syncsChatbot: boolean };
type ColType = "string" | "number" | "array";

const STATUS_LABEL: Record<string, string> = {
  pending: "Pendiente",
  approved: "Aprobada",
  rejected: "No aprobada",
  done: "Intro hecha",
};
const LONG_FIELDS = new Set(["description", "description_en", "notes", "notes_en", "recommendation", "reason", "content"]);

function fmtDate(iso: string | null) {
  return iso ? new Date(iso).toLocaleString("es-ES", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }) : "—";
}

export default function AdminPage() {
  const [auth, setAuth] = useState<"loading" | "unconfigured" | "login" | "ok">("loading");
  const [tab, setTab] = useState<"intros" | "content">("intros");

  useEffect(() => {
    fetch("/api/admin/login")
      .then((r) => r.json())
      .then((d) => setAuth(!d.configured ? "unconfigured" : d.admin ? "ok" : "login"))
      .catch(() => setAuth("login"));
  }, []);

  async function logout() {
    await fetch("/api/admin/login", { method: "DELETE" });
    setAuth("login");
  }

  if (auth === "loading") return <div className="adm-shell"><p className="adm-muted">Cargando…</p></div>;
  if (auth === "unconfigured")
    return (
      <div className="adm-shell">
        <div className="adm-card adm-narrow">
          <h1 className="adm-h1">Panel del equipo</h1>
          <p>
            Falta configurar la variable <code>ADMIN_PASSWORD</code> en Vercel (Settings → Environment Variables → Production) y volver a
            desplegar.
          </p>
        </div>
      </div>
    );
  if (auth === "login") return <AdminLogin onOk={() => setAuth("ok")} />;

  return (
    <div className="adm-shell">
      <header className="adm-header">
        <div>
          <h1 className="adm-h1">Panel del equipo Kibo</h1>
          <p className="adm-muted">Solicitudes de intro y contenido del portal.</p>
        </div>
        <div className="adm-header-actions">
          <a className="adm-btn" href="/">Ver portal</a>
          <button className="adm-btn" onClick={logout}>Salir</button>
        </div>
      </header>
      <nav className="adm-tabs" role="tablist">
        <button role="tab" aria-selected={tab === "intros"} className={tab === "intros" ? "active" : ""} onClick={() => setTab("intros")}>
          Solicitudes de intro
        </button>
        <button role="tab" aria-selected={tab === "content"} className={tab === "content" ? "active" : ""} onClick={() => setTab("content")}>
          Contenido
        </button>
      </nav>
      {tab === "intros" ? <IntrosPanel /> : <ContentPanel />}
    </div>
  );
}

function AdminLogin({ onOk }: { onOk: () => void }) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);
  const [sending, setSending] = useState(false);
  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSending(true);
    const res = await fetch("/api/admin/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ password }) });
    setSending(false);
    if (res.ok) onOk();
    else setError(true);
  }
  return (
    <div className="adm-shell">
      <form className="adm-card adm-narrow" onSubmit={submit}>
        <h1 className="adm-h1">Panel del equipo</h1>
        <label htmlFor="adm-pw" className="adm-label">Contraseña de administración</label>
        <input id="adm-pw" className="adm-input" type="password" autoFocus autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        {error && <p className="adm-error" role="alert">Contraseña incorrecta.</p>}
        <button className="adm-btn primary" type="submit" disabled={sending}>{sending ? "Entrando…" : "Entrar"}</button>
      </form>
    </div>
  );
}

function IntrosPanel() {
  const [intros, setIntros] = useState<Intro[] | null>(null);
  const [filter, setFilter] = useState("pending");
  const [error, setError] = useState("");

  const load = useCallback(() => {
    fetch("/api/admin/intros")
      .then((r) => r.json())
      .then((d) => (d.error ? setError(d.error) : setIntros(d.intros)))
      .catch(() => setError("No se han podido cargar las solicitudes."));
  }, []);
  useEffect(load, [load]);

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: intros?.length || 0 };
    (intros || []).forEach((i) => (c[i.status] = (c[i.status] || 0) + 1));
    return c;
  }, [intros]);

  if (error) return <p className="adm-error">{error}</p>;
  if (!intros) return <p className="adm-muted">Cargando…</p>;
  const visible = filter === "all" ? intros : intros.filter((i) => i.status === filter);

  return (
    <section>
      <div className="adm-filters">
        {["pending", "approved", "done", "rejected", "all"].map((s) => (
          <button key={s} className={`adm-chip${filter === s ? " active" : ""}`} onClick={() => setFilter(s)}>
            {s === "all" ? "Todas" : STATUS_LABEL[s]} <span>{counts[s] || 0}</span>
          </button>
        ))}
      </div>
      {!visible.length && <p className="adm-muted">No hay solicitudes en este estado.</p>}
      <div className="adm-intro-list">
        {visible.map((i) => (
          <IntroRow key={i.id} intro={i} onSaved={(u) => setIntros((list) => (list || []).map((x) => (x.id === u.id ? { ...x, ...u } : x)))} />
        ))}
      </div>
    </section>
  );
}

function IntroRow({ intro, onSaved }: { intro: Intro; onSaved: (u: Partial<Intro> & { id: number }) => void }) {
  const [status, setStatus] = useState(intro.status);
  const [note, setNote] = useState(intro.admin_note || "");
  const [state, setState] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const dirty = status !== intro.status || note !== (intro.admin_note || "");

  async function save() {
    setState("saving");
    const res = await fetch("/api/admin/intros", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: intro.id, status, admin_note: note }),
    });
    const d = await res.json().catch(() => ({}));
    if (!res.ok || d.error) return setState("error");
    onSaved(d.intro);
    setState("saved");
  }

  return (
    <article className="adm-card adm-intro">
      <div className="adm-intro-head">
        <div>
          <div className="adm-intro-title">{intro.contact_requested}</div>
          <div className="adm-muted">
            {intro.founder_name}
            {intro.startup_name ? ` · ${intro.startup_name}` : ""}
            {intro.founder_email ? (
              <>
                {" · "}
                <a href={`mailto:${intro.founder_email}`}>{intro.founder_email}</a>
              </>
            ) : null}
          </div>
        </div>
        <div className="adm-muted adm-small">
          Pedida: {fmtDate(intro.created_at)}
          {intro.decided_at ? <><br />Resuelta: {fmtDate(intro.decided_at)}</> : null}
        </div>
      </div>
      <p className="adm-reason">{intro.reason}</p>
      <div className="adm-intro-actions">
        <label className="adm-label-inline">
          Estado
          <select className="adm-input" value={status} onChange={(e) => { setStatus(e.target.value); setState("idle"); }}>
            {Object.entries(STATUS_LABEL).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
          </select>
        </label>
        <label className="adm-label-inline adm-grow">
          Comentario (lo ve el founder)
          <input className="adm-input" value={note} maxLength={1000} onChange={(e) => { setNote(e.target.value); setState("idle"); }} placeholder="p.ej. Os presentamos por email esta semana" />
        </label>
        <button className="adm-btn primary" disabled={!dirty || state === "saving"} onClick={save}>
          {state === "saving" ? "Guardando…" : "Guardar"}
        </button>
        {state === "saved" && <span className="adm-ok">Guardado ✓</span>}
        {state === "error" && <span className="adm-error">Error al guardar</span>}
      </div>
    </article>
  );
}

function inferTypes(rows: any[]): Record<string, ColType> {
  const types: Record<string, ColType> = {};
  for (const row of rows) {
    for (const [k, v] of Object.entries(row)) {
      if (Array.isArray(v)) types[k] = "array";
      else if (typeof v === "number" && types[k] !== "array" && types[k] !== "string") types[k] = "number";
      else if (typeof v === "string" && v !== "" && types[k] !== "array") types[k] = "string";
      else if (!types[k]) types[k] = "string";
    }
  }
  return types;
}

function toInput(v: any, type: ColType) {
  if (v === null || v === undefined) return "";
  if (type === "array") return Array.isArray(v) ? v.join(", ") : String(v);
  return String(v);
}

function fromInput(s: string, type: ColType) {
  if (type === "array") return s.split(",").map((x) => x.trim()).filter(Boolean);
  if (s.trim() === "") return null;
  if (type === "number") {
    const n = Number(s.replace(",", "."));
    return Number.isFinite(n) ? n : s;
  }
  return s;
}

type GridRow = { k: number; cells: Record<string, string> };

function ContentPanel() {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [key, setKey] = useState("");
  const [types, setTypes] = useState<Record<string, ColType>>({});
  const [grid, setGrid] = useState<GridRow[] | null>(null);
  const [dirty, setDirty] = useState(false);
  const [query, setQuery] = useState("");
  const [msg, setMsg] = useState<{ kind: "ok" | "error" | "warn"; text: string } | null>(null);
  const [saving, setSaving] = useState(false);
  const [nextK, setNextK] = useState(0);

  useEffect(() => {
    fetch("/api/admin/content")
      .then((r) => r.json())
      .then((d) => {
        setCollections(d.collections || []);
        if (d.collections?.length) setKey(d.collections[0].key);
      });
  }, []);

  useEffect(() => {
    if (!key) return;
    setGrid(null);
    setDirty(false);
    setMsg(null);
    setQuery("");
    fetch(`/api/admin/content?key=${encodeURIComponent(key)}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.error) return setMsg({ kind: "error", text: d.error });
        const rows: any[] = d.rows || [];
        const ty = inferTypes(rows);
        setTypes(ty);
        // Se edita el texto tal cual (comas, decimales…) y se convierte al guardar.
        setGrid(rows.map((r, i) => ({ k: i, cells: Object.fromEntries(Object.keys(ty).map((c) => [c, toInput(r[c], ty[c])])) })));
        setNextK(rows.length);
      });
  }, [key]);

  const columns = useMemo(() => Object.keys(types), [types]);
  const collection = collections.find((c) => c.key === key);
  const needle = query.trim().toLowerCase();
  const visible = (grid || []).filter((r) => !needle || Object.values(r.cells).join(" ").toLowerCase().includes(needle));

  function changeKey(next: string) {
    if (dirty && !confirm("Tienes cambios sin guardar en esta colección. ¿Descartarlos?")) return;
    setKey(next);
  }
  function updateCell(k: number, col: string, value: string) {
    setGrid((g) => (g || []).map((r) => (r.k === k ? { ...r, cells: { ...r.cells, [col]: value } } : r)));
    setDirty(true);
    setMsg(null);
  }
  function addRow() {
    const cells: Record<string, string> = Object.fromEntries(columns.map((c) => [c, ""]));
    if ("id" in types) cells.id = String(Math.max(0, ...(grid || []).map((r) => Number(r.cells.id) || 0)) + 1);
    setGrid((g) => [{ k: nextK, cells }, ...(g || [])]);
    setNextK((n) => n + 1);
    setQuery("");
    setDirty(true);
  }
  function removeRow(k: number) {
    const r = grid!.find((x) => x.k === k)!;
    const name = r.cells.name || r.cells.title || r.cells.company || r.cells.team_lead || "esta fila";
    if (!confirm(`¿Eliminar «${name}»?`)) return;
    setGrid((g) => (g || []).filter((x) => x.k !== k));
    setDirty(true);
  }
  async function save() {
    const rows = (grid || [])
      .filter((r) => Object.entries(r.cells).some(([c, v]) => c !== "id" && v.trim() !== ""))
      .map((r) => Object.fromEntries(columns.map((c) => [c, fromInput(r.cells[c] ?? "", types[c])])));
    setSaving(true);
    const res = await fetch("/api/admin/content", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ key, rows }) });
    const d = await res.json().catch(() => ({}));
    setSaving(false);
    if (!res.ok || d.error) return setMsg({ kind: "error", text: d.error || "No se ha podido guardar." });
    setDirty(false);
    if (d.synced === false) setMsg({ kind: "warn", text: `Guardado en la web, pero no se ha podido actualizar el chatbot: ${d.syncError}` });
    else setMsg({ kind: "ok", text: d.synced ? "Guardado ✓ — web y chatbot actualizados." : "Guardado ✓" });
  }

  return (
    <section>
      <div className="adm-content-bar">
        <label className="adm-label-inline">
          Colección
          <select className="adm-input" value={key} onChange={(e) => changeKey(e.target.value)}>
            {collections.map((c) => <option key={c.key} value={c.key}>{c.label}</option>)}
          </select>
        </label>
        <input className="adm-input adm-grow" placeholder="Filtrar filas…" aria-label="Filtrar filas" value={query} onChange={(e) => setQuery(e.target.value)} />
        <button className="adm-btn" onClick={addRow} disabled={!grid}>+ Añadir fila</button>
        <button className="adm-btn primary" onClick={save} disabled={!dirty || saving}>{saving ? "Guardando…" : "Guardar cambios"}</button>
      </div>
      <p className="adm-muted adm-small">
        {grid ? `${grid.length} filas` : "Cargando…"}
        {collection?.syncsChatbot ? " · Al guardar también se actualiza lo que consulta Kibito AI." : ""} Las listas (tags, fotos, tipos) van separadas por comas.
      </p>
      {msg && <p className={msg.kind === "ok" ? "adm-ok" : msg.kind === "warn" ? "adm-warn" : "adm-error"} role="status">{msg.text}</p>}
      {grid && (
        <div className="adm-table-wrap">
          <table className="adm-table">
            <thead>
              <tr>
                {columns.map((c) => <th key={c}>{c}</th>)}
                <th aria-label="Acciones" />
              </tr>
            </thead>
            <tbody>
              {visible.map((r) => (
                <tr key={r.k}>
                  {columns.map((c) => {
                    const value = r.cells[c] ?? "";
                    if (c === "id") return <td key={c} className="adm-muted">{value}</td>;
                    const long = LONG_FIELDS.has(c) || value.length > 80;
                    const label = `${c} de ${r.cells.name || r.cells.title || r.cells.company || "fila nueva"}`;
                    return (
                      <td key={c}>
                        {long ? (
                          <textarea className="adm-cell" rows={2} aria-label={label} value={value} onChange={(e) => updateCell(r.k, c, e.target.value)} />
                        ) : (
                          <input className="adm-cell" aria-label={label} value={value} onChange={(e) => updateCell(r.k, c, e.target.value)} />
                        )}
                      </td>
                    );
                  })}
                  <td>
                    <button className="adm-icon-btn" aria-label={`Eliminar ${r.cells.name || r.cells.title || r.cells.company || "fila"}`} onClick={() => removeRow(r.k)}>✕</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
