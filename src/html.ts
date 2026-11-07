const ESCAPES: Record<string, string> = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;",
};

export function escape(text: string): string {
  return text.replace(/[&<>"']/g, (character) => ESCAPES[character] ?? character);
}

export function attribute(name: string, value: string | undefined): string {
  return value === undefined ? "" : ` ${name}="${escape(value)}"`;
}

export function element(tag: string, attributes: string, children: string[]): string {
  return `<${tag}${attributes}>${children.join("")}</${tag}>`;
}

export function joinLines(lines: readonly (string | false | undefined)[]): string {
  return lines.filter((line): line is string => typeof line === "string").join("\n");
}
