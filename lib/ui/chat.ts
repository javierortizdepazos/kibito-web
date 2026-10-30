import { esc, mdLite } from "./html";
import { iconSvg } from "@/lib/icons";
import { t } from "@/lib/i18n";
import { rememberIntro } from "@/lib/myIntros";

export type ChatElements = {
  scroll: HTMLElement;
  welcome: HTMLElement;
  input: HTMLInputElement;
  send: HTMLButtonElement;
  form: HTMLFormElement;
  contextBar: HTMLElement;
};

const CARD_HIDDEN_FIELDS = new Set([
  "id", "name", "title", "company", "email", "phone", "address", "book_url", "url", "web", "website",
  "linkedin_url", "twitter", "contact", "contact_name", "_note", "contact_visibility",
  "file_url", "thumbnail_url", "related_source_page", "created_at",
]);

function linkField(row: any): { url: string; label: string } | null {
  if (row.file_url) return { url: row.file_url, label: t("cards.open") };
  if (row.book_url) return { url: row.book_url, label: t("rest.bookTable") };
  if (row.website) return { url: row.website, label: t("cards.web") };
  if (row.web) return { url: row.web, label: t("cards.web") };
  if (row.url) return { url: row.url, label: t("cards.web") };
  if (row.linkedin_url) return { url: row.linkedin_url, label: "LinkedIn" };
  return null;
}

function renderCardGroups(groups: { table: string; items: any[] }[]): string {
  return (
    '<div class="contact-cards">' +
    groups
      .map((g) => {
        const cards = g.items
          .slice(0, 12)
          .map((row: any) => {
            const title = esc(row.name || row.title || row.company || "—");
            const sub = Object.entries(row)
              .filter(([k, v]) => !CARD_HIDDEN_FIELDS.has(k) && v && typeof v === "string")
              .slice(0, 3)
              .map(([, v]) => esc(String(v)))
              .join(" · ");
            const link = linkField(row);
            const actions = [
              link ? `<a class="contact-card-btn" href="${esc(link.url)}" target="_blank" rel="noopener">${esc(link.label)}</a>` : "",
              row.email ? `<a class="contact-card-btn" href="mailto:${esc(row.email)}">${esc(t("cards.email"))}</a>` : "",
              row.phone ? `<a class="contact-card-btn" href="tel:${esc(row.phone)}">${esc(t("cards.call"))}</a>` : "",
              row.address
                ? `<a class="contact-card-btn" href="https://maps.google.com/?q=${encodeURIComponent(row.address)}" target="_blank" rel="noopener">${esc(t("cards.map"))}</a>`
                : "",
            ]
              .filter(Boolean)
              .join("");
            return (
              `<div class="contact-card">` +
              `<div class="contact-card-title">${title}</div>` +
              (sub ? `<div class="contact-card-sub">${sub}</div>` : "") +
              (actions ? `<div class="contact-card-actions">${actions}</div>` : "") +
              `</div>`
            );
          })
          .join("");
        const labelKey = `cards.table.${g.table}`;
        const label = t(labelKey) === labelKey ? g.table : t(labelKey);
        return `<div class="contact-cards-group-label">${esc(label)}</div><div class="contact-cards-grid">${cards}</div>`;
      })
      .join("") +
    "</div>"
  );
}

