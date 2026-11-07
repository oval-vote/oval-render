export const THEME = `
:root {
  color-scheme: light dark;
  --oval-text: #1d1d1f;
  --oval-muted: #6e6e73;
  --oval-rule: #d2d2d7;
  --oval-surface: #ffffff;
  --oval-tint: #f5f5f7;
  --oval-accent: #0b5cad;
  --oval-support: #1a7f37;
  --oval-oppose: #b42318;
}
@media (prefers-color-scheme: dark) {
  :root {
    --oval-text: #f5f5f7;
    --oval-muted: #a1a1a6;
    --oval-rule: #3a3a3c;
    --oval-surface: #1c1c1e;
    --oval-tint: #2c2c2e;
    --oval-accent: #6cb4ff;
    --oval-support: #4cd964;
    --oval-oppose: #ff6b5b;
  }
}
.oval-guide {
  max-width: 44rem;
  margin: 0 auto;
  padding: 2rem 1rem 4rem;
  font: 17px/1.5 ui-serif, Georgia, serif;
  color: var(--oval-text);
  background: var(--oval-surface);
}
.oval-guide h1, .oval-guide h2, .oval-guide h3, .oval-guide h4, .oval-guide h5, .oval-guide h6 {
  font-family: ui-sans-serif, system-ui, sans-serif;
  line-height: 1.2;
  margin: 2rem 0 0.5rem;
}
.oval-guide h1 { font-size: 2rem; margin-top: 0; }
.oval-guide h2 { font-size: 1.6rem; border-bottom: 1px solid var(--oval-rule); padding-bottom: 0.25rem; }
.oval-guide h3 { font-size: 1.3rem; }
.oval-guide h4 { font-size: 1.1rem; }
.oval-guide a { color: var(--oval-accent); }
.oval-guide .oval-muted { color: var(--oval-muted); }
.oval-guide .oval-election { font-size: 1.1rem; margin: 0 0 1rem; }
.oval-guide .oval-contents { background: var(--oval-tint); padding: 1rem 1.5rem; border-radius: 0.5rem; }
.oval-guide .oval-contents ul { margin: 0; padding-left: 1.25rem; }
.oval-guide .oval-subtitle { margin: -0.25rem 0 0.75rem; }
.oval-guide .oval-campaigns { list-style: none; padding: 0; margin: 1rem 0; }
.oval-guide .oval-campaign { display: flex; gap: 0.75rem; align-items: baseline; padding: 0.5rem 0; border-top: 1px solid var(--oval-rule); }
.oval-guide .oval-campaign:last-child { border-bottom: 1px solid var(--oval-rule); }
.oval-guide .oval-mark { flex: 0 0 5.5rem; font-family: ui-sans-serif, system-ui, sans-serif; font-size: 0.85rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.04em; }
.oval-guide .oval-mark-support { color: var(--oval-support); }
.oval-guide .oval-mark-oppose { color: var(--oval-oppose); }
.oval-guide .oval-mark-none { color: var(--oval-muted); font-weight: 400; }
.oval-guide .oval-label { font-weight: 600; }
.oval-guide .oval-badge { font-family: ui-sans-serif, system-ui, sans-serif; font-size: 0.75rem; padding: 0.1rem 0.4rem; border: 1px solid var(--oval-rule); border-radius: 0.25rem; margin-left: 0.4rem; vertical-align: middle; }
.oval-guide .oval-withdrawn .oval-label { text-decoration: line-through; }
.oval-guide .oval-recommendation { background: var(--oval-tint); padding: 1rem 1.5rem; border-radius: 0.5rem; margin: 1rem 0; }
.oval-guide .oval-recommendation > p:first-child { margin-top: 0; }
.oval-guide .oval-position { font-family: ui-sans-serif, system-ui, sans-serif; font-weight: 700; }
.oval-guide .oval-position-yes { color: var(--oval-support); }
.oval-guide .oval-position-no { color: var(--oval-oppose); }
.oval-guide dl { display: grid; grid-template-columns: max-content 1fr; gap: 0.25rem 1rem; margin: 1rem 0; }
.oval-guide dt { color: var(--oval-muted); font-family: ui-sans-serif, system-ui, sans-serif; font-size: 0.9rem; }
.oval-guide dd { margin: 0; }
.oval-guide table { border-collapse: collapse; margin: 1rem 0; }
.oval-guide th, .oval-guide td { border: 1px solid var(--oval-rule); padding: 0.25rem 0.5rem; text-align: left; }
.oval-guide blockquote { border-left: 3px solid var(--oval-rule); margin: 1rem 0; padding-left: 1rem; color: var(--oval-muted); }
@media print {
  .oval-guide { max-width: none; padding: 0; font-size: 11pt; }
  .oval-guide a { color: inherit; text-decoration: none; }
  .oval-guide .oval-ballot { break-before: page; }
  .oval-guide .oval-contents { display: none; }
}
`.trim();
