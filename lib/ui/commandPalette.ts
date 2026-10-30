import { esc } from "./html";
import { iconSvg } from "@/lib/icons";
import { t } from "@/lib/i18n";

export type PaletteItem = {
  group: string;
  title: string;
  subtitle?: string;
  keywords?: string;
  icon?: string;
  run: () => void;
};

const MAX_RESULTS = 40;

function norm(s: string) {
  return s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
}

// Buscador global (Cmd/Ctrl+K o "/"): busca en todo el contenido del portal a la vez.
export function initCommandPalette(opts: { getItems: () => PaletteItem[]; defaultGroup: () => string; onAsk: (q: string) => void }) {
  const root = document.createElement("div");
  root.className = "cmdk-backdrop";
  root.hidden = true;
  root.innerHTML = `<div class="cmdk" role="dialog" aria-modal="true">
    <div class="cmdk-input-row">${iconSvg("search", 17)}
      <input class="cmdk-input" type="text" role="combobox" aria-expanded="true" aria-controls="cmdk-list" aria-autocomplete="list" autocomplete="off" spellcheck="false">
      <kbd class="cmdk-kbd">Esc</kbd>
    </div>
    <div class="cmdk-list" id="cmdk-list" role="listbox"></div>
    <div class="cmdk-hint"></div>
  </div>`;
  document.body.appendChild(root);
  const dialog = root.querySelector(".cmdk") as HTMLElement;
  const input = root.querySelector(".cmdk-input") as HTMLInputElement;
  const list = root.querySelector(".cmdk-list") as HTMLElement;
  const hint = root.querySelector(".cmdk-hint") as HTMLElement;

  let items: PaletteItem[] = [];
  let results: PaletteItem[] = [];
  let active = 0;
  let lastFocus: HTMLElement | null = null;

  function search(q: string): PaletteItem[] {
    const words = norm(q).split(/\s+/).filter(Boolean);
    if (!words.length) return items.filter((i) => i.group === opts.defaultGroup()).slice(0, MAX_RESULTS);
    const scored: [number, PaletteItem][] = [];
    for (const it of items) {
      const title = norm(it.title);
      const hay = `${title} ${norm(it.subtitle || "")} ${norm(it.keywords || "")}`;
      if (!words.every((w) => hay.includes(w))) continue;
      let score = 0;
      if (title.startsWith(words[0])) score += 3;
      if (words.every((w) => title.includes(w))) score += 2;
      scored.push([score, it]);
    }
    // sort estable: a igual puntuación se respeta el orden de grupos de getItems()
    return scored.sort((a, b) => b[0] - a[0]).slice(0, MAX_RESULTS).map((x) => x[1]);
  }

  function render() {
    const q = input.value.trim();
    results = search(q);
    if (q) results.push({ group: t("search.group.ask"), title: t("search.askKibito", { q }), icon: "sparkles", run: () => opts.onAsk(q) });
    if (active >= results.length) active = 0;

    // Agrupa conservando el orden de aparición de cada grupo.
    const groups: string[] = [];
    results.forEach((r) => !groups.includes(r.group) && groups.push(r.group));
    const ordered = groups.flatMap((g) => results.filter((r) => r.group === g));
    results = ordered;

    let html = "";
    let lastGroup = "";
    ordered.forEach((it, i) => {
      if (it.group !== lastGroup) {
        html += `<div class="cmdk-group" role="presentation">${esc(it.group)}</div>`;
        lastGroup = it.group;
      }
      html += `<div class="cmdk-item${i === active ? " active" : ""}" role="option" id="cmdk-opt-${i}" aria-selected="${i === active}" data-i="${i}">
        <span class="cmdk-item-icon">${iconSvg(it.icon || "arrow-right", 15)}</span>
        <span class="cmdk-item-text"><span class="cmdk-item-title">${esc(it.title)}</span>${it.subtitle ? `<span class="cmdk-item-sub">${esc(it.subtitle)}</span>` : ""}</span>
      </div>`;
    });
    list.innerHTML = html || `<div class="cmdk-empty">${esc(t("search.empty", { q }))}</div>`;
    input.setAttribute("aria-activedescendant", ordered.length ? `cmdk-opt-${active}` : "");
    list.querySelectorAll<HTMLElement>(".cmdk-item").forEach((el) => {
      el.addEventListener("mousemove", () => {
        const i = Number(el.dataset.i);
        if (i !== active) {
          active = i;
          highlight(false);
        }
      });
      el.addEventListener("click", () => choose(Number(el.dataset.i)));
    });
  }

  function highlight(scroll = true) {
    list.querySelectorAll<HTMLElement>(".cmdk-item").forEach((el) => {
      const on = Number(el.dataset.i) === active;
      el.classList.toggle("active", on);
      el.setAttribute("aria-selected", String(on));
      if (on && scroll) el.scrollIntoView({ block: "nearest" });
    });
    input.setAttribute("aria-activedescendant", `cmdk-opt-${active}`);
  }

  function choose(i: number) {
    const it = results[i];
    if (!it) return;
    close(false);
    it.run();
  }

  function open() {
    items = opts.getItems();
    lastFocus = document.activeElement as HTMLElement | null;
    dialog.setAttribute("aria-label", t("search.label"));
    input.placeholder = t("search.placeholder");
    input.setAttribute("aria-label", t("search.label"));
    hint.textContent = t("search.hint");
    input.value = "";
    active = 0;
    root.hidden = false;
    render();
    input.focus();
  }

  function close(restoreFocus = true) {
    root.hidden = true;
    if (restoreFocus) lastFocus?.focus?.();
  }

  input.addEventListener("input", () => {
    active = 0;
    render();
  });
  input.addEventListener("keydown", (e) => {
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      if (!results.length) return;
      active = (active + (e.key === "ArrowDown" ? 1 : results.length - 1)) % results.length;
      highlight();
    } else if (e.key === "Enter") {
      e.preventDefault();
      choose(active);
    } else if (e.key === "Escape") {
      e.preventDefault();
      e.stopPropagation();
      close();
    } else if (e.key === "Tab") {
      e.preventDefault();
    }
  });
  root.addEventListener("mousedown", (e) => {
    if (e.target === root) close();
  });

  const onKey = (e: KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
      e.preventDefault();
      if (root.hidden) open();
      else close();
      return;
    }
    if (e.key === "/" && root.hidden) {
      const el = document.activeElement as HTMLElement | null;
      const typing = el && (el.tagName === "INPUT" || el.tagName === "TEXTAREA" || el.tagName === "SELECT" || el.isContentEditable);
      if (!typing) {
        e.preventDefault();
        open();
      }
    }
  };
  document.addEventListener("keydown", onKey);

  return {
    open,
    cleanup() {
      document.removeEventListener("keydown", onKey);
      root.remove();
    },
  };
}
