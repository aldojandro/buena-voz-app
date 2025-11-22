import "dotenv/config";
import { prisma } from "../lib/prisma";

type CandidateSeed = {
  key: string;
  name: string;
  party: string;
  ideology?: string | null;
  photoUrl?: string | null;
};

const DEFAULT_IDEOLOGY = "Por definir";

const candidateSeeds: CandidateSeed[] = [
  {
    key: "andresAlcantara",
    name: "Andrés Alcántara",
    party: "Democracia Directa",
  },
  {
    key: "ciroGalvez",
    name: "Ciro Gálvez",
    party: "Renacimiento Unido Nacional",
  },
  {
    key: "danielSalaverry",
    name: "Daniel Salaverry",
    party: "Somos Perú",
  },
  {
    key: "joseVega",
    name: "José Vega",
    party: "Unión por el Perú",
  },
  {
    key: "julioGuzman",
    name: "Julio Guzmán",
    party: "Partido Morado",
  },
  {
    key: "keikoFujimori",
    name: "Keiko Fujimori",
    party: "Fuerza Popular",
  },
  {
    key: "marcoArana",
    name: "Marco Arana",
    party: "Frente Amplio",
  },
  {
    key: "georgeForsyth",
    name: "George Forsyth",
    party: "Victoria Nacional",
  },
  {
    key: "albertoBeingolea",
    name: "Alberto Beingolea",
    party: "Partido Popular Cristiano",
  },
  {
    key: "pedroCastillo",
    name: "Pedro Castillo",
    party: "Perú Libre",
  },
  {
    key: "rafaelLopezAliaga",
    name: "Rafael López Aliaga",
    party: "Renovación Popular",
  },
  {
    key: "veronikaMendoza",
    name: "Verónika Mendoza",
    party: "Juntos por el Perú",
  },
  {
    key: "yonhyLescano",
    name: "Yonhy Lescano",
    party: "Acción Popular",
  },
  {
    key: "hernandoDeSoto",
    name: "Hernando de Soto",
    party: "Avanza País",
  },
  {
    key: "ollantaHumala",
    name: "Ollanta Humala",
    party: "Partido Nacionalista Peruano",
  },
  {
    key: "joseAlejandroNieto",
    name: "José Alejandro Nieto",
    party: "Frente de la Esperanza",
  },
  {
    key: "danielUrresti",
    name: "Daniel Urresti",
    party: "Podemos Perú",
  },
  {
    key: "rafaelSantos",
    name: "Rafael Santos",
    party: "Perú Patria Segura",
  },
  {
    key: "cesarAcuna",
    name: "César Acuña",
    party: "Alianza para el Progreso",
  },
  {
    key: "franciscoDiezCanseco",
    name: "Francisco Diez Canseco",
    party: "Perú Nación",
  },
  {
    key: "joseLunaGalvez",
    name: "José Luna Gálvez",
    party: "Podemos Perú",
  },
  {
    key: "wilmerRivera",
    name: "Wilmer Rivera",
    party: "Fe en el Perú",
  },
];

async function createCandidate(electionId: string, candidate: CandidateSeed) {
  const ideology = candidate.ideology ?? DEFAULT_IDEOLOGY;
  const photoUrl = candidate.photoUrl ?? null;
  const metadata = JSON.stringify({ ideology, photoUrl });

  return prisma.candidate.upsert({
    where: { id: candidate.key },
    update: {
      name: candidate.name,
      party: candidate.party,
      electionId,
      position: metadata,
    },
    create: {
      id: candidate.key,
      electionId,
      name: candidate.name,
      party: candidate.party,
      position: metadata,
    },
  });
}

async function main() {
  try {
    // Test connection first
    await prisma.$connect();
    
    const election = await prisma.election.upsert({
      where: {
        year_type_country: { year: 2021, type: "presidential", country: "Peru" },
      },
      update: {},
      create: {
        year: 2021,
        type: "presidential",
        country: "Peru",
        name: "Elecciones presidenciales Perú 2021",
      },
    });

    // Process candidates sequentially to avoid connection issues
    for (const candidate of candidateSeeds) {
      await createCandidate(election.id, candidate);
    }

    console.log(`Seeded ${candidateSeeds.length} candidates for election ${election.year}.`);
  } catch (error) {
    console.error("Seed error:", error);
    throw error;
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
