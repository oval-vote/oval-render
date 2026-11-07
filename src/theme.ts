import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

function brand(path: string): string {
  return readFileSync(fileURLToPath(import.meta.resolve(`@oval-vote/brand/${path}`)), "utf8");
}

export const TOKENS = brand("tokens/oval.css");
export const COMPONENTS = brand("css/components.css");

export const FONT_STYLESHEET =
  "https://fonts.googleapis.com/css2?family=Newsreader:ital,opsz,wght@0,6..72,400;0,6..72,500;1,6..72,400&family=Public+Sans:wght@400;600&family=IBM+Plex+Mono:wght@400;500&display=swap";

const STYLES = `
body {
  margin: 0;
  background: var(--oval-paper);
  color: var(--oval-ink);
}
.oval-guide {
  max-width: var(--oval-measure);
  margin: 0 auto;
  padding: var(--oval-space-8) max(16px, env(safe-area-inset-left)) var(--oval-space-16)
    max(16px, env(safe-area-inset-right));
  font: var(--oval-size-body) / var(--oval-line-body) var(--oval-font-text);
  color: var(--oval-ink);
  background: var(--oval-paper);
  -webkit-font-smoothing: antialiased;
}
.oval-guide h1, .oval-guide h2, .oval-guide h3, .oval-guide h4, .oval-guide h5, .oval-guide h6 {
  font-family: var(--oval-font-text);
  font-weight: 500;
  line-height: var(--oval-line-heading);
  margin: var(--oval-space-12) 0 var(--oval-space-3);
  text-wrap: balance;
}
.oval-guide h1 { font-size: var(--oval-size-h1); letter-spacing: -0.015em; margin-top: 0; }
.oval-guide h2 { font-size: var(--oval-size-h2); padding-top: var(--oval-space-4); border-top: var(--oval-rule-width) solid var(--oval-rule); }
.oval-guide h3 { font-size: var(--oval-size-h3); }
.oval-guide h4, .oval-guide h5, .oval-guide h6 { font-size: var(--oval-size-lead); margin-top: var(--oval-space-8); }
.oval-guide p { margin: 0 0 var(--oval-space-4); }
.oval-guide a {
  color: inherit;
  text-decoration: underline;
  text-decoration-color: var(--oval-mark);
  text-decoration-thickness: 0.08em;
  text-underline-offset: 0.12em;
}
.oval-guide a:hover { color: var(--oval-mark); }
.oval-guide :focus-visible { outline: 2px solid var(--oval-focus); outline-offset: 2px; }
.oval-guide code { font-family: var(--oval-font-mono); font-size: 0.9em; }
.oval-guide .oval-muted { color: var(--oval-ink-soft); }
.oval-guide .oval-election { font-size: var(--oval-size-lead); margin: 0 0 var(--oval-space-6); }
.oval-guide .oval-contents { font-family: var(--oval-font-ui); font-size: var(--oval-size-small); padding: var(--oval-space-4) var(--oval-space-6); }
.oval-guide .oval-contents ul { margin: 0; padding-left: var(--oval-space-4); }
.oval-guide .oval-contents li { margin: var(--oval-space-1) 0; }
.oval-guide .oval-subtitle { margin: calc(-1 * var(--oval-space-2)) 0 var(--oval-space-4); }
.oval-guide .oval-campaigns { margin: var(--oval-space-4) 0; }
.oval-guide .oval-campaign .oval-badge { margin-left: var(--oval-space-2); }
.oval-guide .oval-campaign p { margin: var(--oval-space-2) 0 0; }
.oval-guide .oval-withdrawn .oval-candidate { text-decoration: line-through; color: var(--oval-ink-soft); }
.oval-guide .oval-recommendation { margin: var(--oval-space-4) 0; }
.oval-guide .oval-position { margin-bottom: var(--oval-space-2); }
.oval-guide dl { display: grid; grid-template-columns: max-content 1fr; gap: var(--oval-space-1) var(--oval-space-4); margin: var(--oval-space-4) 0; }
.oval-guide dt { font-family: var(--oval-font-ui); color: var(--oval-ink-soft); font-size: var(--oval-size-small); }
.oval-guide dd { margin: 0; }
.oval-guide dd > p:last-child { margin-bottom: 0; }
.oval-guide table { border-collapse: collapse; margin: var(--oval-space-4) 0; font-family: var(--oval-font-ui); font-size: var(--oval-size-small); }
.oval-guide th, .oval-guide td { border: var(--oval-rule-width) solid var(--oval-rule); padding: var(--oval-space-1) var(--oval-space-2); text-align: left; }
.oval-guide th { font-weight: 600; }
.oval-guide blockquote { border-left: 3px solid var(--oval-rule); margin: var(--oval-space-4) 0; padding-left: var(--oval-space-4); color: var(--oval-ink-soft); }
@media (max-width: 480px) {
  .oval-guide .oval-campaign { grid-template-columns: 1.75rem 1fr; }
  .oval-guide .oval-campaign .oval-stance { grid-column: 2; }
}
@media print {
  body, .oval-guide { background: #fff; color: #000; }
  .oval-guide { max-width: none; padding: 0; font-size: 11pt; }
  .oval-guide a { text-decoration: none; }
  .oval-guide .oval-ballot { break-before: page; }
  .oval-guide .oval-contents { display: none; }
  .oval-guide .oval-recommendation { break-inside: avoid; }
}
`;

export const THEME = `${TOKENS}\n${COMPONENTS}\n${STYLES}`.trim();
