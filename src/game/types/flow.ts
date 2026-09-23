import type { PlayerRole } from "./player";

// Deux cartes pour l'instant (voir game/maps/bellevue.ts et
// game/maps/vieux-port.ts). Quand une troisième arrivera, ce type
// s'étendra pareil — ou sera dérivé d'un registre de cartes.
export type MapId = "bellevue" | "vieux-port";

// Le rôle choisi par le joueur humain avant la partie.
// Réutilise PlayerRole : c'est exactement la même notion
// (détective ou Mister X), pas besoin d'un type séparé.
export interface GameConfig {
  mapId: MapId;
  userRole: PlayerRole;
}

export type AppScreen = "start" | "rules" | "setup" | "game";
