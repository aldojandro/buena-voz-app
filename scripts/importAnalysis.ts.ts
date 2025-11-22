import "dotenv/config";
import fs from "fs";
import path from "path";
import { prisma } from "../lib/prisma";
import { step, success, error, info } from "../lib/logger";

/**
 * Usage:
 * npx tsx scripts/importAnalysis.ts <candidateId> <documentId> <folder-name>
 *
 * Example:
 * npx tsx scripts/importAnalysis.ts pedroCastillo cmi9tbxei0001yw03lz2omegz peru-libre-2021
 */

async function main() {
  const candidateId = process.argv[2];
  const documentId = process.argv[3];
  const folder = process.argv[4];

  if (!candidateId || !documentId || !folder) {
    console.log(
      "Usage: npx tsx scripts/importAnalysis.ts <candidateId> <documentId> <folder>"
    );
    process.exit(1);
  }

  const basePath = path.join("analysis", folder);
  const insightsPath = path.join(basePath, "candidate-insights.json");
  const proposalSummaryPath = path.join(basePath, "proposal-summary.json");
  const proposalTypologyPath = path.join(basePath, "proposal-typology.json");

  step("Validating JSON files exist");

  const files = [
    insightsPath,
    proposalSummaryPath,
    proposalTypologyPath,
  ];

  for (const file of files) {
    if (!fs.existsSync(file)) {
      error(`Missing file: ${file}`);
      process.exit(1);
    }
  }

  success("All JSON files found");

  // ---- READ FILES ----
  step("Reading JSON files");

  const insights = JSON.parse(fs.readFileSync(insightsPath, "utf-8"));
  const proposalSummary = JSON.parse(
    fs.readFileSync(proposalSummaryPath, "utf-8")
  );
  const proposalTypology = JSON.parse(
    fs.readFileSync(proposalTypologyPath, "utf-8")
  );

  success("JSON files loaded");

  // ---- VALIDATE CANDIDATE & DOCUMENT ----
  step("Validating candidate and document");

  const candidate = await prisma.candidate.findUnique({
    where: { id: candidateId },
  });
  const document = await prisma.document.findUnique({
    where: { id: documentId },
  });

  if (!candidate) {
    error(`Candidate not found: ${candidateId}`);
    process.exit(1);
  }
  if (!document) {
    error(`Document not found: ${documentId}`);
    process.exit(1);
  }

  success(`Found candidate: ${candidate.name}`);
  success(`Found document: ${document.id}`);

  // ---- IMPORT THEMATIC CLASSIFICATION ----
  step("Importing ThematicClassification");

  const categories = proposalSummary.categories || [];

  let thematicCount = 0;

  for (const item of categories) {
    const { name, mentions, example_phrases } = item;

    await prisma.thematicClassification.upsert({
      where: {
        candidateId_documentId_category: {
          candidateId,
          documentId,
          category: name,
        },
      },
      update: {
        count: mentions || 0,
        examples: example_phrases || [],
      },
      create: {
        candidateId,
        documentId,
        category: name,
        count: mentions || 0,
        examples: example_phrases || [],
      },
    });

    thematicCount++;
  }

  success(`Inserted ${thematicCount} thematic classification rows.`);

  // ---- IMPORT PROPOSAL TYPOLOGY & SUMMARY ----
  step("Importing ProposalTypology and ProposalSummary");

  // Group proposals by classification type (used for both Typology and Summary)
  const proposals = proposalTypology.proposals || [];
  const typologyMap = new Map<string, { count: number; examples: string[] }>();

  for (const proposal of proposals) {
    const { text, classification } = proposal;
    const type = classification || "sin_detalle";

    if (!typologyMap.has(type)) {
      typologyMap.set(type, { count: 0, examples: [] });
    }

    const entry = typologyMap.get(type)!;
    entry.count++;
    if (text && entry.examples.length < 5) {
      entry.examples.push(text);
    }
  }

  // ---- IMPORT PROPOSAL SUMMARY ----
  // Convert Map to object for JSON storage
  const typologies: Record<string, { count: number; examples: string[] }> = {};
  typologyMap.forEach((value, key) => {
    typologies[key] = value;
  });

  // Extract metrics from insights score if available
  const metrics = insights.score?.detail_distribution || {};

  // Extract economicFocus from insights overview if available
  const economicFocus = insights.overview?.ideological_focus || null;

  await prisma.proposalSummary.upsert({
    where: {
      candidateId_documentId: {
        candidateId,
        documentId,
      },
    },
    update: {
      typologies: typologies as any,
      metrics: metrics as any,
      economicFocus: economicFocus ? String(economicFocus).substring(0, 500) : null,
    },
    create: {
      candidateId,
      documentId,
      typologies: typologies as any,
      metrics: metrics as any,
      economicFocus: economicFocus ? String(economicFocus).substring(0, 500) : null,
    },
  });

  success("Upserted ProposalSummary record.");

  // ---- IMPORT PROPOSAL TYPOLOGY (individual records) ----

  let typologyCount = 0;

  const typologyEntries = Array.from(typologyMap.entries());

  for (const [typology, { count, examples }] of typologyEntries) {
    await prisma.proposalTypology.upsert({
      where: {
        candidateId_documentId_typology: {
          candidateId,
          documentId,
          typology,
        },
      },
      update: {
        count,
        examples,
      },
      create: {
        candidateId,
        documentId,
        typology,
        count,
        examples,
      },
    });

    typologyCount++;
  }

  success(`Inserted ${typologyCount} typology rows.`);

  // ---- IMPORT CANDIDATE INSIGHTS ----
  step("Importing CandidateInsights");

  await prisma.candidateInsights.upsert({
    where: {
      candidateId_documentId: {
        candidateId,
        documentId,
      },
    },
    update: {
      overview: insights.overview || {},
      patterns: insights.patterns || {},
      detailLevels: insights.detail_level_by_topic || {},
      score: insights.score || {},
    },
    create: {
      candidateId,
      documentId,
      overview: insights.overview || {},
      patterns: insights.patterns || {},
      detailLevels: insights.detail_level_by_topic || {},
      score: insights.score || {},
    },
  });

  success("Upserted CandidateInsights record.");

  // ---- DONE ----
  success(
    `Import complete:
    • ${thematicCount} thematic classifications
    • ${typologyCount} typologies
    • 1 proposal summary
    • 1 insights record`
  );

  await prisma.$disconnect();
}

main().catch((err) => {
  error("Import failed");
  console.error(err);
  process.exit(1);
});
