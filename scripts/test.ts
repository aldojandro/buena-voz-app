import { prisma } from "../lib/prisma";

async function test() {
  // Primero obtener un candidato y documento existentes
  const candidate = await prisma.candidate.findFirst();
  const document = await prisma.document.findFirst();

  if (!candidate || !document) {
    console.error("No se encontraron candidatos o documentos. Ejecuta el seed primero.");
    process.exit(1);
  }

  const result = await prisma.thematicClassification.create({
    data: {
      candidateId: candidate.id,
      documentId: document.id,
      category: "Test Category",
      count: 1,
      examples: ["Example 1", "Example 2"]
    }
  });

  console.log("✅ ThematicClassification creado:", result);
  await prisma.$disconnect();
}

test().catch(console.error);
