import OpenAI from "openai";

const client = process.env.OPENAI_API_KEY
  ? new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    })
  : null;

const MAX_RETRIES = 3;
const RETRY_DELAY = 1000;

async function retry<T>(fn: () => Promise<T>, retries = MAX_RETRIES): Promise<T> {
  try {
    return await fn();
  } catch (error) {
    if (retries > 0) {
      await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY));
      return retry(fn, retries - 1);
    }
    throw error;
  }
}

export interface Proposal {
  text: string;
}

export interface ProposalResponse {
  proposals: Proposal[];
}

export interface Classification {
  category: string;
  subcategory: string;
  type: "continuidad" | "mejora" | "reforma" | "ruptura" | "sin_detalle";
  detailLevel: number;
  economicFocus: "mercado" | "estado" | "mixto" | "none";
  impactLevel: "bajo" | "medio" | "alto";
  tags: string[];
}

export async function extractProposals(text: string): Promise<Proposal[]> {
  if (!text || text.trim().length < 50) {
    return [];
  }

  if (!client) {
    throw new Error("OPENAI_API_KEY not set");
  }

  const prompt = `Extrae una lista JSON de propuestas concretas del siguiente texto.

Una propuesta debe ser una medida clara, específica y accionable.

Devuelve SOLO JSON con:
{ "proposals": [ { "text": "..." } ] }

Texto:
${text.substring(0, 8000)}`;

  return retry(async () => {
    const response = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "Eres un asistente que extrae propuestas de planes de gobierno. Responde SOLO con JSON válido.",
        },
        { role: "user", content: prompt },
      ],
      response_format: { type: "json_object" },
      temperature: 0.3,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      return [];
    }

    try {
      const parsed = JSON.parse(content) as ProposalResponse;
      return parsed.proposals || [];
    } catch {
      return [];
    }
  });
}

export async function classifyProposal(proposal: string): Promise<Classification | null> {
  if (!proposal || proposal.trim().length < 10) {
    return null;
  }

  if (!client) {
    throw new Error("OPENAI_API_KEY not set");
  }

  const prompt = `Clasifica esta propuesta en JSON.

Devuelve SOLO JSON con:
{
  "category": "...",
  "subcategory": "...",
  "type": "continuidad | mejora | reforma | ruptura | sin_detalle",
  "detailLevel": 1-5,
  "economicFocus": "mercado | estado | mixto | none",
  "impactLevel": "bajo | medio | alto",
  "tags": []
}

Propuesta:
${proposal.substring(0, 2000)}`;

  return retry(async () => {
    const response = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "Eres un asistente que clasifica propuestas de planes de gobierno. Responde SOLO con JSON válido.",
        },
        { role: "user", content: prompt },
      ],
      response_format: { type: "json_object" },
      temperature: 0.3,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      return null;
    }

    try {
      return JSON.parse(content) as Classification;
    } catch {
      return null;
    }
  });
}

