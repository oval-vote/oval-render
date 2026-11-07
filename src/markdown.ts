import { Marked, type Tokens } from "marked";
import { escape } from "./html.ts";

const marked = new Marked({
  gfm: true,
  breaks: false,
  renderer: {
    html(token: Tokens.HTML | Tokens.Tag): string {
      return escape(token.text);
    },
    image(token: Tokens.Image): string {
      return escape(token.text || token.href);
    },
    code(token: Tokens.Code): string {
      return `<p>${escape(token.text)}</p>\n`;
    },
    codespan(token: Tokens.Codespan): string {
      return escape(token.text);
    },
    hr(): string {
      return "";
    },
  },
});

export function markdown(body: string): string {
  return marked.parse(body, { async: false }).trim();
}
