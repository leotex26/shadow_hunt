import type { PlayerRole } from "./player";

// Trois cartes pour l'instant (voir game/maps/vieux-port.ts,
// grand-boulevard.ts et les-canaux.ts). Une quatrième s'ajoutera ici de la
// même façon — ou ce type sera dérivé du registre de cartes.
export type MapId = "vieux-port" | "grand-boulevard" | "les-canaux";

// Niveau de l'IA qui joue le camp que l'humain ne contrôle pas (voir
// game/engine/ai.ts : AI_PROFILES).
export type Difficulty = "easy" | "normal" | "hard";

// Le rôle choisi par le joueur humain avant la partie.
// Réutilise PlayerRole : c'est exactement la même notion
// (détective ou Mister X), pas besoin d'un type séparé.
export interface GameConfig {
  mapId: MapId;
  userRole: PlayerRole;

  // Optionnel : une partie sauvegardée avant l'arrivée des niveaux n'en a
  // pas, et se rejoue en "normal".
  difficulty?: Difficulty;
}

export type AppScreen = "start" | "rules" | "setup" | "game";
