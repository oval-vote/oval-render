import { readFileSync, writeFileSync } from "node:fs";
import { compile } from "json-schema-to-typescript";
import prettier from "prettier";

const SCHEMA = "schema/guide.schema.json";
const OUTPUT = "src/model.ts";

function withoutDescriptionsOnReferences(node) {
  if (Array.isArray(node)) {
    return node.map(withoutDescriptionsOnReferences);
  }
  if (node && typeof node === "object") {
    const copy = Object.fromEntries(
      Object.entries(node).map(([key, value]) => [key, withoutDescriptionsOnReferences(value)]),
    );
    if ("$ref" in copy) {
      delete copy.description;
    }
    return copy;
  }
  return node;
}

const schema = withoutDescriptionsOnReferences(JSON.parse(readFileSync(SCHEMA, "utf8")));
schema.title = "CompiledGuide";
const generated = await compile(schema, "CompiledGuide", {
  bannerComment: "",
  additionalProperties: false,
  style: { printWidth: 100 },
});
const formatted = await prettier.format(generated, {
  ...(await prettier.resolveConfig(OUTPUT)),
  parser: "typescript",
});
const current = readFileSync(OUTPUT, "utf8");
if (formatted === current) {
  process.exit(0);
}
if (process.argv.includes("--check")) {
  console.error(`${OUTPUT} is out of date; run \`npm run types\``);
  process.exit(1);
}
writeFileSync(OUTPUT, formatted);
