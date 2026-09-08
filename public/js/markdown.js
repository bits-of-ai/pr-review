const ESCAPE = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
};

export function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"]/g, (ch) => ESCAPE[ch]);
}

/**
 * Conservative markdown renderer for review text. HTML in the source is escaped.
 * @param {string} source
 */
export function renderMarkdown(source) {
  const escaped = escapeHtml(source);
  const parts = escaped.split(/```(?:[\w+-]*)\n?([\s\S]*?)```/g);
  let html = "";

  for (let i = 0; i < parts.length; i += 1) {
    if (i % 2 === 1) {
      html += `<pre><code>${parts[i].replace(/\n$/, "")}</code></pre>`;
      continue;
    }
    html += renderInlineBlocks(parts[i]);
  }

  return html;
}

function renderInlineBlocks(text) {
  const blocks = text.split(/\n{2,}/);
  return blocks
    .map((block) => {
      const trimmed = block.trim();
      if (!trimmed) return "";
      if (/^#{1,3} /.test(trimmed)) {
        const level = trimmed.match(/^#+/)[0].length;
        const content = inline(trimmed.replace(/^#{1,3} /, ""));
        return `<h${level}>${content}</h${level}>`;
      }
      if (/^[-*] /.test(trimmed) || /^\d+\. /.test(trimmed)) {
        const items = trimmed.split("\n").map((line) => {
          const item = line.replace(/^([-*] |\d+\. )/, "");
          return `<li>${inline(item)}</li>`;
        });
        const list = /^\d+\. /.test(trimmed) ? "ol" : "ul";
        return `<${list}>${items.join("")}</${list}>`;
      }
      return `<p>${inline(trimmed).replace(/\n/g, "<br>")}</p>`;
    })
    .join("");
}

function inline(text) {
  return text
    .replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>')
    .replace(/`([^`]+)`/g, "<code>$1</code>")
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(/\*([^*]+)\*/g, "<em>$1</em>");
}