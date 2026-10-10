import type { MapId } from "../types/flow";
import type { GameMap } from "../types/map";

import { vieuxPort } from "./vieux-port";
import { grandBoulevard } from "./grand-boulevard";

// L'ordre d'insertion ici pilote l'ordre d'affichage dans l'écran de
// configuration (GameSetup.tsx fait Object.entries(maps)) : Vieux-Port
// est donc bien la première carte proposée, Grand Boulevard la seconde
// (et la plus grande).
export const maps: Record<MapId, GameMap> = {
  "vieux-port": vieuxPort,
  "grand-boulevard": grandBoulevard,
};
