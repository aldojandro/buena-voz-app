import fs from "fs";
import pdfParse from "pdf-parse";

export async function readPdfText(pdfPath: string): Promise<string> {
  if (!fs.existsSync(pdfPath)) {
    throw new Error(`PDF file not found: ${pdfPath}`);
  }

  const dataBuffer = fs.readFileSync(pdfPath);
  const data = await pdfParse(dataBuffer);
  return data.text;
}

export function splitIntoSections(text: string, maxChars: number = 2750): string[] {
  const sections: string[] = [];
  const paragraphs = text.split(/\n\s*\n/).filter((p) => p.trim().length > 0);

  let currentSection = "";

  for (const paragraph of paragraphs) {
    const trimmed = paragraph.trim();

    if (currentSection.length + trimmed.length + 2 > maxChars && currentSection.length > 0) {
      sections.push(currentSection.trim());
      currentSection = trimmed;
    } else {
      currentSection += (currentSection ? "\n\n" : "") + trimmed;
    }
  }

  if (currentSection.trim().length > 0) {
    sections.push(currentSection.trim());
  }

  return sections.filter((s) => s.length > 100);
}

