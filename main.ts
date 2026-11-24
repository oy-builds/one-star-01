// One-Star Review of Something Essential — entry writer.
// Reads entry.txt beside this script (falling back to the embedded copy)
// and writes it to /output/entry.txt for the program/v1 harness.

import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const FALLBACK =
  "One star. Eight flawless hours a night, every night of my life, except the night before anything that matters.";

function loadEntry(): string {
  const here = dirname(fileURLToPath(import.meta.url));
  const candidates = [join(here, "entry.txt"), join(process.cwd(), "entry.txt")];
  for (const path of candidates) {
    try {
      const text = readFileSync(path, "utf8").trim();
      if (text.length > 0) return text;
    } catch {
      // try the next candidate, then the embedded fallback
    }
  }
  return FALLBACK;
}

function fail(message: string): never {
  console.error(`error: ${message}`);
  process.exit(1);
}

const entry = loadEntry();

// Gate self-check: the scorer only judges a single line of 1-160 characters.
if (entry.length < 1 || entry.length > 160) {
  fail(`entry must be 1-160 characters, got ${entry.length}`);
}
if (/[\r\n]/.test(entry)) {
  fail("entry must be a single line");
}

const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";
mkdirSync(outDir, { recursive: true });
const outPath = join(outDir, "entry.txt");
writeFileSync(outPath, entry, "utf8");

// Read-back verification: a truncated or corrupted write fails loudly
// instead of being silently judged.
const written = readFileSync(outPath, "utf8");
if (written !== entry) {
  fail("written output does not match the entry text");
}
