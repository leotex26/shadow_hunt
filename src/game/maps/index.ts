import type { MapId } from "../types/flow";
import type { GameMap } from "../types/map";
import { vieuxPort } from "./vieux-port";
import { grandBoulevard } from "./grand-boulevard";
import { lesCanaux } from "./les-canaux";

export const maps: Record<MapId, GameMap> = {
  "vieux-port": vieuxPort,
  "grand-boulevard": grandBoulevard,
  "les-canaux": lesCanaux,
};
