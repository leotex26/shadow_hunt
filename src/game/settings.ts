// Préférences d'affichage/jeu, indépendantes de la partie en cours : elles
// restent d'une partie à l'autre (contrairement à la difficulté, qui fait
// partie de la partie sauvegardée).

const SETTINGS_KEY = "shadow-hunt-settings-v1";

export type AiSpeed = "slow" | "normal" | "fast";

// Délai (en ms) avant que l'ordinateur joue son coup : le temps de voir
// ce qui se passe, ou au contraire d'enchaîner vite.
export const AI_SPEED_DELAYS: Record<AiSpeed, number> = {
  slow: 1200,
  normal: 600,
  fast: 200,
};

export const AI_SPEED_OPTIONS: { id: AiSpeed; label: string }[] = [
  { id: "slow", label: "Lente" },
  { id: "normal", label: "Normale" },
  { id: "fast", label: "Rapide" },
];

export const DEFAULT_AI_SPEED: AiSpeed = "normal";

function isAiSpeed(value: unknown): value is AiSpeed {
  return value === "slow" || value === "normal" || value === "fast";
}

export function loadAiSpeed(): AiSpeed {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);

    if (!raw) {
      return DEFAULT_AI_SPEED;
    }

    const parsed: unknown = JSON.parse(raw);

    if (typeof parsed === "object" && parsed !== null && "aiSpeed" in parsed) {
      const { aiSpeed } = parsed as { aiSpeed: unknown };

      return isAiSpeed(aiSpeed) ? aiSpeed : DEFAULT_AI_SPEED;
    }

    return DEFAULT_AI_SPEED;
  } catch {
    // Stockage indisponible ou contenu illisible : valeur par défaut.
    return DEFAULT_AI_SPEED;
  }
}

export function saveAiSpeed(aiSpeed: AiSpeed): void {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify({ aiSpeed }));
  } catch {
    // Pas de stockage (navigation privée...) : le réglage vaut pour la
    // session en cours seulement.
  }
}