export function initChat(els: ChatElements, opts: { onSend?: () => void } = {}) {
  let history: any[] = [];
  let context: string | null = null;
  const scrollToEnd = () => {
    els.scroll.scrollTop = els.scroll.scrollHeight;
  };

  function addMsg(role: "user" | "bot", text: string) {
    const el = document.createElement("div");
    el.className = "msg " + (role === "user" ? "user" : "bot");
    el.innerHTML = (role === "user" ? "" : '<div class="msg-label">Kibito</div>') + (role === "user" ? esc(text) : mdLite(text));
    els.scroll.appendChild(el);
    scrollToEnd();
    return el;
  }

  function renderEscalationBox(afterEl: HTMLElement, question: string) {
    const box = document.createElement("div");
    box.className = "escalation-box";
    box.innerHTML = `
      <div class="escalation-title">${iconSvg("message", 14)}${t("chat.escalation.title")}</div>
      <textarea class="intro-input" rows="2" aria-label="${esc(t("intro.reason"))}">${esc(question)}</textarea>
      <input class="intro-input" name="founder_name" placeholder="${esc(t("intro.yourName"))}" aria-label="${esc(t("intro.yourName"))}" style="margin-top:6px;">
      <input class="intro-input" name="startup_name" placeholder="${esc(t("intro.startup"))}" aria-label="${esc(t("intro.startup"))}" style="margin-top:6px;">
      <button type="button" class="modal-book-btn escalation-submit" style="margin-top:8px;">${iconSvg("mail", 14)}${t("chat.escalation.send")}</button>
    `;
    afterEl.insertAdjacentElement("afterend", box);
    scrollToEnd();
    const btn = box.querySelector(".escalation-submit") as HTMLButtonElement;
    btn.addEventListener("click", async () => {
      const reason = (box.querySelector("textarea") as HTMLTextAreaElement).value.trim();
      const founderName = (box.querySelector('[name="founder_name"]') as HTMLInputElement).value.trim();
      const startupName = (box.querySelector('[name="startup_name"]') as HTMLInputElement).value.trim();
      if (!reason || !founderName) {
        btn.textContent = t("chat.escalation.missing");
        return;
      }
      btn.disabled = true;
      btn.innerHTML = t("common.sending");
      try {
        const res = await fetch("/api/request-intro", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ founder_name: founderName, startup_name: startupName, contact_requested: t("chat.escalation.contactLabel"), reason }),
        });
        const data = await res.json();
        if (!res.ok || data.error) throw new Error(data.error || "error");
        rememberIntro(data.request);
        box.innerHTML = `<div class="escalation-sent">${iconSvg("check", 14, "var(--accent-green)")}${t("chat.escalation.sent")} ${esc(t("intro.trackHint"))}</div>`;
      } catch {
        btn.disabled = false;
        btn.innerHTML = `${iconSvg("mail", 14)}${t("chat.escalation.send")}`;
      }
    });
  }

  function renderContextBar() {
    if (!context) {
      els.contextBar.hidden = true;
      els.contextBar.innerHTML = "";
      els.input.placeholder = t("chat.placeholder");
      return;
    }
    els.contextBar.hidden = false;
    els.contextBar.innerHTML = `<span class="chat-context-text">${iconSvg("sparkles", 12)} ${esc(t("chat.contextLabel"))}: <b>${esc(context)}</b></span>
      <button type="button" class="chat-context-clear" aria-label="${esc(t("chat.contextClear"))}" title="${esc(t("chat.contextClear"))}">${iconSvg("x", 12)}</button>`;
    els.contextBar.querySelector("button")!.addEventListener("click", () => {
      setContext(null);
      els.input.focus();
    });
    els.input.placeholder = t("ask.placeholder", { title: context });
  }

  function setContext(label: string | null) {
    context = label;
    renderContextBar();
  }

  function refreshStaticText() {
    els.scroll.setAttribute("aria-label", t("chat.logLabel"));
    els.input.setAttribute("aria-label", t("chat.inputLabel"));
    renderContextBar();
  }

  async function send(text: string) {
    els.welcome.style.display = "none";
    addMsg("user", text);
    els.input.value = "";
    els.send.disabled = true;
    opts.onSend?.();
    const thinkingEl = addMsg("bot", t("chat.thinking"));
    thinkingEl.classList.add("thinking");
    thinkingEl.setAttribute("aria-busy", "true");
    try {
      const res = await fetch("/api/kibito", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text, history, context }),
      });
      if (res.status === 401) throw new Error("session");
      const data = await res.json();
      thinkingEl.innerHTML = '<div class="msg-label">Kibito</div>' + mdLite(data.reply || t("chat.noReply"));
      if (data.history) history = data.history;
      if (data.cardGroups && data.cardGroups.length) {
        const holder = document.createElement("div");
        holder.innerHTML = renderCardGroups(data.cardGroups);
        thinkingEl.insertAdjacentElement("afterend", holder.firstElementChild!);
      }
      if (data.escalated) renderEscalationBox(thinkingEl, data.question || text);
    } catch (err: any) {
      thinkingEl.innerHTML = '<div class="msg-label">Kibito</div>' + esc(err?.message === "session" ? t("chat.sessionExpired") : t("chat.connError"));
    }
    thinkingEl.classList.remove("thinking");
    thinkingEl.removeAttribute("aria-busy");
    scrollToEnd();
    els.send.disabled = false;
    els.input.focus();
  }

  const submitHandler = (e: Event) => {
    e.preventDefault();
    const text = els.input.value.trim();
    if (text) send(text);
  };
  els.form.addEventListener("submit", submitHandler);

  const chipHandlers: [Element, EventListener][] = [];
  els.welcome.querySelectorAll(".suggestion-chip").forEach((chip) => {
    const handler = () => send(t((chip as HTMLElement).dataset.key || ""));
    chip.addEventListener("click", handler);
    chipHandlers.push([chip, handler]);
  });

  refreshStaticText();

  return {
    send,
    setContext,
    refreshStaticText,
    cleanup() {
      els.form.removeEventListener("submit", submitHandler);
      chipHandlers.forEach(([chip, handler]) => chip.removeEventListener("click", handler));
    },
  };
}
