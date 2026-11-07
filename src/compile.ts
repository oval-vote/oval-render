import { compile, type Diagnostic } from "@oval-vote/oval";
import type { CompiledGuide } from "./model.ts";

export class InvalidDocument extends Error {
  readonly diagnostics: readonly Diagnostic[];

  constructor(diagnostics: readonly Diagnostic[]) {
    const errors = diagnostics.filter((diagnostic) => diagnostic.severity === "error");
    super(
      errors.length === 1
        ? `the document has an error: ${errors[0]?.message}`
        : `the document has ${errors.length} errors`,
    );
    this.name = "InvalidDocument";
    this.diagnostics = diagnostics;
  }
}

export function compileSource(source: string): CompiledGuide {
  try {
    return compile(source) as unknown as CompiledGuide;
  } catch (thrown) {
    if (Array.isArray(thrown)) {
      throw new InvalidDocument(thrown as Diagnostic[]);
    }
    throw thrown;
  }
}
