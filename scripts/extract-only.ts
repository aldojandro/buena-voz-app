import "dotenv/config";
import path from "path";
import fs from "fs";
import { readPdfText, splitIntoSections } from "../lib/pdf";
import { info, step, success, error } from "../lib/logger";

async function main() {
  const pdfPath = process.argv[2];

  if (!pdfPath) {
    error("Usage: npx tsx scripts/extract-only.ts <pdf-path>");
    process.exit(1);
  }

  const fullPath = path.resolve(pdfPath);

  step("Reading PDF");
  if (!fs.existsSync(fullPath)) {
    throw new Error(`PDF file not found: ${fullPath}`);
  }

  const text = await readPdfText(fullPath);
  success(`Read ${text.length} characters`);

  step("Splitting into sections");
  const sections = splitIntoSections(text);
  success(`Created ${sections.length} sections`);

  const output = sections.map((content, index) => ({
    section: index + 1,
    content,
    proposals: [] // LLM will fill this later
  }));

  step("Saving JSON");
  const outDir = path.resolve("./output");
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir);

  const outFile = path.join(outDir, path.basename(pdfPath, ".pdf") + ".json");
  fs.writeFileSync(outFile, JSON.stringify(output, null, 2));

  success(`Saved to ${outFile}`);
}

main().catch((err) => {
  error("Error", err);
  process.exit(1);
});