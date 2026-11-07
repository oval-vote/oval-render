#!/usr/bin/env node
import { readFileSync } from "node:fs";
import { InvalidDocument } from "./compile.ts";
import type { CompiledGuide } from "./model.ts";
import { render, renderSource } from "./render.ts";

const [input] = process.argv.slice(2);
if (input === undefined || input === "--help" || input === "-h") {
  console.error("usage: oval-render <guide.oval | guide.json>");
  process.exit(input === undefined ? 2 : 0);
}
const text = readFileSync(input, "utf8");
try {
  const html = input.endsWith(".json")
    ? render(JSON.parse(text) as CompiledGuide)
    : renderSource(text);
  process.stdout.write(html);
} catch (thrown) {
  if (thrown instanceof InvalidDocument) {
    for (const diagnostic of thrown.diagnostics) {
      console.error(
        `${input}:${diagnostic.range.start}: ${diagnostic.severity}[${diagnostic.code}]: ${diagnostic.message}`,
      );
    }
    process.exit(1);
  }
  throw thrown;
}
