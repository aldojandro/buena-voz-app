import { prisma } from "../prisma";
import { partyToSlug, slugToParty } from "./utils";

export interface ComparisonData {
  candidateA: {
    candidate: any;
    document: any;
    thematic: any[];
    typology: any[];
    insights: any;
  };
  candidateB: {
    candidate: any;
    document: any;
    thematic: any[];
    typology: any[];
    insights: any;
  };
}

/**
 * Fetch all comparison data for two candidates by party slugs
 */
export async function fetchComparisonData(
  candidateASlug: string,
  candidateBSlug: string
): Promise<ComparisonData | null> {
  // Convert slugs to party names
  const partyA = slugToParty(candidateASlug);
  const partyB = slugToParty(candidateBSlug);

  // Find election
  const election = await prisma.election.findFirst({
    where: { year: 2021, type: "presidential", country: "Peru" },
  });

  if (!election) {
    return null;
  }

  // Find candidates by party
  const candidateA = await prisma.candidate.findFirst({
    where: {
      electionId: election.id,
      party: partyA,
    },
  });

  const candidateB = await prisma.candidate.findFirst({
    where: {
      electionId: election.id,
      party: partyB,
    },
  });

  if (!candidateA || !candidateB) {
    return null;
  }

  // Find documents via CandidateInsights (documents are linked through analytics)
  const allInsightsA = await prisma.candidateInsights.findMany({
    where: {
      candidateId: candidateA.id,
      document: {
        electionId: election.id,
      },
    },
    include: {
      document: true,
    },
  });

  const allInsightsB = await prisma.candidateInsights.findMany({
    where: {
      candidateId: candidateB.id,
      document: {
        electionId: election.id,
      },
    },
    include: {
      document: true,
    },
  });

  // Sort by document creation date and get the latest
  const insightsA = allInsightsA.sort(
    (a, b) => b.document.createdAt.getTime() - a.document.createdAt.getTime()
  )[0];

  const insightsB = allInsightsB.sort(
    (a, b) => b.document.createdAt.getTime() - a.document.createdAt.getTime()
  )[0];

  if (!insightsA?.document || !insightsB?.document) {
    return null;
  }

  const documentA = insightsA.document;
  const documentB = insightsB.document;

  // Fetch all analytics data for candidate A
  const thematicA = await prisma.thematicClassification.findMany({
    where: {
      candidateId: candidateA.id,
      documentId: documentA.id,
    },
  });

  const typologyA = await prisma.proposalTypology.findMany({
    where: {
      candidateId: candidateA.id,
      documentId: documentA.id,
    },
  });

  // Fetch all analytics data for candidate B
  const thematicB = await prisma.thematicClassification.findMany({
    where: {
      candidateId: candidateB.id,
      documentId: documentB.id,
    },
  });

  const typologyB = await prisma.proposalTypology.findMany({
    where: {
      candidateId: candidateB.id,
      documentId: documentB.id,
    },
  });

  return {
    candidateA: {
      candidate: candidateA,
      document: documentA,
      thematic: thematicA,
      typology: typologyA,
      insights: insightsA,
    },
    candidateB: {
      candidate: candidateB,
      document: documentB,
      thematic: thematicB,
      typology: typologyB,
      insights: insightsB,
    },
  };
}

