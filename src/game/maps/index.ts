import type { GameMap } from "../types/map";
import type { MapId } from "../types/flow";

import { bellevue } from "./bellevue";
import { vieuxPort } from "./vieux-port";

// Ajouter une carte = ajouter son fichier ici (game/maps/london.ts, etc.)
// et une entrée dans ce registre.
export const maps: Record<MapId, GameMap> = {
  bellevue,
  "vieux-port": vieuxPort,
};
