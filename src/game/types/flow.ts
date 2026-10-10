import type { PlayerRole } from "./player";

// Vieux-Port en premier : c'est la carte proposée par défaut / en tête
// de liste dans l'écran de configuration (voir game/maps/index.ts, dont
// l'ordre d'insertion pilote l'ordre d'affichage).
export type MapId = "vieux-port" | "grand-boulevard";

export interface GameConfig {
  mapId: MapId;
  userRole: PlayerRole;
}

export type AppScreen = "start" | "rules" | "setup" | "game";
