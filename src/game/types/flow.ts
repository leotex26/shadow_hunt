import type { PlayerRole } from "./player";
 
// Une seule carte pour l'instant (voir game/maps/bellevue.ts).
// Quand une deuxième carte arrivera, ce type deviendra
// "bellevue" | "london" | ... — ou sera dérivé d'un registre de cartes.
export type MapId = "bellevue";
 
// Le rôle choisi par le joueur humain avant la partie.
// Réutilise PlayerRole : c'est exactement la même notion
// (détective ou Mister X), pas besoin d'un type séparé.
export interface GameConfig {
  mapId: MapId;
  userRole: PlayerRole;
}
 
export type AppScreen = "start" | "setup" | "game";