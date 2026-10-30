export function esc(s: any): string {
  if (s === null || s === undefined) return "";
  return String(s).replace(
    /[&<>"']/g,
    (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" } as Record<string, string>)[c]
  );
}

// Markdown mínimo para respuestas del bot: **negrita** y [texto](https://…).
export function mdLite(s: any): string {
  let out = esc(s);
  out = out.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
  out = out.replace(/\[([^\]]+)\]\((https?:\/\/[^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>');
  return out;
}
