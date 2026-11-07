# @oval-vote/render

Renders a compiled [Oval](https://oval.vote) voting guide to HTML.

The input is an Oval document, which the package compiles with
[`@oval-vote/oval`](https://www.npmjs.com/package/@oval-vote/oval), or the canonical JSON that
`oval compile` produces, described in Section 5 of the [specification](https://spec.oval.vote).
The output is a complete HTML document with a default stylesheet, or a fragment to place in a page
of your own.

```js
import { render, renderSource, renderFragment, InvalidDocument } from "@oval-vote/render";

const html = renderSource(source);
// A full document: <!doctype html> through </html>, styles inlined, with a table of contents.
// Throws InvalidDocument, carrying the diagnostics, when the document has errors.

const fragment = renderFragment(compiledGuide, { contents: false });
// One <article class="oval-guide"> from already compiled JSON, without the stylesheet.
```

```sh
npx @oval-vote/render guide.oval > guide.html
npx @oval-vote/render guide.json > guide.html
```

Markdown bodies are rendered with the specification's Markdown profile: CommonMark plus tables,
with raw HTML escaped, images shown as their text, and code shown as plain text. Every string from
the guide is escaped, so a guide cannot inject markup into the page.

The default stylesheet is the Oval design system from
[`@oval-vote/brand`](https://www.npmjs.com/package/@oval-vote/brand): its tokens (paper, ink,
the purple mark, support green and oppose red, in light and dark forms), its components (ballot
rows with their bubbles, badges, callouts, labels), and then the rules for the guide's own
elements. A supported campaign is shown with a filled ballot oval, every other campaign with an
empty one. The full document links Newsreader, Public Sans, and IBM Plex Mono from Google Fonts;
pass `fonts: "none"` to keep the output free of third-party requests, and the fallback stacks
apply. Fragments never link fonts.

The markup is semantic and every element carries an `oval-` class, so a stylesheet of your own can
replace the default one; pass `stylesheet: "none"` to leave it out. `TOKENS` and `COMPONENTS`
export the brand stylesheets alone for a host page that styles fragments itself.

## Developing

Tooling is managed with [mise](https://mise.jdx.dev), which reads `.node-version`.

```sh
npm ci
npm test         # formatting, generated types, type checking, and the tests
npm run build    # compiles src/ to dist/
npm run preview  # renders a guide, opens it in the browser, and reloads it as src/ or the guide changes
npm run types    # regenerates src/model.ts from schema/guide.schema.json
```

`schema/guide.schema.json` is a copy of the specification's schema, and `src/model.ts` is generated
from it; CI fails when the two disagree. The brand stylesheets are read from the installed
`@oval-vote/brand` package, so updating the design system is a version bump. `tests/fixtures/franklin.oval.json` is the specification's
compiled example. `npm run preview -- path/to/guide.oval` previews a guide of your own; without an
argument it previews the Franklin example.
