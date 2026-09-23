"use client";

import { useEffect, useRef } from "react";
import DATA from "@/lib/data.json";
import { iconSvg } from "@/lib/icons";
import { t, loc, getLang, setCurrentLang, type Lang } from "@/lib/i18n";

// Backend independiente (Railway). Vacío = mismo origen (rutas /api de Next.js).
const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "";

export default function KibitoApp() {
  const sidebarRef = useRef<HTMLElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const chatScrollRef = useRef<HTMLDivElement>(null);
  const chatViewRef = useRef<HTMLElement>(null);
  const contentViewRef = useRef<HTMLElement>(null);
  const chatWelcomeRef = useRef<HTMLDivElement>(null);
  const chatInputRef = useRef<HTMLInputElement>(null);
  const chatSendRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    // ---------- helpers ----------
    function esc(s: any) {
      if (s === null || s === undefined) return "";
      return String(s).replace(
        /[&<>"']/g,
        (c) =>
          (
            { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" } as Record<string, string>
          )[c]
      );
    }
    function mdLite(s: any) {
      let t = esc(s);
      t = t.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
      t = t.replace(/\[([^\]]+)\]\((https?:\/\/[^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>');
      return t;
    }
    function fmtMoney(n: number | null | undefined) {
      if (n === null || n === undefined) return null;
      return "€" + Number(n).toLocaleString("es-ES");
    }
    function fmtEventDate(iso?: string | null) {
      if (!iso) return null;
      const d = new Date(iso + "T00:00:00");
      return d.toLocaleDateString(getLang() === "en" ? "en-US" : "es-ES", { day: "numeric", month: "long", year: "numeric" });
    }
    function matches(obj: any, q: string, fields: string[]) {
      if (!q) return true;
      const needle = q.toLowerCase();
      return fields.some((f) => (obj[f] || "").toString().toLowerCase().includes(needle));
    }
    const PALETTE = ["#EF3A47", "#4594F4", "#004B70", "#D9822B", "#0F9B53", "#5390D3", "#8B5A9E", "#000030"];
    function hashColor(str: string) {
      let h = 0;
      for (let i = 0; i < str.length; i++) h = str.charCodeAt(i) + ((h << 5) - h);
      return PALETTE[Math.abs(h) % PALETTE.length];
    }
    // Los 4 colores del stack de flechas de kiboventures.com — se rotan por sección
    // para que cada página tenga un acento de marca distinto en vez de siempre rojo.
    const BRAND_COLORS = ["var(--accent)", "var(--accent-2)", "var(--accent-yellow)", "var(--accent-green)"];
    function brandColor(seed: string) {
      let h = 0;
      for (let i = 0; i < seed.length; i++) h = seed.charCodeAt(i) + ((h << 5) - h);
      return BRAND_COLORS[Math.abs(h) % BRAND_COLORS.length];
    }
    function avatar(name: string, photoUrl?: string | null) {
      if (photoUrl) {
        return `<img class="avatar" src="${esc(photoUrl)}" alt="${esc(name || "")}">`;
      }
      const initials = (name || "?").split(" ").filter(Boolean).slice(0, 2).map((w) => w[0]).join("").toUpperCase();
      return `<span class="avatar" style="background:${hashColor(name || "?")}">${esc(initials)}</span>`;
    }
    function badge(text?: string | null, colorKey?: string) {
      if (!text) return "";
      const c = hashColor(colorKey || text);
      return `<span class="badge" style="background:${c}1f;color:${c}">${esc(text)}</span>`;
    }
    function uniqueSorted(arr: any[]) {
      return Array.from(new Set(arr.filter(Boolean))).sort();
    }
    function optsHtml(values: string[], allLabel: string) {
      return `<option value="">${esc(allLabel)}</option>` + values.map((v) => `<option value="${esc(v)}">${esc(v)}</option>`).join("");
    }
    function cuisineIcon(cuisine?: string | null) {
      return iconSvg("utensils", 26, "var(--accent)");
    }
    const EXT_STYLE: Record<string, { color: string; icon: string }> = {
      pdf: { color: "var(--accent)", icon: "file-text" },
      xlsx: { color: "var(--accent-green)", icon: "table" },
      xls: { color: "var(--accent-green)", icon: "table" },
      pptx: { color: "var(--accent-yellow)", icon: "presentation" },
      ppt: { color: "var(--accent-yellow)", icon: "presentation" },
      docx: { color: "var(--accent-2)", icon: "file-text" },
      doc: { color: "var(--accent-2)", icon: "file-text" },
    };
    function docCard(doc: any, caption?: string) {
      const ext = (doc.file_url.split(".").pop() || "").toLowerCase();
      const style = EXT_STYLE[ext] || { color: "var(--text-lighter)", icon: "file-text" };
      const visual = doc.thumbnail_url
        ? `<img class="doc-thumb" src="${esc(doc.thumbnail_url)}" alt="" loading="lazy">`
        : `<div class="doc-thumb-fallback">${iconSvg(style.icon, 32, style.color)}</div>`;
      return `<a class="doc-card" href="${esc(doc.file_url)}" target="_blank" rel="noopener">
        <div class="doc-thumb-wrap">${visual}<span class="doc-ext-badge" style="background:${style.color}">${esc(ext.toUpperCase())}</span></div>
        <div class="doc-body">
          <div class="doc-title">${esc(doc.title)}</div>
          ${caption ? `<div class="doc-caption">${esc(caption)}</div>` : ""}
          <div class="doc-open">${iconSvg("download", 12)}<span>${t("common.openDoc")}</span></div>
        </div>
      </a>`;
    }
    function docsByTitles(titles: string[]) {
      return (DATA.documents as any[]).filter((d) => titles.includes(d.title));
    }

    // ---------- nav tree ----------
    const REST_CITIES = uniqueSorted((DATA.restaurants as any[]).map((r) => r.city)) as string[];
    const NAV: any[] = [
      { id: "welcome", icon: "home", labelKey: "nav.welcome" },
      { id: "chat", icon: "sparkles", labelKey: "nav.chat" },
      { divider: true },
      {
        id: "meetkibo",
        icon: "compass",
        labelKey: "nav.meetkibo",
        children: [
          { id: "meetkibo-principles", labelKey: "nav.meetkibo_principles" },
          { id: "meetkibo-team", labelKey: "nav.meetkibo_team" },
          { id: "meetkibo-alumni", labelKey: "nav.meetkibo_alumni" },
          { id: "meetkibo-portfolio", labelKey: "nav.meetkibo_portfolio" },
        ],
      },
      {
        id: "network",
        icon: "network",
        labelKey: "nav.network",
        children: [
          { id: "network-vc", labelKey: "nav.network_vc" },
          { id: "network-vd", labelKey: "nav.network_vd" },
          { id: "network-pf", labelKey: "nav.network_pf" },
          { id: "network-legal", labelKey: "nav.network_legal" },
          { id: "network-rec", labelKey: "nav.network_rec" },
          { id: "network-press", labelKey: "nav.network_press" },
          { id: "network-adv", labelKey: "nav.network_adv" },
          { id: "network-other", labelKey: "nav.network_other" },
        ],
      },
      {
        id: "guides",
        icon: "book-open",
        labelKey: "nav.guides",
        children: [
          { id: "guides-reporting", labelKey: "nav.guides_reporting" },
          { id: "guides-board", labelKey: "nav.guides_board" },
          { id: "guides-pitch", labelKey: "nav.guides_pitch" },
          { id: "guides-fund", labelKey: "nav.guides_fund" },
          { id: "guides-vc101", labelKey: "nav.guides_vc101" },
          { id: "guides-inst", labelKey: "nav.guides_inst" },
        ],
      },
      { id: "restaurants", icon: "utensils", labelKey: "nav.restaurants", children: REST_CITIES.map((c) => ({ id: "rest-" + c, label: c })) },
      { id: "perks", icon: "gift", labelKey: "nav.perks" },
      {
        id: "calendar",
        icon: "calendar",
        labelKey: "nav.calendar",
        children: [
          { id: "cal-future", labelKey: "nav.cal_future" },
          { id: "cal-hosted", labelKey: "nav.cal_hosted" },
        ],
      },
      {
        id: "other",
        icon: "folder",
        labelKey: "nav.other",
        children: [
          { id: "other-ai", labelKey: "nav.other_ai" },
          { id: "other-recs", labelKey: "nav.other_recs" },
        ],
      },
    ];
    function navLabel(item: any): string {
      return item.labelKey ? t(item.labelKey) : item.label;
    }

    function paneParent(paneId: string) {
      for (const item of NAV) {
        if (item.children) for (const c of item.children) if (c.id === paneId) return item;
      }
      return null;
    }
    function paneLabel(paneId: string) {
      for (const item of NAV) {
        if (item.id === paneId) return navLabel(item);
        if (item.children) for (const c of item.children) if (c.id === paneId) return navLabel(c);
      }
      return "";
    }

    const sidebarEl = sidebarRef.current!;
    const KIBO_ARROW_SVG = `<svg width="15" height="15" viewBox="0 0 218 218" fill="none" xmlns="http://www.w3.org/2000/svg" style="display:block"><path d="M0 45.6746H140.002L4.05982 181.387L36.3333 213.695L172.358 77.9421V218L218 172.284V0H45.6832L0 45.6746Z" fill="#FFFFFF"/></svg>`;
    const kiboArrow = (color: string, size = 9) =>
      `<svg width="${size}" height="${size}" viewBox="0 0 218 218" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M0 45.6746H140.002L4.05982 181.387L36.3333 213.695L172.358 77.9421V218L218 172.284V0H45.6832L0 45.6746Z" fill="${color}"/></svg>`;
    const BRAND_ARROW_STACK = `<div class="brand-arrows">${["#EF3A47", "#F9C521", "#1FC974", "#4594F4"].map((c) => kiboArrow(c)).join("")}</div>`;

    function renderSidebar() {
      sidebarEl.innerHTML =
        '<div class="brand"><span class="mark">' +
        KIBO_ARROW_SVG +
        '</span><span class="label" style="font-weight:700;letter-spacing:0.04em;">KIBO VENTURES</span></div>' +
        NAV.map((item) => {
          if (item.divider) return '<div class="sidebar-divider"></div>';
          const hasChildren = item.children && item.children.length;
          return `<div>
            <div class="navrow">
              <button class="navitem" data-pane="${item.id}"><span class="ic">${iconSvg(item.icon, 16, "currentColor")}</span><span class="label">${esc(navLabel(item))}</span></button>
              ${hasChildren ? `<button class="navchevron" data-toggle-parent="${item.id}">▶</button>` : ""}
            </div>
            ${hasChildren ? `<div class="navchildren" id="children-${item.id}">${item.children.map((c: any) => `<button class="navchild" data-pane="${c.id}">${esc(navLabel(c))}</button>`).join("")}</div>` : ""}
          </div>`;
        }).join("") +
        `<div class="footer-note">${BRAND_ARROW_STACK}${esc(t("nav.footer"))}<br><button id="logout-btn" style="margin-top:8px;background:none;border:1px solid rgba(255,255,255,0.2);color:rgba(255,255,255,0.7);border-radius:6px;padding:4px 10px;font-size:11px;cursor:pointer;font-family:inherit;">${esc(t("nav.logout"))}</button></div>`;

      document.getElementById("logout-btn")?.addEventListener("click", async () => {
        document.cookie = "kibo_dev_bypass=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
        try {
          const { getSupabaseBrowserClient } = await import("@/lib/supabaseClient");
          const supabase = getSupabaseBrowserClient();
          await supabase.auth.signOut();
        } catch (e) {
          // ignore
        }
        window.location.href = "/login";
      });

      sidebarEl.querySelectorAll("[data-pane]").forEach((btn) =>
        btn.addEventListener("click", () => selectPane((btn as HTMLElement).dataset.pane!))
      );
      sidebarEl.querySelectorAll("[data-toggle-parent]").forEach((btn) =>
        btn.addEventListener("click", (e) => {
          e.stopPropagation();
          const id = (btn as HTMLElement).dataset.toggleParent!;
          document.getElementById("children-" + id)!.classList.toggle("open");
          (btn as HTMLElement).classList.toggle("open");
        })
      );
    }
    renderSidebar();

    function setActiveNav(paneId: string) {
      sidebarEl.querySelectorAll(".navitem, .navchild").forEach((b) => b.classList.remove("active"));
      const direct =
        sidebarEl.querySelector(`.navitem[data-pane="${paneId}"]`) || sidebarEl.querySelector(`.navchild[data-pane="${paneId}"]`);
      if (direct) direct.classList.add("active");
      const parent = paneParent(paneId);
      if (parent) {
        const childrenEl = document.getElementById("children-" + parent.id);
        if (childrenEl) childrenEl.classList.add("open");
        const chev = sidebarEl.querySelector(`[data-toggle-parent="${parent.id}"]`);
        if (chev) chev.classList.add("open");
      }
    }

    let currentPaneId = "welcome";
    function selectPane(paneId: string) {
      currentPaneId = paneId;
      setActiveNav(paneId);
      if (paneId === "chat") {
        chatViewRef.current!.classList.add("active");
        contentViewRef.current!.classList.remove("active");
        return;
      }
      chatViewRef.current!.classList.remove("active");
      contentViewRef.current!.classList.add("active");
      const content = contentRef.current!;
      const renderer = RENDERERS[paneId];
      if (renderer) renderer(content);
      else content.innerHTML = `<p>${t("common.sectionNotFound")}</p>`;
      content.scrollTop = 0;
      contentViewRef.current!.scrollTop = 0;
    }

    function breadcrumbHtml(paneId: string) {
      const parent = paneParent(paneId);
      if (!parent) return "";
      return `<div class="breadcrumb"><button data-pane="${parent.id}">${esc(navLabel(parent))}</button> / ${esc(paneLabel(paneId))}</div>`;
    }
    function pageHeader(paneId: string, icon: string, title: string, subtitle?: string) {
      const c = brandColor(paneId);
      return `${breadcrumbHtml(paneId)}<div class="page-header"><div class="page-icon-badge" style="background:var(--bg-sunk);">${iconSvg(
        icon,
        22,
        c
      )}</div><div><h1>${esc(title)}</h1>${subtitle ? `<p class="subtitle">${subtitle}</p>` : ""}</div></div>`;
    }
    function bindBreadcrumb(container: HTMLElement) {
      container.querySelectorAll(".breadcrumb [data-pane]").forEach((b) => b.addEventListener("click", () => selectPane((b as HTMLElement).dataset.pane!)));
      container.querySelectorAll("[data-goto]").forEach((b) => b.addEventListener("click", (e) => { e.preventDefault(); selectPane((b as HTMLElement).dataset.goto!); }));
    }

    function overviewRenderer(item: any, icon: string, titleKey: string, subtitleKey: string, countFn: (id: string) => string) {
      return (container: HTMLElement) => {
        const headC = brandColor(item.id);
        container.innerHTML = `<div class="page-header"><div class="page-icon-badge" style="background:var(--bg-sunk);">${iconSvg(icon, 22, headC)}</div><div><h1>${esc(t(titleKey))}</h1><p class="subtitle">${t(subtitleKey)}</p></div></div>
          <div class="overview-grid">${item.children
            .map((c: any) => {
              const cc = brandColor(c.id);
              const ci = c.id === "network-other" ? "message" : "folder";
              return `<button class="overview-card" data-pane="${c.id}"><div class="oc-icon" style="color:${cc};">${iconSvg(ci, 22)}</div><div class="oc-title">${esc(navLabel(c))}</div><div class="oc-count">${countFn(c.id)}</div></button>`;
            })
            .join("")}</div>`;
        container.querySelectorAll("[data-pane]").forEach((b) => b.addEventListener("click", () => selectPane((b as HTMLElement).dataset.pane!)));
      };
    }

    // ================= WELCOME PAGE =================
    function renderWelcomePane(container: HTMLElement) {
      container.innerHTML = `
        <div class="welcome-hero">
          <div class="welcome-badge">
            ${iconSvg("award", 14, "var(--accent)")}
            <span>${t("welcome.badge")}</span>
          </div>

          <div style="margin: 12px auto 22px; display: flex; justify-content: center;">
            <svg width="290" height="auto" viewBox="0 0 264 157" fill="none" xmlns="http://www.w3.org/2000/svg" style="max-width: 90%; height: auto;">
              <path d="M171.087 51.6514L159.451 83.258L147.816 51.6514H136.84L153.487 96.5069H165.073L181.647 51.6514H171.087Z" fill="var(--text, #000030)"/>
              <path d="M218.436 60.9647V51.6514H196.338H193.404H186.144V96.5069H193.404H196.338H218.778V87.1936H196.338V77.1469H211.64V68.298H196.338V60.9647H218.436Z" fill="var(--text, #000030)"/>
              <path d="M253.782 72.8691L235.253 51.6514H226.453V96.5069H236.671V69.0314L253.782 88.7091V96.5069H264V51.6514H253.782V72.8691Z" fill="var(--text, #000030)"/>
              <path d="M68.6889 135.765C68.6889 137.843 68.3711 139.603 67.7111 140.996C67.0511 142.389 66.1711 143.416 65.0222 144.076C63.8733 144.736 62.5533 145.054 61.0622 145.054C59.5711 145.054 58.2511 144.736 57.1267 144.076C56.0022 143.416 55.1222 142.414 54.4622 140.996C53.8022 139.603 53.4844 137.867 53.4844 135.765V109.316H43.2667V136.303C43.2667 142.316 44.7578 146.911 47.7644 150.065C50.7467 153.218 55.1222 154.783 60.8667 154.783C66.6111 154.783 70.9867 153.218 73.9933 150.065C77 146.911 78.5156 142.34 78.5156 136.303V109.316H68.6889V135.765Z" fill="var(--text, #000030)"/>
              <path d="M119.436 133.442C120.902 131.071 121.66 128.333 121.66 125.278C121.66 122.051 120.927 119.24 119.436 116.844C117.969 114.449 115.891 112.591 113.276 111.295C110.636 110 107.604 109.34 104.182 109.34H96.7511H94.0378H86.5333V154.195H96.7511V140.971H103.889L111.271 154.195H123.249L114.4 138.355C116.502 137.109 118.189 135.471 119.436 133.442ZM96.7511 117.993H102.422C105.062 117.993 107.164 118.604 108.729 119.851C110.293 121.098 111.1 122.882 111.1 125.253C111.1 127.527 110.318 129.311 108.729 130.607C107.164 131.878 105.038 132.513 102.422 132.513H96.7511V117.993Z" fill="var(--text, #000030)"/>
              <path d="M139.431 134.811H154.709V125.963H139.431V118.654H161.504V109.316H139.431H136.473H129.213V154.171H136.473H139.431H161.847V144.858H139.431V134.811Z" fill="var(--text, #000030)"/>
              <path d="M189.298 127.502L184.336 126.256C182.404 125.864 181.011 125.278 180.18 124.52C179.324 123.762 178.909 122.809 178.909 121.66C178.909 120.829 179.178 120.071 179.716 119.387C180.253 118.702 180.987 118.164 181.891 117.773C182.82 117.382 183.871 117.187 185.044 117.187C187.171 117.187 188.809 117.7 189.982 118.702C191.131 119.704 191.718 121.049 191.718 122.736H202.351C202.351 119.949 201.691 117.505 200.396 115.427C199.1 113.349 197.169 111.711 194.578 110.538C192.011 109.365 188.907 108.778 185.289 108.778C181.696 108.778 178.616 109.34 176.049 110.44C173.482 111.54 171.527 113.08 170.231 115.084C168.936 117.064 168.276 119.338 168.276 121.905C168.276 125.522 169.351 128.505 171.502 130.827C173.653 133.149 177.173 134.787 182.087 135.716L186.976 136.767C189.053 137.158 190.52 137.72 191.376 138.478C192.231 139.236 192.647 140.238 192.647 141.484C192.647 142.462 192.402 143.342 191.889 144.149C191.376 144.931 190.593 145.567 189.518 146.031C188.467 146.496 187.196 146.74 185.729 146.74C184.164 146.74 182.796 146.447 181.647 145.884C180.498 145.322 179.618 144.516 179.031 143.513C178.42 142.511 178.127 141.362 178.127 140.067H167.493C167.493 142.976 168.202 145.567 169.62 147.791C171.038 150.04 173.091 151.776 175.829 152.998C178.542 154.22 181.818 154.831 185.631 154.831C189.42 154.831 192.622 154.244 195.287 153.096C197.951 151.947 199.931 150.333 201.276 148.305C202.62 146.276 203.28 143.953 203.28 141.362C203.28 137.622 202.18 134.664 199.98 132.44C197.78 130.191 194.211 128.553 189.298 127.502Z" fill="var(--text, #000030)"/>
              <path d="M0 119.069H13.1756V154.171H23.3689V119.069H36.5933V109.316H0V119.069Z" fill="var(--text, #000030)"/>
              <path d="M124.984 72.0381H0V82.2559H124.984V72.0381Z" fill="var(--text, #000030)"/>
              <path d="M264 17.9424H159.573V28.1602H264V17.9424Z" fill="var(--text, #000030)"/>
              <path d="M10.2178 26.2535L26.0822 45.4913H38.72L18.8222 21.4624L38.3044 0.611328H26.0822L10.2178 17.6002V0.611328H0V45.4913H10.2178V26.2535Z" fill="var(--text, #000030)"/>
              <path d="M52.5556 0.611328H42.3378V45.4669H52.5556V0.611328Z" fill="var(--text, #000030)"/>
              <path d="M71.2555 45.4913H80.8866C86.1911 45.4913 90.3222 44.3424 93.2555 42.069C96.1889 39.7957 97.6555 36.5446 97.6555 32.3402C97.6555 28.2579 96.1644 25.129 93.2066 23.0024C92.3022 22.3424 91.2266 21.8046 90.0044 21.3646C90.2977 21.169 90.5911 20.9735 90.86 20.7779C93.5733 18.7002 94.9422 15.8646 94.9422 12.2713C94.9422 8.58016 93.6466 5.72015 91.08 3.69127C88.5133 1.66238 84.8222 0.660156 80.0066 0.660156H71.28H69.0311H61.0622V45.5157H69.0311H71.2555V45.4913ZM84.9933 35.5424C83.6244 36.4224 81.8644 36.8624 79.64 36.8624H71.2555V26.1802H79.64C81.8155 26.1802 83.5755 26.6446 84.9444 27.5735C86.3133 28.5024 87.0222 29.8713 87.0222 31.6802C87.0222 33.3668 86.3377 34.6379 84.9933 35.5424ZM79.1022 8.87349C80.8377 8.87349 82.28 9.24016 83.4044 9.99794C84.5533 10.7557 85.1155 11.929 85.1155 13.5424C85.1155 15.0824 84.5289 16.2313 83.3555 16.9646C82.1822 17.7224 80.74 18.0891 79.0533 18.0891H71.2555V8.87349H79.1022Z" fill="var(--text, #000030)"/>
              <path d="M111.955 43.3156C115.158 45.1489 118.922 46.0533 123.249 46.0533C127.502 46.0533 131.242 45.1489 134.469 43.3156C137.695 41.4822 140.189 38.8422 141.973 35.3711C143.733 31.9 144.638 27.7933 144.638 23.0267C144.638 18.26 143.758 14.1533 141.973 10.6822C140.213 7.21111 137.695 4.57111 134.469 2.73777C131.242 0.90444 127.502 0 123.249 0C118.922 0 115.158 0.90444 111.955 2.73777C108.753 4.57111 106.26 7.21111 104.5 10.6822C102.74 14.1533 101.835 18.26 101.835 23.0267C101.835 27.7933 102.715 31.9 104.5 35.3711C106.26 38.8422 108.753 41.5067 111.955 43.3156ZM113.813 15.9133C114.767 13.9089 116.038 12.3933 117.675 11.3422C119.313 10.2911 121.171 9.77778 123.249 9.77778C125.253 9.77778 127.087 10.2911 128.749 11.3422C130.411 12.3933 131.707 13.9089 132.635 15.9133C133.589 17.9178 134.053 20.3133 134.053 23.0511C134.053 25.8378 133.589 28.2578 132.635 30.2622C131.682 32.2667 130.387 33.7822 128.749 34.8089C127.087 35.8355 125.278 36.3489 123.249 36.3489C121.171 36.3489 119.313 35.8355 117.675 34.8089C116.038 33.7822 114.742 32.2667 113.813 30.2622C112.86 28.2578 112.395 25.8622 112.395 23.0511C112.395 20.2889 112.884 17.9178 113.813 15.9133Z" fill="var(--text, #000030)"/>
              <path d="M218.167 120.096H247.598L219.022 148.623L225.818 155.418L254.393 126.891V156.323L264 146.716V110.489H227.773L218.167 120.096Z" fill="var(--text, #000030)"/>
            </svg>
          </div>

          <h1 class="welcome-title">${t("welcome.titleHtml")}</h1>

          <p class="welcome-lead">
            ${t("welcome.lead")}
          </p>

          <div class="values-row" style="justify-content:center;margin:0 auto 12px;">
            <span class="value-badge" style="background:#EF3A471a;color:#EF3A47;">P · Passion</span>
            <span class="value-badge" style="background:#4594F41a;color:#4594F4;">A · Ambition</span>
            <span class="value-badge" style="background:#F9C52125;color:#B8860B;">T · Trust</span>
            <span class="value-badge" style="background:#1FC9741a;color:#0F9B53;">H · Help</span>
          </div>

        </div>

        <div style="margin-bottom:16px;">
          <h2 style="font-size:18px;font-weight:700;color:var(--text);margin-bottom:6px;">${t("welcome.resourcesTitle")}</h2>
          <p style="color:var(--text-light);font-size:13.5px;margin:0;">${t("welcome.resourcesDesc")}</p>
        </div>

        <div class="welcome-grid">
          <div class="welcome-card" data-pane="meetkibo">
            <div class="wc-icon">${iconSvg("compass", 22, "var(--accent)")}</div>
            <div class="wc-title">${t("welcome.card1.title")}</div>
            <div class="wc-desc">${t("welcome.card1.desc")}</div>
            <div class="wc-link">${t("welcome.card1.link")} <span>→</span></div>
          </div>

          <div class="welcome-card" data-pane="network">
            <div class="wc-icon" style="background:rgba(69,148,244,0.1);color:#4594F4;">${iconSvg("network", 22, "#4594F4")}</div>
            <div class="wc-title">${t("welcome.card2.title")}</div>
            <div class="wc-desc">${t("welcome.card2.desc")}</div>
            <div class="wc-link" style="color:#4594F4;">${t("welcome.card2.link")} <span>→</span></div>
          </div>

          <div class="welcome-card" data-pane="guides">
            <div class="wc-icon" style="background:rgba(0,75,112,0.1);color:#004B70;">${iconSvg("book-open", 22, "#004B70")}</div>
            <div class="wc-title">${t("welcome.card3.title")}</div>
            <div class="wc-desc">${t("welcome.card3.desc")}</div>
            <div class="wc-link" style="color:#004B70;">${t("welcome.card3.link")} <span>→</span></div>
          </div>

          <div class="welcome-card" data-pane="perks">
            <div class="wc-icon" style="background:rgba(249,197,33,0.15);color:#B8860B;">${iconSvg("gift", 22, "#B8860B")}</div>
            <div class="wc-title">${t("welcome.card4.title")}</div>
            <div class="wc-desc">${t("welcome.card4.desc")}</div>
            <div class="wc-link" style="color:#B8860B;">${t("welcome.card4.link")} <span>→</span></div>
          </div>

          <div class="welcome-card" data-pane="restaurants">
            <div class="wc-icon" style="background:rgba(31,201,116,0.1);color:#0F9B53;">${iconSvg("utensils", 22, "#0F9B53")}</div>
            <div class="wc-title">${t("welcome.card5.title")}</div>
            <div class="wc-desc">${t("welcome.card5.desc")}</div>
            <div class="wc-link" style="color:#0F9B53;">${t("welcome.card5.link")} <span>→</span></div>
          </div>

          <div class="welcome-card" data-pane="chat">
            <div class="wc-icon" style="background:rgba(239,58,71,0.1);color:#EF3A47;">${iconSvg("sparkles", 22, "#EF3A47")}</div>
            <div class="wc-title">${t("welcome.card6.title")}</div>
            <div class="wc-desc">${t("welcome.card6.desc")}</div>
            <div class="wc-link">${t("welcome.card6.link")} <span>→</span></div>
          </div>
        </div>

        <div class="feedback-box">
          <div class="fb-icon">${iconSvg("message", 24, "var(--accent-2)")}</div>
          <div style="flex:1;">
            <div class="fb-title">${t("welcome.feedbackTitle")}</div>
            <div class="fb-text">${t("welcome.feedbackText")}</div>
          </div>
          <button class="welcome-card" data-pane="chat" style="padding:10px 18px;margin:0;border-color:var(--accent-2);color:var(--accent-2);font-weight:700;font-size:13px;border-radius:999px;background:#fff;display:inline-flex;align-items:center;gap:6px;">
            ${iconSvg("sparkles", 15, "currentColor")} ${t("welcome.askKibito")}
          </button>
        </div>
      `;

      container.querySelectorAll("[data-pane]").forEach((b) =>
        b.addEventListener("click", () => selectPane((b as HTMLElement).dataset.pane!))
      );
    }

    // ================= MEET KIBO =================
    function renderPrinciplesPane(container: HTMLElement) {
      const VALUE_COLORS: Record<string, string> = { Passion: "#EF3A47", Ambition: "#4594F4", Trust: "#B8860B", Help: "#0F9B53" };
      const esgDocs = docsByTitles(["Kibo Ventures ESG Report 2025"]);
      container.innerHTML =
        pageHeader("meetkibo-principles", "compass", t("nav.meetkibo_principles"), t("principles.subtitle")) +
        `<h2 style="font-family:'Space Grotesk',sans-serif;font-size:16px;font-weight:600;margin:0 0 4px;">${t("principles.manifesto")}</h2>
         <div class="pullquote">${t("principles.pullquote")}</div>
         <p class="principle-p">${t("principles.p1")}</p>
         <p class="principle-p">${t("principles.p2")}</p>
         <p class="principle-p">${t("principles.p3")}</p>
         <p class="principle-p">${t("principles.p4")}</p>
         <div class="values-row">${Object.entries(VALUE_COLORS).map(([v, c]) => `<span class="value-badge" style="background:${c}1a;color:${c}">${v}</span>`).join("")}</div>

         <div class="vision-card">
           <div class="vc-label">${t("principles.visionLabel")}</div>
           <div class="vc-text">${t("principles.visionText")}</div>
         </div>

         <div class="principle-columns">
           <div class="principle-col">
             <h3>${t("principles.col1Title")}</h3>
             <ul class="principle-list">
               <li><span class="chk">✓</span>${t("principles.col1.li1")}</li>
               <li><span class="chk">✓</span>${t("principles.col1.li2")}</li>
               <li><span class="chk">✓</span>${t("principles.col1.li3")}</li>
               <li><span class="chk">✓</span>${t("principles.col1.li4")}</li>
               <li><span class="chk">✓</span>${t("principles.col1.li5")}</li>
               <li><span class="chk">✓</span>${t("principles.col1.li6")}</li>
               <li><span class="chk">✓</span>${t("principles.col1.li7")}</li>
             </ul>
           </div>
           <div class="principle-col">
             <h3>${t("principles.col2Title")}</h3>
             <ul class="principle-list">
               <li><span class="chk">✓</span>${t("principles.col2.li1")}</li>
               <li><span class="chk">✓</span>${t("principles.col2.li2")}</li>
               <li><span class="chk">✓</span>${t("principles.col2.li3")}</li>
               <li><span class="chk">✓</span>${t("principles.col2.li4")}</li>
               <li><span class="chk">✓</span>${t("principles.col2.li5")}</li>
               <li><span class="chk">✓</span>${t("principles.col2.li6")}</li>
               <li><span class="chk">✓</span>${t("principles.col2.li7")}</li>
             </ul>
           </div>
         </div>

         <h2 style="font-family:'Space Grotesk',sans-serif;font-size:16px;font-weight:600;margin:34px 0 4px;">${t("principles.sustainability")}</h2>
         <p class="principle-p">${t("principles.sustain1")}</p>
         <p class="principle-p">${t("principles.sustain2")}</p>
         ${esgDocs.length ? `<div class="doc-grid" style="max-width:170px;">${esgDocs.map((d) => docCard(d)).join("")}</div>` : ""}`;
      bindBreadcrumb(container);
    }
    function renderTeamPane(container: HTMLElement) {
      container.innerHTML =
        pageHeader("meetkibo-team", "users", t("nav.meetkibo_team"), t("team.subtitle")) +
        `<img class="hero-photo" src="${esc((DATA as any).team_photo_url)}" alt="${esc(t("team.photoAlt"))}">
         <div class="filterbar"><input class="search-input" id="p-search" placeholder="${esc(t("common.searchNamePosition"))}"></div>
         <div class="tablewrap"><table class="ntable"><thead><tr><th>${t("th.name")}</th><th>${t("th.position")}</th><th>${t("th.contact")}</th></tr></thead><tbody id="p-tbody"></tbody></table></div>`;
      bindBreadcrumb(container);
      function update() {
        const q = (container.querySelector("#p-search") as HTMLInputElement).value.trim();
        const rows = (DATA.team as any[]).filter((p) => matches(p, q, ["name", "position"]));
        container.querySelector("#p-tbody")!.innerHTML = rows
          .map(
            (p) =>
              `<tr><td><div class="namecell">${avatar(p.name, p.photo_url)}${esc(p.name)}</div></td><td>${esc(p.position)}</td><td>${p.linkedin_url ? `<a href="${esc(p.linkedin_url)}" target="_blank" rel="noopener">LinkedIn ↗</a>` : p.email || ""}</td></tr>`
          )
          .join("");
      }
      container.querySelector("#p-search")!.addEventListener("input", update);
      update();
    }
    function renderAlumniPane(container: HTMLElement) {
      container.innerHTML =
        pageHeader("meetkibo-alumni", "award", t("alumni.title"), t("alumni.subtitle")) +
        `<div class="tablewrap"><table class="ntable"><thead><tr><th>${t("th.name")}</th><th>${t("th.currently")}</th><th></th></tr></thead><tbody>${(DATA.alumni as any[])
          .map(
            (p) =>
              `<tr><td><div class="namecell">${avatar(p.name)}${esc(p.name)}</div></td><td>${esc(p.currently)}</td><td>${p.linkedin_url ? `<a href="${esc(p.linkedin_url)}" target="_blank" rel="noopener">LinkedIn ↗</a>` : ""}</td></tr>`
          )
          .join("")}</tbody></table></div>`;
      bindBreadcrumb(container);
    }
    function renderPortfolioPane(container: HTMLElement) {
      const sectors = uniqueSorted((DATA.portfolio_founders as any[]).map((p) => p.sector)) as string[];
      const funds = uniqueSorted((DATA.portfolio_founders as any[]).map((p) => p.fund)) as string[];
      const locations = uniqueSorted((DATA.portfolio_founders as any[]).map((p) => p.location)) as string[];
      container.innerHTML =
        pageHeader("meetkibo-portfolio", "rocket", t("nav.meetkibo_portfolio"), t("portfolio.subtitle")) +
        `<div class="filterbar"><input class="search-input" id="p-search" placeholder="${esc(t("common.searchNameCompany"))}">
          <select class="select" id="p-sector">${optsHtml(sectors, t("common.allSectors"))}</select>
          <select class="select" id="p-fund">${optsHtml(funds, t("common.allFunds"))}</select>
          <select class="select" id="p-location">${optsHtml(locations, t("common.allLocations"))}</select></div>
         <div class="filter-result-count" id="p-count"></div>
         <div class="tablewrap"><table class="ntable"><thead><tr><th>${t("th.founder")}</th><th>${t("th.company")}</th><th>${t("th.sector")}</th><th>${t("th.fund")}</th><th>${t("th.location")}</th></tr></thead><tbody id="p-tbody"></tbody></table></div>`;
      bindBreadcrumb(container);
      function update() {
        const q = (container.querySelector("#p-search") as HTMLInputElement).value.trim();
        const sector = (container.querySelector("#p-sector") as HTMLSelectElement).value;
        const fund = (container.querySelector("#p-fund") as HTMLSelectElement).value;
        const location = (container.querySelector("#p-location") as HTMLSelectElement).value;
        const rows = (DATA.portfolio_founders as any[]).filter(
          (p) => matches(p, q, ["name", "company"]) && (!sector || p.sector === sector) && (!fund || p.fund === fund) && (!location || p.location === location)
        );
        container.querySelector("#p-count")!.textContent = `${rows.length} ${t("common.of")} ${DATA.portfolio_founders.length} founders`;
        container.querySelector("#p-tbody")!.innerHTML =
          rows
            .map(
              (p) =>
                `<tr><td><div class="namecell">${avatar(p.name)}${p.linkedin_url ? `<a href="${esc(p.linkedin_url)}" target="_blank" rel="noopener">${esc(p.name)} ↗</a>` : esc(p.name)}</div></td><td><div class="namecell">${p.logo_url ? `<img class="company-logo" src="${esc(p.logo_url)}" alt="${esc(p.company)}">` : ""}${esc(p.company)}</div></td><td>${badge(p.sector)}</td><td>${esc(p.fund)}</td><td>${esc(p.location)}</td></tr>`
            )
            .join("") || `<tr><td colspan="5" style="color:var(--text-lighter);text-align:center;padding:20px;">${t("common.noResults")}</td></tr>`;
      }
      ["#p-search", "#p-sector", "#p-fund", "#p-location"].forEach((sel) => container.querySelector(sel)!.addEventListener("input", update));
      update();
    }

    // ================= RED PROFESIONAL =================
    // ---------- Request intro modal ----------
    function ensureIntroModal() {
      let modal = document.getElementById("intro-modal");
      if (modal) return modal;
      modal = document.createElement("div");
      modal.id = "intro-modal";
      modal.className = "modal-backdrop";
      modal.innerHTML = `<div class="modal-card" role="dialog" aria-modal="true" style="max-width:420px;">
        <button class="modal-close" id="intro-modal-close" aria-label="Cerrar">${iconSvg("x", 18)}</button>
        <div class="modal-body" id="intro-modal-body"></div>
      </div>`;
      document.body.appendChild(modal);
      modal.addEventListener("click", (e) => {
        if (e.target === modal) closeIntroModal();
      });
      modal.querySelector("#intro-modal-close")!.addEventListener("click", closeIntroModal);
      document.addEventListener("keydown", (e) => {
        if (e.key === "Escape") closeIntroModal();
      });
      return modal;
    }
    function closeIntroModal() {
      document.getElementById("intro-modal")?.classList.remove("open");
    }
    function openIntroModal(contactLabel: string) {
      const modal = ensureIntroModal();
      const body = modal.querySelector("#intro-modal-body") as HTMLElement;
      body.innerHTML = `
        <h2 class="modal-title">${t("intro.title")}</h2>
        <p style="font-size:13.5px;color:var(--text-light);margin:-4px 0 16px;">${t("intro.contactLabel")} <strong>${esc(contactLabel)}</strong></p>
        <form id="intro-form">
          <label class="intro-label">${t("intro.yourName")}</label>
          <input class="intro-input" name="founder_name" required>
          <label class="intro-label">${t("intro.startup")}</label>
          <input class="intro-input" name="startup_name">
          <label class="intro-label">${t("intro.yourEmail")}</label>
          <input class="intro-input" type="email" name="founder_email">
          <label class="intro-label">${t("intro.reason")}</label>
          <textarea class="intro-input" name="reason" rows="3" required></textarea>
          <button type="submit" class="modal-book-btn" style="margin-top:6px;">${iconSvg("mail", 15)}${t("intro.submit")}</button>
        </form>
      `;
      const form = body.querySelector("#intro-form") as HTMLFormElement;
      form.addEventListener("submit", async (e) => {
        e.preventDefault();
        const fd = new FormData(form);
        const submitBtn = form.querySelector('button[type="submit"]') as HTMLButtonElement;
        submitBtn.disabled = true;
        submitBtn.innerHTML = t("common.sending");
        try {
          const res = await fetch(`${API_BASE}/api/request-intro`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              founder_name: fd.get("founder_name"),
              startup_name: fd.get("startup_name"),
              founder_email: fd.get("founder_email"),
              reason: fd.get("reason"),
              contact_requested: contactLabel,
            }),
          });
          const data = await res.json();
          if (!res.ok || data.error) throw new Error(data.error || "Error desconocido");
          body.innerHTML = `<div style="text-align:center;padding:16px 0;">${iconSvg(
            "check",
            34,
            "var(--accent-green)"
          )}<h2 class="modal-title" style="margin-top:12px;">${t("intro.success.title")}</h2><p style="color:var(--text-light);font-size:13.5px;">${t(
            "intro.success.text",
            { contact: esc(contactLabel) }
          )}</p></div>`;
        } catch (err) {
          submitBtn.disabled = false;
          submitBtn.innerHTML = `${iconSvg("mail", 15)}${t("intro.submit")}`;
          let errEl = body.querySelector(".intro-error") as HTMLElement;
          if (!errEl) {
            errEl = document.createElement("div");
            errEl.className = "intro-error";
            form.prepend(errEl);
          }
          errEl.textContent = t("common.error");
        }
      });
      modal.classList.add("open");
    }

    const NETWORK_CONFIG: Record<string, any> = {
      "network-vc": {
        icon: "trending-up",
        titleKey: "network.vc.title",
        rows: DATA.vcs,
        filters: ["stage_focus", "hq_country"],
        cols: [
          [(r: any) => `<div class="namecell">${avatar(r.company)}${esc(r.company)}</div>`, "th.fund2"],
          [(r: any) => badge(r.sector), "th.sector"],
          [(r: any) => badge(r.stage_focus, "s:" + r.stage_focus), "th.stage"],
          ["hq_country", "th.hqCountry"],
          ["geo_focus", "th.geoFocus"],
        ],
        label: (r: any) => r.company,
      },
      "network-vd": {
        icon: "credit-card",
        titleKey: "network.vd.title",
        rows: DATA.venture_debt,
        filters: ["stage"],
        cols: [
          [(r: any) => `<div class="namecell">${avatar(r.name)}${esc(r.name)}</div>`, "th.name"],
          [(r: any) => badge(r.stage, "s:" + r.stage), "th.stage"],
          [(r: any) => (r.min_ticket && r.max_ticket ? fmtMoney(r.min_ticket) + " – " + fmtMoney(r.max_ticket) : "—"), "th.ticket"],
        ],
        label: (r: any) => r.name,
      },
      "network-pf": {
        icon: "landmark",
        titleKey: "network.pf.title",
        rows: DATA.public_funding,
        filters: ["type"],
        cols: [
          ["name", "th.name"],
          [(r: any) => badge(r.type), "th.type"],
          ["sector", "th.sector"],
          ["notes", "th.notes"],
        ],
        label: (r: any) => r.name,
      },
      "network-legal": {
        icon: "scale",
        titleKey: "network.legal.title",
        rows: DATA.legal_advisors,
        filters: [],
        cols: [
          [(r: any) => `<div class="namecell">${avatar(r.team_lead)}${esc(r.team_lead)}</div>`, "th.name"],
          ["company", "th.lawFirm"],
          ["position", "th.position"],
          [(r: any) => badge(r.specialization), "th.specialization"],
        ],
        label: (r: any) => `${r.team_lead} (${r.company})`,
      },
      "network-rec": {
        icon: "target",
        titleKey: "network.rec.title",
        rows: DATA.recruiters,
        filters: ["type"],
        cols: [
          [(r: any) => `<div class="namecell">${avatar(r.name)}${esc(r.name)}</div>`, "th.name"],
          ["company", "th.company"],
          [(r: any) => badge(r.type), "th.type"],
        ],
        label: (r: any) => `${r.name} (${r.company})`,
      },
      "network-press": {
        icon: "newspaper",
        titleKey: "network.press.title",
        rows: DATA.press_media,
        filters: ["type"],
        cols: [
          ["company", "th.media"],
          [(r: any) => badge(r.type), "th.type"],
          ["contact_name", "th.contact"],
          ["position", "th.position"],
        ],
        label: (r: any) => `${r.contact_name} (${r.company})`,
      },
      "network-adv": {
        icon: "lightbulb",
        titleKey: "network.adv.title",
        rows: DATA.advisors,
        filters: [],
        cols: [
          [(r: any) => `<div class="namecell">${avatar(r.name || r.company)}${esc(r.name || r.company)}</div>`, "th.name"],
          [(r: any) => (r.type || []).map((t: string) => badge(t)).join(" "), "th.type"],
          ["company", "th.company"],
        ],
        label: (r: any) => `${r.name || r.company} (${r.company})`,
      },
    };
    function cellVal(r: any, col: any) {
      return typeof col === "function" ? col(r) : esc(r[col] ?? "");
    }
    function renderNetworkPane(paneId: string, container: HTMLElement) {
      const cfg = NETWORK_CONFIG[paneId];
      const filterSelects = cfg.filters
        .map((f: string) => `<select class="select" data-filter="${f}">${optsHtml(uniqueSorted(cfg.rows.map((r: any) => r[f])) as string[], t("common.all"))}</select>`)
        .join("");
      container.innerHTML =
        pageHeader(paneId, cfg.icon, t(cfg.titleKey), t("network.subtitle", { n: String(cfg.rows.length) })) +
        `<div class="filterbar"><input class="search-input" id="p-search" placeholder="${esc(t("common.search"))}">${filterSelects}</div>
         <div class="filter-result-count" id="p-count"></div>
         <div class="tablewrap"><table class="ntable"><thead><tr>${cfg.cols.map((c: any) => `<th>${esc(t(c[1]))}</th>`).join("")}<th></th></tr></thead><tbody id="p-tbody"></tbody></table></div>`;
      bindBreadcrumb(container);
      function update() {
        const q = (container.querySelector("#p-search") as HTMLInputElement).value.trim().toLowerCase();
        const activeFilters: Record<string, string> = {};
        container.querySelectorAll("[data-filter]").forEach((sel) => {
          const v = (sel as HTMLSelectElement).value;
          if (v) activeFilters[(sel as HTMLElement).dataset.filter!] = v;
        });
        const rows = cfg.rows.filter(
          (r: any) => (!q || Object.values(r).join(" ").toLowerCase().includes(q)) && Object.entries(activeFilters).every(([k, v]) => r[k] === v)
        );
        container.querySelector("#p-count")!.textContent = `${rows.length} ${t("common.of")} ${cfg.rows.length}`;
        container.querySelector("#p-tbody")!.innerHTML =
          rows
            .map(
              (r: any, i: number) =>
                `<tr>${cfg.cols.map((c: any) => `<td>${cellVal(r, c[0])}</td>`).join("")}<td><button class="request-intro-btn" data-idx="${i}">${iconSvg(
                  "mail",
                  13
                )}${t("th.requestIntro")}</button></td></tr>`
            )
            .join("") || `<tr><td colspan="${cfg.cols.length + 1}" style="color:var(--text-lighter);text-align:center;padding:20px;">${t("common.noResults")}</td></tr>`;
        container.querySelectorAll(".request-intro-btn").forEach((btn) =>
          btn.addEventListener("click", () => {
            const i = Number((btn as HTMLElement).dataset.idx);
            openIntroModal(cfg.label(rows[i]));
          })
        );
      }
      container.querySelector("#p-search")!.addEventListener("input", update);
      container.querySelectorAll("[data-filter]").forEach((sel) => sel.addEventListener("input", update));
      update();
    }

    function renderOtherRequestPane(container: HTMLElement) {
      container.innerHTML =
        pageHeader("network-other", "message", t("nav.network_other"), t("other.subtitle")) +
        `<div class="callout"><span class="ic" style="color:var(--accent);">${iconSvg("info", 20)}</span><div>${t("other.callout")}</div></div>
         <div style="max-width:480px;">
           <form id="other-request-form">
             <label class="intro-label">${t("intro.yourName")}</label>
             <input class="intro-input" name="founder_name" required>
             <label class="intro-label">${t("intro.startup")}</label>
             <input class="intro-input" name="startup_name">
             <label class="intro-label">${t("intro.yourEmail")}</label>
             <input class="intro-input" type="email" name="founder_email">
             <label class="intro-label">${t("other.whatNeed")}</label>
             <input class="intro-input" name="contact_requested" placeholder="${esc(t("other.whatNeedPlaceholder"))}" required>
             <label class="intro-label">${t("other.tellMore")}</label>
             <textarea class="intro-input" name="reason" rows="4" required></textarea>
             <button type="submit" class="modal-book-btn" style="margin-top:14px;">${iconSvg("mail", 15)}${t("intro.submit")}</button>
           </form>
         </div>`;
      bindBreadcrumb(container);
      const form = container.querySelector("#other-request-form") as HTMLFormElement;
      form.addEventListener("submit", async (e) => {
        e.preventDefault();
        const fd = new FormData(form);
        const submitBtn = form.querySelector('button[type="submit"]') as HTMLButtonElement;
        submitBtn.disabled = true;
        submitBtn.innerHTML = t("common.sending");
        try {
          const res = await fetch(`${API_BASE}/api/request-intro`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              founder_name: fd.get("founder_name"),
              startup_name: fd.get("startup_name"),
              founder_email: fd.get("founder_email"),
              contact_requested: fd.get("contact_requested"),
              reason: fd.get("reason"),
            }),
          });
          const data = await res.json();
          if (!res.ok || data.error) throw new Error(data.error || "Error desconocido");
          form.parentElement!.innerHTML = `<div style="text-align:center;padding:30px 0;">${iconSvg(
            "check",
            34,
            "var(--accent-green)"
          )}<h2 style="font-family:'Space Grotesk',sans-serif;margin:12px 0 4px;">${t("other.success.title")}</h2><p style="color:var(--text-light);font-size:13.5px;">${t(
            "other.success.text"
          )}</p></div>`;
        } catch (err) {
          submitBtn.disabled = false;
          submitBtn.innerHTML = `${iconSvg("mail", 15)}${t("intro.submit")}`;
          let errEl = form.querySelector(".intro-error") as HTMLElement;
          if (!errEl) {
            errEl = document.createElement("div");
            errEl.className = "intro-error";
            form.prepend(errEl);
          }
          errEl.textContent = t("common.error");
        }
      });
    }

    // ================= GUÍAS =================
    const GUIDE_CONFIG: Record<string, any> = {
      "guides-reporting": {
        icon: "book-open",
        title: "How can I improve my reporting skills",
        kc: ["How can I improve my reporting skills"],
        docs: [
          "Kibo Excel Reporting Template",
          "Kibo Mail Reporting Template",
          "How can I improve my reporting skills (guía)",
          "Belvo Reporting Example",
          "Innovamat Reporting Example",
          "Exoticca Reporting Board (Excel)",
          "TIER Management Accounts (Excel)",
        ],
      },
      "guides-board": {
        icon: "users",
        title: "How to do first-class board meetings",
        kc: ["How to do first-class board meetings"],
        docs: ["Kibo Board Deck Template (PPTX)", "Kibo Board Deck Template (PDF)", "How to do first-class board meetings (guía)", "Creandum Board Deck Template"],
      },
      "guides-pitch": {
        icon: "file-text",
        title: "Your Guide to a Winning Deck (Series A/B)",
        kc: ["Your Guide to a Winning Deck (Series A/B)"],
        docs: ["Kibo Pitch Deck Template (PPTX)", "Kibo Pitch Deck Template (PDF)", "Your Guide to a Winning Deck (guía)"],
      },
      "guides-fund": {
        icon: "trending-up",
        title: "How to nail your new round",
        kc: ["How to nail your new round", "How to nail your Series A (Aquilino Peña presentation)"],
        docs: ["How to nail your new round (guía)", "How to nail your Series A (Aquilino)", "Venture Capital 101"],
      },
      "guides-inst": {
        icon: "compass",
        titleKey: "nav.guides_inst",
        kc: ["Our Principles"],
        docs: ["WELCOME TO THE KIBO FAMILY", "Sustainability & Governance", "Kibo Ventures ESG Report 2025", "Kibo Ventures in a nutshell", "AI Repository", "Our top recommendations for you"],
      },
    };
    // Reporting y Board Meetings tienen su propia estructura (como en las
    // páginas originales de Notion), así que no usan el layout genérico.
    delete GUIDE_CONFIG["guides-reporting"];
    delete GUIDE_CONFIG["guides-board"];
    delete GUIDE_CONFIG["guides-pitch"];
    delete GUIDE_CONFIG["guides-fund"];

    function renderFundPane(container: HTMLElement) {
      const doc = docsByTitles(["How to nail your new round (guía)"]);
      const sectionTitle = (t: string) => `<h3 style="font-family:'Space Grotesk',sans-serif;font-size:15.5px;font-weight:600;margin:26px 0 4px;">${esc(t)}</h3>`;
      const subTitle = (t: string) => `<h4 style="font-size:13.5px;font-weight:700;margin:16px 0 8px;color:var(--text);">${esc(t)}</h4>`;
      const numbered = (items: string[]) => `<ol class="numbered-list">${items.map((i) => `<li>${esc(i)}</li>`).join("")}</ol>`;
      const dataRoom: [string, string[]][] = [
        ["Company Summary", ["One Pager", "Deck", "Case study"]],
        ["Company documents", ["Cap table", "Convertible notes", "Shareholder agreements", "Incorporation documents"]],
        ["Financials & traction", ["Budget", "Financial projections", "Historicals", "Unit economics"]],
        ["Clients", ["Closed contracts", "Pipeline", "Cohorts & usage data"]],
        ["Growth drivers", ["Growth plan", "Flywheel", "New business lines & M&A"]],
        ["Market", ["Detailed market opportunity", "Competitive analysis"]],
        ["Team & organization", ["Team structure", "Detailed leadership team description & bios", "ESOPs allocation", "Culture & Employee satisfaction"]],
        ["Legal", ["Tech & security agreements", "Patents / Trademarks", "Policies", "Other relevant legal docs"]],
      ];
      container.innerHTML =
        pageHeader("guides-fund", "trending-up", t("guides.fund.title"), "") +
        `<div class="callout"><span class="ic" style="color:var(--accent);">${iconSvg("info", 20)}</span><div>${t("guides.fund.callout")}</div></div>
         <div class="doc-grid" style="max-width:170px;">${doc.map(docCard).join("")}</div>
         ${sectionTitle(t("guides.fund.nutshell"))}
         <div class="two-col-grid">
           <div>${subTitle("Pitch Deck")}${numbered(["Vision", "Problem", "Solution/Product", "Business Model", "Market Size", "KPIs & Financials", "Team", "Competition", "Roadmap", "Deal structure"])}</div>
           <div>${subTitle("Business Plan")}${numbered(["Historicals", "Identify the main KPIs", "Make bottom-up growth assumptions", "Model the future projection", "Asses the evolution of your main KPIs", "Make a summary of your P&L, BS & CF", "Create logic and sanity checks"])}</div>
         </div>
         ${subTitle("Data Room")}
         ${dataRoom.map(([title, items]) => `<div class="dataroom-group"><div class="dg-title" style="display:flex;align-items:center;gap:6px;">${iconSvg("folder", 16, "var(--accent)")} <span>${esc(title)}</span></div><ul>${items.map((i) => `<li>${esc(i)}</li>`).join("")}</ul></div>`).join("")}`;
      bindBreadcrumb(container);
    }

    function renderPitchPane(container: HTMLElement) {
      const downloads = docsByTitles(["Kibo Pitch Deck Template (PPTX)", "Kibo Pitch Deck Template (PDF)"]);
      const sectionTitle = (t: string) => `<h3 style="font-family:'Space Grotesk',sans-serif;font-size:15.5px;font-weight:600;margin:26px 0 4px;">${esc(t)}</h3>`;
      const list = (items: string[]) => `<ul class="principle-list" style="margin-bottom:14px;">${items.map((i) => `<li><span class="chk">•</span>${i}</li>`).join("")}</ul>`;
      container.innerHTML =
        pageHeader("guides-pitch", "file-text", t("guides.pitch.title"), "") +
        `<div class="callout"><span class="ic" style="color:var(--accent);">${iconSvg("lightbulb", 20)}</span><div>${t("guides.pitch.callout")}</div></div>
         ${list([t("guides.pitch.li1"), t("guides.contactUs")])}
         ${sectionTitle(t("guides.howToUse"))}
         ${list([t("guides.pitch.li2a"), t("guides.pitch.li2b"), t("guides.copyUse")])}
         ${sectionTitle(t("guides.download"))}
         <div class="doc-grid">${downloads.map(docCard).join("")}</div>
         ${sectionTitle(t("guides.otherReads"))}
         <div class="doc-row"><a class="page-link" href="https://blog.creandum.com/creandum-series-a-deck-template-21a6df9c1ac4" target="_blank" rel="noopener"><span class="ic" style="display:inline-flex;margin-right:6px;">${iconSvg("file-text", 16)}</span>${t("guides.pitchOtherLink")} ↗</a></div>`;
      bindBreadcrumb(container);
    }

    function renderBoardPane(container: HTMLElement) {
      const downloads = docsByTitles(["Kibo Board Deck Template (PPTX)", "Kibo Board Deck Template (PDF)", "Creandum Board Deck Template"]);
      const sectionTitle = (t: string) => `<h3 style="font-family:'Space Grotesk',sans-serif;font-size:15.5px;font-weight:600;margin:26px 0 4px;">${esc(t)}</h3>`;
      const list = (items: string[]) => `<ul class="principle-list" style="margin-bottom:14px;">${items.map((i) => `<li><span class="chk">•</span>${i}</li>`).join("")}</ul>`;
      container.innerHTML =
        pageHeader("guides-board", "users", t("guides.board.title"), "") +
        `<div class="callout"><span class="ic" style="color:var(--accent);">${iconSvg("info", 20)}</span><div>${t("guides.board.callout")}</div></div>
         ${list([t("guides.board.li1"), t("guides.contactUs")])}
         ${sectionTitle(t("guides.howToUse"))}
         ${list([t("guides.board.li2a"), t("guides.board.li2b"), t("guides.board.li3"), t("guides.copyUse")])}
         ${sectionTitle(t("guides.download"))}
         <div class="doc-grid">${downloads.map(docCard).join("")}</div>
         ${sectionTitle(t("guides.otherReads"))}
         <div class="doc-row"><a class="page-link" href="https://www.linkedin.com/feed/update/urn:li:activity:7132773038181212160/" target="_blank" rel="noopener"><span class="ic" style="display:inline-flex;margin-right:6px;">${iconSvg("file-text", 16)}</span>${t("guides.boardOtherLink")} ↗</a></div>`;
      bindBreadcrumb(container);
    }

    const DOC_CAPTIONS: Record<string, { es: string; en: string }> = {
      "Kibo Excel Reporting Template": { es: "Plantilla mensual lista para rellenar con tus KPIs y financials.", en: "Monthly template ready to fill in with your KPIs and financials." },
      "Kibo Mail Reporting Template": { es: "Guion de email para tu reporting mensual a inversores.", en: "Email script for your monthly investor reporting." },
      "Belvo Reporting Example": { es: "Cómo estructura Belvo su reporting mensual a inversores.", en: "How Belvo structures its monthly investor reporting." },
      "Innovamat Reporting Example": { es: "El enfoque de reporting de Innovamat, paso a paso.", en: "Innovamat's reporting approach, step by step." },
      "Exoticca Reporting Board (Excel)": { es: "Cuadro de mando financiero real de Exoticca.", en: "Exoticca's real financial dashboard." },
      "TIER Management Accounts (Excel)": { es: "Ejemplo de management accounts mensuales de TIER.", en: "Example of TIER's monthly management accounts." },
    };
    function docCaption(title: string): string | undefined {
      const c = DOC_CAPTIONS[title];
      return c ? c[getLang()] : undefined;
    }
    function reportSection(icon: string, title: string, desc: string, docs: any[]) {
      return `<section class="report-section">
        <div class="report-section-head">
          <span class="report-section-icon">${iconSvg(icon, 16, "var(--accent)")}</span>
          <div><h3 class="report-section-title">${esc(title)}</h3><p class="report-section-desc">${esc(desc)}</p></div>
        </div>
        <div class="doc-grid">${docs.map((d) => docCard(d, docCaption(d.title))).join("")}</div>
      </section>`;
    }
    function renderReportingPane(container: HTMLElement) {
      const kiboTemplates = docsByTitles(["Kibo Excel Reporting Template", "Kibo Mail Reporting Template"]);
      const emailExamples = docsByTitles(["Belvo Reporting Example", "Innovamat Reporting Example"]);
      const kpiExamples = docsByTitles(["Exoticca Reporting Board (Excel)", "TIER Management Accounts (Excel)"]);
      container.innerHTML =
        pageHeader("guides-reporting", "book-open", t("guides.reporting.title"), "") +
        `<div class="callout"><span class="ic" style="color:var(--accent);">${iconSvg("info", 20)}</span><div>${t("guides.reporting.callout")}</div></div>
         <p class="principle-p">${t("guides.reporting.lead")}</p>
         ${reportSection("file-text", t("guides.reporting.kiboTemplates"), t("guides.reporting.kiboTemplatesDesc"), kiboTemplates)}
         ${reportSection("mail", t("guides.reporting.emailExamples"), t("guides.reporting.emailExamplesDesc"), emailExamples)}
         ${reportSection("trending-up", t("guides.reporting.kpiExamples"), t("guides.reporting.kpiExamplesDesc"), kpiExamples)}`;
      bindBreadcrumb(container);
    }

    function renderGuidePane(paneId: string, container: HTMLElement) {
      const cfg = GUIDE_CONFIG[paneId];
      const chunks = (DATA.knowledge_chunks as any[]).filter((c) => cfg.kc.includes(c.source_page));
      const docs = docsByTitles(cfg.docs);
      container.innerHTML =
        pageHeader(paneId, cfg.icon, t(cfg.titleKey), "") +
        (docs.length ? `<div class="doc-grid">${docs.map(docCard).join("")}</div>` : "") +
        chunks.map((c) => `<div class="callout"><span class="ic" style="color:var(--accent);">${iconSvg("lightbulb", 20)}</span><div><b>${esc(c.section)}</b><br>${esc(c.content)}</div></div>`).join("");
      bindBreadcrumb(container);
    }

    function vc101List(items: any[]) {
      return `<div class="vc101-list">${items
        .map((d) => {
          const ext = (d.file_url.split(".").pop() || "").toLowerCase();
          const style = EXT_STYLE[ext] || { color: "var(--text-lighter)", icon: "file-text" };
          const fname = d.file_url.split("/").pop();
          return `<a class="vc101-item" href="${esc(d.file_url)}" download="${esc(fname)}">
            <span class="vc101-item-icon" style="color:${style.color};">${iconSvg(style.icon, 16)}</span>
            <span class="vc101-item-title">${esc(d.title)}</span>
            <span class="vc101-item-ext" style="background:${style.color};">${esc(ext.toUpperCase())}</span>
            <span class="vc101-item-download">${iconSvg("download", 15)}</span>
          </a>`;
        })
        .join("")}</div>`;
    }
    function vc101Section(icon: string, title: string, desc: string, items: any[]) {
      return `<section class="report-section">
        <div class="report-section-head">
          <span class="report-section-icon">${iconSvg(icon, 16, "var(--accent)")}</span>
          <div><h3 class="report-section-title">${esc(title)}</h3><p class="report-section-desc">${esc(desc)}</p></div>
        </div>
        ${vc101List(items)}
      </section>`;
    }
    function renderVC101Pane(container: HTMLElement) {
      const vc = DATA.vc101 as any;
      container.innerHTML =
        pageHeader("guides-vc101", "trending-up", t("guides.vc101.title"), t("guides.vc101.subtitle")) +
        `<p class="principle-p">${t("guides.vc101.intro")}</p>
         ${vc101Section("book-open", t("guides.vc101.sessions"), t("guides.vc101.sessionsDesc"), vc.sessions)}
         ${vc101Section("file-text", t("guides.vc101.caselettes"), t("guides.vc101.caselettesDesc"), vc.caselettes)}
         ${vc101Section("lightbulb", t("guides.vc101.readings"), t("guides.vc101.readingsDesc"), vc.readings)}`;
      bindBreadcrumb(container);
    }

    // ================= RESTAURANTES =================
    function ensureRestaurantModal() {
      let modal = document.getElementById("restaurant-modal");
      if (modal) return modal;
      modal = document.createElement("div");
      modal.id = "restaurant-modal";
      modal.className = "modal-backdrop";
      modal.innerHTML = `<div class="modal-card" role="dialog" aria-modal="true">
        <button class="modal-close" id="modal-close-btn" aria-label="Cerrar">${iconSvg("x", 18)}</button>
        <div class="modal-gallery">
          <img class="modal-gallery-main" id="modal-gallery-main" src="" alt="">
          <div class="modal-gallery-thumbs" id="modal-gallery-thumbs"></div>
        </div>
        <div class="modal-body" id="modal-body"></div>
      </div>`;
      document.body.appendChild(modal);
      modal.addEventListener("click", (e) => {
        if (e.target === modal) closeRestaurantModal();
      });
      modal.querySelector("#modal-close-btn")!.addEventListener("click", closeRestaurantModal);
      document.addEventListener("keydown", (e) => {
        if (e.key === "Escape") closeRestaurantModal();
      });
      return modal;
    }
    function closeRestaurantModal() {
      document.getElementById("restaurant-modal")?.classList.remove("open");
    }
    function openRestaurantModal(r: any) {
      const modal = ensureRestaurantModal();
      const photos: string[] = r.photos && r.photos.length ? r.photos : [];
      const mainImg = modal.querySelector("#modal-gallery-main") as HTMLImageElement;
      const thumbs = modal.querySelector("#modal-gallery-thumbs") as HTMLElement;
      const gallery = modal.querySelector(".modal-gallery") as HTMLElement;
      if (photos.length) {
        gallery.style.display = "block";
        mainImg.src = photos[0];
        thumbs.style.display = photos.length > 1 ? "flex" : "none";
        thumbs.innerHTML = photos
          .map((p, i) => `<img src="${esc(p)}" data-i="${i}" class="modal-thumb${i === 0 ? " active" : ""}" loading="lazy">`)
          .join("");
        thumbs.querySelectorAll(".modal-thumb").forEach((t) =>
          t.addEventListener("click", () => {
            const i = Number((t as HTMLElement).dataset.i);
            mainImg.src = photos[i];
            thumbs.querySelectorAll(".modal-thumb").forEach((x) => x.classList.remove("active"));
            t.classList.add("active");
          })
        );
      } else {
        gallery.style.display = "none";
      }
      modal.querySelector("#modal-body")!.innerHTML = `
        <h2 class="modal-title">${esc(r.name)}</h2>
        <div class="modal-badges">
          ${r.cuisine ? badge(r.cuisine, "s:" + r.cuisine) : ""}
          ${r.formality ? badge(r.formality) : ""}
          ${r.price_range ? `<span class="modal-price">${esc(r.price_range)}</span>` : ""}
        </div>
        ${
          r.recommendation
            ? `<div class="modal-section"><div class="modal-section-label">${iconSvg("check", 13, "var(--accent-green)")}${t("rest.whatToOrder")}</div><div class="modal-rec">${esc(r.recommendation)}</div></div>`
            : ""
        }
        <div class="modal-contact">
          ${r.address ? `<div class="modal-contact-row">${iconSvg("map-pin", 14)}<span>${esc(r.address)}</span></div>` : ""}
          ${r.phone ? `<div class="modal-contact-row">${iconSvg("phone", 14)}<span>${esc(r.phone)}</span></div>` : ""}
          ${r.email ? `<div class="modal-contact-row">${iconSvg("mail", 14)}<a href="mailto:${esc(r.email)}">${esc(r.email)}</a></div>` : ""}
          ${r.website ? `<div class="modal-contact-row">${iconSvg("arrow-right", 14)}<a href="${esc(r.website)}" target="_blank" rel="noopener">${t("rest.website")} ↗</a></div>` : ""}
        </div>
        ${r.book_url ? `<a class="modal-book-btn" href="${esc(r.book_url)}" target="_blank" rel="noopener">${iconSvg("calendar", 15)}${t("rest.bookTable")}</a>` : ""}
      `;
      modal.classList.add("open");
    }
    function renderRestaurantCityPane(city: string, container: HTMLElement) {
      const rows0 = (DATA.restaurants as any[]).filter((r) => r.city === city);
      const formalities = uniqueSorted(rows0.map((r) => r.formality)) as string[];
      container.innerHTML =
        pageHeader("rest-" + city, "map-pin", city, t("rest.subtitle", { n: String(rows0.length), city: esc(city) })) +
        `<div class="filterbar"><input class="search-input" id="p-search" placeholder="${esc(t("common.searchNameCuisine"))}">
          <select class="select" id="p-formality">${optsHtml(formalities, t("common.allFormality"))}</select></div>
         <div class="filter-result-count" id="p-count"></div>
         <div class="rest-grid" id="p-grid"></div>`;
      bindBreadcrumb(container);
      function update() {
        const q = (container.querySelector("#p-search") as HTMLInputElement).value.trim();
        const formality = (container.querySelector("#p-formality") as HTMLSelectElement).value;
        const rows = rows0.filter((r) => matches(r, q, ["name", "cuisine"]) && (!formality || r.formality === formality));
        container.querySelector("#p-count")!.textContent = `${rows.length} ${t("common.of")} ${rows0.length}`;
        container.querySelector("#p-grid")!.innerHTML =
          rows
            .map((r) => {
              const c = hashColor(r.cuisine || r.name);
              const photos: string[] = r.photos && r.photos.length ? r.photos : [];
              const visual = photos.length
                ? `<img class="rest-visual-img" src="${esc(photos[0])}" alt="${esc(r.name)}" loading="lazy">`
                : `<div class="rest-visual" style="background:linear-gradient(135deg,${c}22,${c}08);color:${c};">${cuisineIcon(r.cuisine)}</div>`;
              const photoBadge = photos.length > 1 ? `<span class="rest-photo-count">${iconSvg("images", 11)}${photos.length}</span>` : "";
              return `<div class="rest-card" data-name="${esc(r.name)}">
                <div class="rest-visual-wrap">${visual}${photoBadge}</div>
                <div class="rest-body">
                  <div class="rest-name">${esc(r.name)}</div>
                  <div class="rest-meta">${r.cuisine ? esc(r.cuisine) + " · " : ""}${esc(r.price_range || "")}</div>
                  ${r.formality ? badge(r.formality) : ""}
                </div>
              </div>`;
            })
            .join("") || `<div style="color:var(--text-lighter);padding:20px;">${t("common.noResultsPeriod")}</div>`;
        container.querySelectorAll(".rest-card").forEach((el, i) => el.addEventListener("click", () => openRestaurantModal(rows[i])));
      }
      container.querySelector("#p-search")!.addEventListener("input", update);
      container.querySelector("#p-formality")!.addEventListener("input", update);
      update();
    }

    // ================= PERKS =================
    function renderPerksPane(container: HTMLElement) {
      const getproven = (DATA.perks as any[]).find((p) => p.name.includes("GetProven") || p.name.includes("Proven"));
      const sectionTitle = (title: string) => `<h3 style="font-family:'Space Grotesk',sans-serif;font-size:15.5px;font-weight:600;margin:26px 0 4px;">${esc(title)}</h3>`;
      const subTitle = (title: string) => `<h4 style="font-size:13.5px;font-weight:700;margin:16px 0 8px;color:var(--text);">${esc(title)}</h4>`;
      container.innerHTML =
        pageHeader("perks", "gift", t("perks.title"), t("perks.subtitle")) +
        // ---------- GetProven ----------
        `<section class="report-section">
          <div class="report-section-head">
            <span class="report-section-icon">${iconSvg("gift", 16, "var(--accent)")}</span>
            <div><h3 class="report-section-title">${t("perks.getproven.title")}</h3></div>
          </div>
          <div class="callout"><span class="ic" style="color:var(--accent);">${iconSvg("gift", 20)}</span><div>${t("perks.getproven.intro")}</div></div>
          ${sectionTitle(t("perks.getproven.stepsTitle"))}
          <ol class="numbered-list">
            <li><span>${t("perks.getproven.step1")}</span></li>
            <li><span>${t("perks.getproven.step2")}</span></li>
            <li><span>${t("perks.getproven.step3")}</span></li>
            <li><span>${t("perks.getproven.step4")}</span></li>
            <li><span>${t("perks.getproven.step5")}</span></li>
            <li><span>${t("perks.getproven.step6")}</span></li>
          </ol>
          ${getproven ? `<a class="modal-book-btn" style="display:inline-flex;max-width:220px;" href="${esc(getproven.url)}" target="_blank" rel="noopener">${iconSvg("arrow-right", 15)}${t("perks.getproven.openBtn")}</a>` : ""}
        </section>
        <div class="callout"><span class="ic" style="color:var(--accent-2);">${iconSvg("mail", 20)}</span><div>${t("perks.getproven", {
          email: '<a href="mailto:javierortiz@kiboventures.com">javierortiz@kiboventures.com</a>',
        })}</div></div>
        <!-- ---------- Anthropic API Credits ---------- -->
        <section class="report-section">
          <div class="report-section-head">
            <span class="report-section-icon">${iconSvg("sparkles", 16, "var(--accent)")}</span>
            <div><h3 class="report-section-title">${t("perks.anthropic.title")}</h3></div>
          </div>
          <p class="principle-p">${t("perks.anthropic.intro")}</p>
          ${subTitle(t("perks.anthropic.whatYouGet"))}
          <p class="principle-p">${t("perks.anthropic.whatYouGetText")}</p>
          ${subTitle(t("perks.anthropic.howToClaim"))}
          <p class="principle-p">${t("perks.anthropic.claimText")}</p>
          <div class="modal-rec" style="margin-bottom:14px;"><a href="https://claude.com/offers?offer_code=a85762a4-8810-4cf5-91e3-c05a35375a06" target="_blank" rel="noopener">https://claude.com/offers?offer_code=a85762a4-8810-4cf5-91e3-c05a35375a06</a></div>
          <p class="principle-p">${t("perks.anthropic.signInNote")}</p>
          <p class="principle-p">${t("perks.anthropic.separateAccountNote")}</p>
          ${subTitle(t("perks.anthropic.whatCovers"))}
          <ul class="principle-list" style="margin-bottom:14px;">
            <li><span class="chk">✓</span>Claude API</li>
            <li><span class="chk">✓</span>Claude Code</li>
            <li><span class="chk">✓</span>Claude Agent SDK</li>
          </ul>
          <p class="principle-p" style="font-style:italic;font-size:12.5px;">${t("perks.anthropic.finalNote")}</p>
        </section>`;
      bindBreadcrumb(container);
    }

    // ================= CALENDAR & EVENTS =================
    function renderCalFuturePane(container: HTMLElement) {
      container.innerHTML =
        pageHeader("cal-future", "calendar", t("cal.future.title"), "") +
        `<div class="callout"><span class="ic" style="color:var(--accent);">${iconSvg("calendar", 20)}</span><div>${t("cal.future.callout")}</div></div>`;
      bindBreadcrumb(container);
    }
    function ensureEventModal() {
      let modal = document.getElementById("event-modal");
      if (modal) return modal;
      modal = document.createElement("div");
      modal.id = "event-modal";
      modal.className = "modal-backdrop";
      modal.innerHTML = `<div class="modal-card" role="dialog" aria-modal="true">
        <button class="modal-close" id="event-modal-close" aria-label="Cerrar">${iconSvg("x", 18)}</button>
        <div class="modal-gallery">
          <img class="modal-gallery-main" id="event-modal-main" src="" alt="">
          <div class="modal-gallery-thumbs" id="event-modal-thumbs"></div>
        </div>
        <div class="modal-body" id="event-modal-body"></div>
      </div>`;
      document.body.appendChild(modal);
      modal.addEventListener("click", (e) => {
        if (e.target === modal) closeEventModal();
      });
      modal.querySelector("#event-modal-close")!.addEventListener("click", closeEventModal);
      document.addEventListener("keydown", (e) => {
        if (e.key === "Escape") closeEventModal();
      });
      return modal;
    }
    function closeEventModal() {
      document.getElementById("event-modal")?.classList.remove("open");
    }
    function openEventModal(e: any) {
      const modal = ensureEventModal();
      const photos: string[] = e.photos && e.photos.length ? e.photos : [];
      const mainImg = modal.querySelector("#event-modal-main") as HTMLImageElement;
      const thumbs = modal.querySelector("#event-modal-thumbs") as HTMLElement;
      const gallery = modal.querySelector(".modal-gallery") as HTMLElement;
      if (photos.length) {
        gallery.style.display = "block";
        mainImg.src = photos[0];
        thumbs.style.display = photos.length > 1 ? "flex" : "none";
        thumbs.innerHTML = photos
          .map((p, i) => `<img src="${esc(p)}" data-i="${i}" class="modal-thumb${i === 0 ? " active" : ""}" loading="lazy">`)
          .join("");
        thumbs.querySelectorAll(".modal-thumb").forEach((t) =>
          t.addEventListener("click", () => {
            const i = Number((t as HTMLElement).dataset.i);
            mainImg.src = photos[i];
            thumbs.querySelectorAll(".modal-thumb").forEach((x) => x.classList.remove("active"));
            t.classList.add("active");
          })
        );
      } else {
        gallery.style.display = "none";
      }
      const dateLabel = fmtEventDate(e.event_date);
      modal.querySelector("#event-modal-body")!.innerHTML = `
        <h2 class="modal-title">${esc(e.name)}</h2>
        <div class="modal-contact" style="margin-bottom:${e.description ? "16" : "0"}px;">
          ${e.location ? `<div class="modal-contact-row">${iconSvg("map-pin", 14)}<span>${esc(e.location)}</span></div>` : ""}
          ${dateLabel ? `<div class="modal-contact-row">${iconSvg("calendar", 14)}<span>${esc(dateLabel)}</span></div>` : ""}
        </div>
        ${e.description ? `<div class="modal-rec">${mdLite(loc(e, "description"))}</div>` : ""}
      `;
      modal.classList.add("open");
    }
    function renderCalHostedPane(container: HTMLElement) {
      const years = (uniqueSorted((DATA.events as any[]).map((e) => (e.event_date ? e.event_date.slice(0, 4) : null))) as string[]).sort().reverse();
      container.innerHTML =
        pageHeader("cal-hosted", "calendar", t("nav.cal_hosted"), t("cal.hosted.subtitle", { n: String(DATA.events.length) })) +
        `<div class="filterbar"><select class="select" id="p-year">${optsHtml(years, t("common.allYears"))}</select></div>
         <div class="filter-result-count" id="p-count"></div>
         <div class="rest-grid" id="p-grid"></div>`;
      bindBreadcrumb(container);
      function update() {
        const year = (container.querySelector("#p-year") as HTMLSelectElement).value;
        const rows = (DATA.events as any[])
          .filter((e) => !year || (e.event_date && e.event_date.startsWith(year)))
          .sort((a: any, b: any) => (b.event_date || "").localeCompare(a.event_date || ""));
        container.querySelector("#p-count")!.textContent = `${rows.length} ${t("common.of")} ${DATA.events.length}`;
        container.querySelector("#p-grid")!.innerHTML =
          rows
            .map((e: any) => {
              const photos: string[] = e.photos && e.photos.length ? e.photos : [];
              const c = hashColor(e.location || e.name);
              const visual = photos.length
                ? `<img class="rest-visual-img" src="${esc(photos[0])}" alt="${esc(e.name)}" loading="lazy">`
                : `<div class="rest-visual" style="background:linear-gradient(135deg,${c}22,${c}08);color:${c};">${iconSvg("calendar", 30)}</div>`;
              const photoBadge = photos.length > 1 ? `<span class="rest-photo-count">${iconSvg("images", 11)}${photos.length}</span>` : "";
              const dateLabel = fmtEventDate(e.event_date);
              return `<div class="rest-card">
                <div class="rest-visual-wrap">${visual}${photoBadge}</div>
                <div class="rest-body">
                  <div class="rest-name">${esc(e.name)}</div>
                  <div class="rest-meta">${e.location ? esc(e.location) : ""}${e.location && dateLabel ? " · " : ""}${dateLabel ? esc(dateLabel) : ""}</div>
                </div>
              </div>`;
            })
            .join("") || `<div style="color:var(--text-lighter);padding:20px;">${t("common.noResultsPeriod")}</div>`;
        container.querySelectorAll(".rest-card").forEach((el, i) => el.addEventListener("click", () => openEventModal(rows[i])));
      }
      container.querySelector("#p-year")!.addEventListener("input", update);
      update();
    }

    // ================= OTHER =================
    function renderAIRepositoryPane(container: HTMLElement) {
      const items = DATA.ai_repository as any[];
      const allTags = uniqueSorted(items.flatMap((i) => i.tags || [])) as string[];
      container.innerHTML =
        pageHeader("other-ai", "bot", t("nav.other_ai"), t("ai.subtitle")) +
        `<div class="filterbar"><input class="search-input" id="p-search" placeholder="${esc(t("common.search"))}"><select class="select" id="p-tag">${optsHtml(
          allTags,
          t("common.allTags")
        )}</select></div>
         <div class="filter-result-count" id="p-count"></div>
         <div class="ai-item-list" id="p-list"></div>`;
      bindBreadcrumb(container);
      function update() {
        const q = (container.querySelector("#p-search") as HTMLInputElement).value.trim().toLowerCase();
        const tag = (container.querySelector("#p-tag") as HTMLSelectElement).value;
        const rows = items.filter(
          (i) => (!q || (i.title + " " + (i.notes || "")).toLowerCase().includes(q)) && (!tag || (i.tags || []).includes(tag))
        );
        container.querySelector("#p-count")!.textContent = `${rows.length} ${t("common.of")} ${items.length}`;
        container.querySelector("#p-list")!.innerHTML =
          rows
            .map(
              (i) => `<div class="ai-item">
                <div class="ai-item-head">
                  ${i.url ? `<a class="ai-item-title" href="${esc(i.url)}" target="_blank" rel="noopener">${esc(i.title)} ↗</a>` : `<span class="ai-item-title">${esc(i.title)}</span>`}
                  <div class="ai-item-tags">${(i.tags || []).map((t: string) => badge(t)).join("")}</div>
                </div>
                ${i.notes ? `<p class="ai-item-notes">${esc(loc(i, "notes"))}</p>` : ""}
              </div>`
            )
            .join("") || `<div style="color:var(--text-lighter);padding:20px;">${t("common.noResultsPeriod")}</div>`;
      }
      container.querySelector("#p-search")!.addEventListener("input", update);
      container.querySelector("#p-tag")!.addEventListener("input", update);
      update();
    }
    function renderTopRecommendationsPane(container: HTMLElement) {
      const recs = DATA.top_recommendations as any[];
      const CATEGORY_ICON: Record<string, string> = { "To Read": "book-open", "To Listen": "headphones", "To Watch": "presentation" };
      const CATEGORY_LABEL: Record<string, string> = { "To Read": t("recs.toRead"), "To Listen": t("recs.toListen"), "To Watch": t("recs.toWatch") };
      const CATEGORY_DESC: Record<string, string> = {
        "To Read": t("recs.toReadDesc"),
        "To Listen": t("recs.toListenDesc"),
        "To Watch": t("recs.toWatchDesc"),
      };
      const categories = ["To Read", "To Listen", "To Watch"].filter((c) => recs.some((r) => r.category === c));
      container.innerHTML =
        pageHeader("other-recs", "lightbulb", t("nav.other_recs"), t("recs.subtitle")) +
        categories
          .map((cat) => {
            const catItems = recs.filter((r) => r.category === cat);
            return `<section class="report-section">
              <div class="report-section-head">
                <span class="report-section-icon">${iconSvg(CATEGORY_ICON[cat] || "folder", 16, "var(--accent)")}</span>
                <div><h3 class="report-section-title">${esc(CATEGORY_LABEL[cat] || cat)}</h3><p class="report-section-desc">${esc(CATEGORY_DESC[cat] || "")}</p></div>
              </div>
              ${catItems
                .map(
                  (r) =>
                    `<div class="modal-rec" style="margin-bottom:10px;"><b>${esc(r.person)}</b> ${t("recs.recommends")} <b>${esc(r.title)}</b>${
                      r.author ? " " + t("recs.by") + " " + esc(r.author) : ""
                    }.<br>${esc(loc(r, "description"))}</div>`
                )
                .join("")}
            </section>`;
          })
          .join("");
      bindBreadcrumb(container);
    }

    // ---------- registry ----------
    const RENDERERS: Record<string, (c: HTMLElement) => void> = {
      welcome: renderWelcomePane,
      meetkibo: overviewRenderer(NAV.find((n) => n.id === "meetkibo"), "compass", "nav.meetkibo", "ov.meetkibo.subtitle", (id) =>
        ({
          "meetkibo-principles": t("ov.meetkibo.principles"),
          "meetkibo-team": t("ov.people", { n: String(DATA.team.length) }),
          "meetkibo-alumni": t("ov.alumni", { n: String(DATA.alumni.length) }),
          "meetkibo-portfolio": t("ov.founders", { n: String(DATA.portfolio_founders.length) }),
        } as any)[id] || ""
      ),
      "meetkibo-principles": renderPrinciplesPane,
      "meetkibo-team": renderTeamPane,
      "meetkibo-alumni": renderAlumniPane,
      "meetkibo-portfolio": renderPortfolioPane,
      network: overviewRenderer(NAV.find((n) => n.id === "network"), "network", "nav.network", "ov.network.subtitle", (id) =>
        id === "network-other" ? t("ov.network.other") : t("ov.contacts", { n: String(NETWORK_CONFIG[id]?.rows.length || 0) })
      ),
      guides: overviewRenderer(NAV.find((n) => n.id === "guides"), "book-open", "nav.guides", "guides.subtitle", (id) =>
        id === "guides-reporting"
          ? t("ov.documents", { n: "6" })
          : id === "guides-board"
          ? t("ov.documents", { n: "3" })
          : id === "guides-pitch"
          ? t("ov.documents", { n: "2" })
          : id === "guides-fund"
          ? t("guides.checklistComplete")
          : id === "guides-vc101"
          ? t("ov.documents", { n: String((DATA.vc101 as any).sessions.length + (DATA.vc101 as any).caselettes.length + (DATA.vc101 as any).readings.length) })
          : t("ov.documents", { n: String(GUIDE_CONFIG[id]?.docs.length || 0) })
      ),
      restaurants: overviewRenderer(NAV.find((n) => n.id === "restaurants"), "utensils", "ov.restaurants.title", "ov.restaurants.subtitle", (id) =>
        t("ov.restaurants", { n: String((DATA.restaurants as any[]).filter((r) => "rest-" + r.city === id).length) })
      ),
      perks: renderPerksPane,
      calendar: overviewRenderer(NAV.find((n) => n.id === "calendar"), "calendar", "nav.calendar", "ov.calendar.subtitle", (id) =>
        id === "cal-hosted" ? t("ov.events", { n: String(DATA.events.length) }) : t("ov.pending")
      ),
      other: overviewRenderer(NAV.find((n) => n.id === "other"), "folder", "nav.other", "ov.other.subtitle", (id) =>
        id === "other-ai" ? t("ov.resources", { n: String((DATA.ai_repository as any[]).length) }) : t("ov.recommendations", { n: String((DATA.top_recommendations as any[]).length) })
      ),
    };
    Object.keys(NETWORK_CONFIG).forEach((id) => (RENDERERS[id] = (c) => renderNetworkPane(id, c)));
    RENDERERS["network-other"] = renderOtherRequestPane;
    Object.keys(GUIDE_CONFIG).forEach((id) => (RENDERERS[id] = (c) => renderGuidePane(id, c)));
    RENDERERS["guides-reporting"] = renderReportingPane;
    RENDERERS["guides-board"] = renderBoardPane;
    RENDERERS["guides-pitch"] = renderPitchPane;
    RENDERERS["guides-fund"] = renderFundPane;
    RENDERERS["guides-vc101"] = renderVC101Pane;
    REST_CITIES.forEach((city) => (RENDERERS["rest-" + city] = (c) => renderRestaurantCityPane(city, c)));
    RENDERERS["cal-future"] = renderCalFuturePane;
    RENDERERS["cal-hosted"] = renderCalHostedPane;
    RENDERERS["other-ai"] = renderAIRepositoryPane;
    RENDERERS["other-recs"] = renderTopRecommendationsPane;

    // ---------- Selector de idioma ----------
    function ensureLangSwitcher() {
      let el = document.getElementById("lang-switcher");
      if (!el) {
        el = document.createElement("div");
        el.id = "lang-switcher";
        el.className = "lang-switcher";
        document.body.appendChild(el);
      }
      // Se reconstruye por completo (en vez de reusar si ya existe) para que los
      // listeners siempre apunten al closure activo — evita quedarse enganchado a
      // un efecto obsoleto cuando React monta el componente dos veces (Strict Mode).
      el.innerHTML = `<button class="lang-btn" data-lang="es">ES</button><button class="lang-btn" data-lang="en">EN</button>`;
      el.querySelectorAll(".lang-btn").forEach((btn) =>
        btn.addEventListener("click", () => applyLang((btn as HTMLElement).dataset.lang as Lang))
      );
      return el;
    }
    function applyChatStaticText() {
      const h1 = document.getElementById("chat-h1");
      if (h1) h1.innerHTML = t("chat.titleHtml");
      const sub = document.getElementById("chat-subtitle");
      if (sub) sub.textContent = t("chat.subtitle");
      document.querySelectorAll("#chat-suggestions .suggestion-chip").forEach((chip) => {
        const key = (chip as HTMLElement).dataset.key;
        if (key) chip.textContent = t(key + "Short");
      });
      if (chatInputRef.current) chatInputRef.current.placeholder = t("chat.placeholder");
      if (chatSendRef.current) chatSendRef.current.textContent = t("common.send");
    }
    function applyLang(lang: Lang) {
      setCurrentLang(lang);
      try {
        localStorage.setItem("kibo_lang", lang);
      } catch (e) {
        // ignore
      }
      document.querySelectorAll(".lang-btn").forEach((b) => b.classList.toggle("active", (b as HTMLElement).dataset.lang === lang));
      document.documentElement.lang = lang;
      renderSidebar();
      applyChatStaticText();
      selectPane(currentPaneId);
    }
    ensureLangSwitcher();
    let initialLang: Lang = "es";
    try {
      const saved = localStorage.getItem("kibo_lang");
      if (saved === "en" || saved === "es") initialLang = saved;
    } catch (e) {
      // ignore
    }
    setCurrentLang(initialLang);
    document.querySelectorAll(".lang-btn").forEach((b) => b.classList.toggle("active", (b as HTMLElement).dataset.lang === initialLang));
    document.documentElement.lang = initialLang;
    applyChatStaticText();

    // Inicializar en la página de bienvenida (Welcome Page)
    selectPane("welcome");

    // ---------- Kibito chat ----------
    let chatHistory: any[] = [];
    function addMsg(role: "user" | "bot", text: string) {
      const el = document.createElement("div");
      el.className = "msg " + (role === "user" ? "user" : "bot");
      el.innerHTML = (role === "user" ? "" : '<div class="msg-label">Kibito</div>') + esc(text);
      chatScrollRef.current!.appendChild(el);
      chatScrollRef.current!.scrollTop = chatScrollRef.current!.scrollHeight;
      return el;
    }
    async function sendMessage(text: string) {
      chatWelcomeRef.current!.style.display = "none";
      addMsg("user", text);
      chatInputRef.current!.value = "";
      chatSendRef.current!.disabled = true;
      const thinkingEl = addMsg("bot", "Pensando…");
      thinkingEl.classList.add("thinking");
      try {
        const res = await fetch(`${API_BASE}/api/kibito`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message: text, history: chatHistory }),
        });
        const data = await res.json();
        thinkingEl.classList.remove("thinking");
        thinkingEl.innerHTML = '<div class="msg-label">Kibito</div>' + esc(data.reply || "No he podido responder ahora mismo.");
        if (data.history) chatHistory = data.history;
      } catch (err) {
        thinkingEl.classList.remove("thinking");
        thinkingEl.innerHTML = '<div class="msg-label">Kibito</div>' + esc("No he podido conectar con el backend todavía.");
      }
      chatSendRef.current!.disabled = false;
      chatInputRef.current!.focus();
    }

    const form = document.getElementById("chat-form") as HTMLFormElement;
    const submitHandler = (e: Event) => {
      e.preventDefault();
      const text = chatInputRef.current!.value.trim();
      if (text) sendMessage(text);
    };
    form.addEventListener("submit", submitHandler);
    const chips = document.querySelectorAll(".suggestion-chip");
    const chipHandlers: [Element, EventListener][] = [];
    chips.forEach((chip) => {
      const handler = () => sendMessage(t((chip as HTMLElement).dataset.key || ""));
      chip.addEventListener("click", handler);
      chipHandlers.push([chip, handler]);
    });

    return () => {
      form.removeEventListener("submit", submitHandler);
      chipHandlers.forEach(([chip, handler]) => chip.removeEventListener("click", handler));
    };
  }, []);

  return (
    <div id="app">
      <nav id="sidebar" ref={sidebarRef}></nav>
      <main id="main">
        <section className="view" id="chat-view" ref={chatViewRef as any}>
          <div className="page">
            <div id="chat-scroll" ref={chatScrollRef}>
              <div className="chat-welcome" id="chat-welcome" ref={chatWelcomeRef}>
                <div
                  className="page-icon-badge"
                  style={{
                    background: "var(--accent, #EF3A47)",
                    color: "#FFFFFF",
                    boxShadow: "0 4px 14px rgba(239, 58, 71, 0.35)",
                  }}
                >
                  <svg width="26" height="26" viewBox="0 0 218 218" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path
                      d="M0 45.6746H140.002L4.05982 181.387L36.3333 213.695L172.358 77.9421V218L218 172.284V0H45.6832L0 45.6746Z"
                      fill="#FFFFFF"
                    />
                  </svg>
                </div>
                <h1 id="chat-h1">Welcome to your <span className="hl hl-red">Path</span> with Kibo</h1>
                <p id="chat-subtitle">Contactos, restaurantes, guías y documentos de Kibo. Si quieres contactar a alguien, Kibito prepara la solicitud para que el equipo la apruebe.</p>
                <div className="values-row" style={{ justifyContent: "center", margin: "16px 0 6px" }}>
                  <span className="value-badge" style={{ background: "#EF3A471a", color: "#EF3A47" }}>Passion</span>
                  <span className="value-badge" style={{ background: "#4594F41a", color: "#4594F4" }}>Ambition</span>
                  <span className="value-badge" style={{ background: "#F9C52125", color: "#B8860B" }}>Trust</span>
                  <span className="value-badge" style={{ background: "#1FC9741a", color: "#0F9B53" }}>Help</span>
                </div>
                <div className="suggestions" id="chat-suggestions">
                  <button className="suggestion-chip" data-key="chat.suggestion1">¿Qué fondos VC hay en USA?</button>
                  <button className="suggestion-chip" data-key="chat.suggestion2">Cenar en Madrid, formal</button>
                  <button className="suggestion-chip" data-key="chat.suggestion3">La plantilla de board deck</button>
                  <button className="suggestion-chip" data-key="chat.suggestion4">Pedir una intro con un fondo</button>
                </div>
              </div>
            </div>
            <form id="chat-form">
              <input id="chat-input" type="text" placeholder="Escribe tu pregunta a Kibito…" autoComplete="off" ref={chatInputRef} />
              <button id="chat-send" type="submit" ref={chatSendRef}>Enviar</button>
            </form>
          </div>
        </section>

        <section className="view active" id="content-view" ref={contentViewRef as any}>
          <div className="page" id="content" ref={contentRef}></div>
        </section>
      </main>
    </div>
  );
}
