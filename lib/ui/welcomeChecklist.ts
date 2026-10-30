import { esc } from "./html";
import { iconSvg } from "@/lib/icons";
import { t } from "@/lib/i18n";

const VISITED_KEY = "kibo_visited_panes";
const HIDDEN_KEY = "kibo_checklist_hidden";

export const CHECKLIST_STEPS = [
  { pane: "meetkibo-principles", key: "check.principles", icon: "compass" },
  { pane: "meetkibo-portfolio", key: "check.portfolio", icon: "rocket" },
  { pane: "guides-reporting", key: "check.reporting", icon: "file-text" },
  { pane: "network", key: "check.network", icon: "network" },
  { pane: "perks", key: "check.perks", icon: "gift" },
  { pane: "cal-future", key: "check.calendar", icon: "calendar" },
  { pane: "chat", key: "check.chat", icon: "sparkles" },
];

function readVisited(): string[] {
  try {
    const v = JSON.parse(localStorage.getItem(VISITED_KEY) || "[]");
    return Array.isArray(v) ? v : [];
  } catch {
    return [];
  }
}

// "network" cuenta con cualquier subsección (network-vc, network-legal…).
export function markVisited(paneId: string) {
  const step = CHECKLIST_STEPS.find((s) => paneId === s.pane || paneId.startsWith(s.pane + "-"));
  if (!step) return;
  const visited = readVisited();
  if (visited.includes(step.pane)) return;
  try {
    localStorage.setItem(VISITED_KEY, JSON.stringify([...visited, step.pane]));
  } catch {
    // ignore
  }
}

export function hideChecklist() {
  try {
    localStorage.setItem(HIDDEN_KEY, "1");
  } catch {
    // ignore
  }
}

function isHidden() {
  try {
    return localStorage.getItem(HIDDEN_KEY) === "1";
  } catch {
    return false;
  }
}

export function checklistHtml(): string {
  if (isHidden()) return "";
  const visited = readVisited();
  const done = CHECKLIST_STEPS.filter((s) => visited.includes(s.pane)).length;
  const total = CHECKLIST_STEPS.length;
  const pct = Math.round((done / total) * 100);
  return `<section class="checklist" aria-labelledby="checklist-title">
    <div class="checklist-head">
      <div>
        <h2 class="checklist-title" id="checklist-title">${esc(t("check.title"))}</h2>
        <div class="checklist-progress-label">${esc(done === total ? t("check.done") : t("check.progress", { done: String(done), total: String(total) }))}</div>
      </div>
      <button type="button" class="checklist-hide" id="checklist-hide">${esc(t("check.hide"))}</button>
    </div>
    <div class="checklist-bar" role="progressbar" aria-valuemin="0" aria-valuemax="${total}" aria-valuenow="${done}"><span style="width:${pct}%"></span></div>
    <ul class="checklist-items">
      ${CHECKLIST_STEPS.map((s) => {
        const isDone = visited.includes(s.pane);
        return `<li><button type="button" class="checklist-item${isDone ? " done" : ""}" data-pane="${s.pane}">
          <span class="checklist-check" aria-hidden="true">${isDone ? iconSvg("check", 13, "#fff") : iconSvg(s.icon, 13)}</span>
          <span>${esc(t(s.key))}</span>
          ${isDone ? `<span class="sr-only">✓</span>` : ""}
        </button></li>`;
      }).join("")}
    </ul>
  </section>`;
}
