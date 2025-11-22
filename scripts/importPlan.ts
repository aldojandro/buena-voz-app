import "dotenv/config";
import path from "path";
import fs from "fs";
import { prisma } from "../lib/prisma";
import { readPdfText, splitIntoSections } from "../lib/pdf";
import { runLocalLLM } from "../lib/localLLM";
import { info, step, success, error } from "../lib/logger";

async function main() {
  const pdfPath = process.argv[2];
  const candidateName = process.argv[3];

  if (!pdfPath || !candidateName) {
    error("Usage: npx tsx scripts/importPlan.ts <pdf-path> <candidate-name>");
    process.exit(1);
  }

  const fullPath = path.resolve(pdfPath);

  try {
    step("[1/6] Reading PDF");
    if (!fs.existsSync(fullPath)) {
      throw new Error(`PDF file not found: ${fullPath}`);
    }
    const text = await readPdfText(fullPath);
    success(`Read ${text.length} characters from PDF`);

    step("[2/6] Validating candidate");
    const election = await prisma.election.findFirst({
      where: { year: 2021, type: "presidential", country: "Peru" },
    });

    if (!election) {
      throw new Error("Election 2021 not found. Run seed first.");
    }

    const candidate = await prisma.candidate.findFirst({
      where: {
        electionId: election.id,
        name: { contains: candidateName, mode: "insensitive" },
      },
    });

    if (!candidate) {
      throw new Error(`Candidate "${candidateName}" not found`);
    }
    success(`Found candidate: ${candidate.name}`);

    step("[3/6] Creating document");
    const document = await prisma.document.create({
      data: {
        electionId: election.id,
        title: path.basename(fullPath, ".pdf"),
        source: "PDF Import",
        url: fullPath,
      },
    });
    success(`Created document: ${document.id}`);

    step("[4/6] Splitting text into sections");
    const sections = splitIntoSections(text);
    success(`Created ${sections.length} sections`);

    step("[5/6] Saving sections and extracting proposals");
    for (let i = 0; i < sections.length; i++) {
      const sectionText = sections[i];
      info(`Processing section ${i + 1}/${sections.length}`);

      try {
        const section = await prisma.section.create({
          data: {
            documentId: document.id,
            title: `Sección ${i + 1}`,
            content: sectionText,
            order: i,
          },
        });

        const llmOutput = await runLocalLLM(sectionText);
        
        // Try parsing proposals safely
        let proposals: any[] = [];
        try {
          const parsed = JSON.parse(llmOutput);
          // Handle both array format and object with proposals array
          if (Array.isArray(parsed)) {
            proposals = parsed;
          } else if (parsed.proposals && Array.isArray(parsed.proposals)) {
            proposals = parsed.proposals;
          }
        } catch (parseErr) {
          error(`  Failed to parse LLM output`, parseErr);
          proposals = [];
        }
        
        info(`  Extracted ${proposals.length} proposals`);

        for (let j = 0; j < proposals.length; j++) {
          const proposalData = proposals[j];
          // Handle both formats: {text: "..."} and {title: "...", description: "...", category: "..."}
          const proposalText = proposalData.text || proposalData.description || proposalData.title || "";
          const proposalTitle = proposalData.title || proposalText.substring(0, 200);
          
          if (!proposalText || proposalText.trim().length < 10) {
            continue;
          }

          try {
            const proposal = await prisma.proposal.create({
              data: {
                sectionId: section.id,
                title: proposalTitle,
                content: proposalText,
                order: j,
              },
            });

            // Store category as classification if available
            if (proposalData.category) {
              await prisma.classification.create({
                data: {
                  proposalId: proposal.id,
                  category: proposalData.category || "Sin categoría",
                  tags: [],
                  description: JSON.stringify({
                    source: "localLLM",
                    title: proposalData.title,
                  }),
                },
              });
            }
          } catch (err) {
            error(`  Failed to process proposal ${j + 1}`, err);
          }
        }
      } catch (err) {
        error(`Failed to process section ${i + 1}`, err);
      }
    }

    step("[6/6] Finalizing");
    const finalDoc = await prisma.document.findUnique({
      where: { id: document.id },
      include: {
        sections: {
          include: {
            proposals: {
              include: {
                classifications: true,
              },
            },
          },
        },
      },
    });

    const totalSections = finalDoc?.sections.length || 0;
    const totalProposals = finalDoc?.sections.reduce(
      (sum, s) => sum + s.proposals.length,
      0
    ) || 0;
    const totalClassifications = finalDoc?.sections.reduce(
      (sum, s) => sum + s.proposals.reduce((pSum, p) => pSum + p.classifications.length, 0),
      0
    ) || 0;

    success(`Import complete: ${totalSections} sections, ${totalProposals} proposals, ${totalClassifications} classifications`);
  } catch (err) {
    error("Import failed", err);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();

