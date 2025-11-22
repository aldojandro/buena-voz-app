/**
 * Utility functions for analytics and comparison data processing
 */

/**
 * Convert a party name to a URL-friendly slug
 */
export function partyToSlug(party: string | null): string {
  if (!party) return "";
  return party
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Remove accents
    .replace(/[^a-z0-9]+/g, "-") // Replace non-alphanumeric with hyphens
    .replace(/^-+|-+$/g, ""); // Remove leading/trailing hyphens
}

/**
 * Convert a slug back to a party name (approximate)
 */
export function slugToParty(slug: string): string {
  // Common mappings for known parties
  const mappings: Record<string, string> = {
    "fuerza-popular": "Fuerza Popular",
    "peru-libre": "Perú Libre",
    "accion-popular": "Acción Popular",
    "partido-morado": "Partido Morado",
    "juntos-por-el-peru": "Juntos por el Perú",
    "renovacion-popular": "Renovación Popular",
    "avanza-pais": "Avanza País",
    "partido-popular-cristiano": "Partido Popular Cristiano",
    "frente-amplio": "Frente Amplio",
    "somos-peru": "Somos Perú",
    "union-por-el-peru": "Unión por el Perú",
    "democracia-directa": "Democracia Directa",
    "renacimiento-unido-nacional": "Renacimiento Unido Nacional",
    "victoria-nacional": "Victoria Nacional",
    "partido-nacionalista-peruano": "Partido Nacionalista Peruano",
    "frente-de-la-esperanza": "Frente de la Esperanza",
    "podemos-peru": "Podemos Perú",
    "peru-patria-segura": "Perú Patria Segura",
    "alianza-para-el-progreso": "Alianza para el Progreso",
  };

  return mappings[slug] || slug;
}

/**
 * Format a score as a percentage
 */
export function formatScore(score: number): string {
  return `${Math.round(score * 100)}%`;
}

/**
 * Get detail level score (1-5 scale) from detail level string
 */
export function detailLevelToScore(level: "alto" | "medio" | "bajo"): number {
  const mapping = {
    alto: 5,
    medio: 3,
    bajo: 1,
  };
  return mapping[level] || 1;
}

/**
 * Normalize category names for comparison
 */
export function normalizeCategoryName(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

