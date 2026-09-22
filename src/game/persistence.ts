import type { GameConfig } from "./types/flow";
import type { Player } from "./types/player";
import type { MisterXMoveRecord } from "./types/history";

const SAVE_KEY = "shadow-hunt-save-v1";

export interface SavedGame {
  config: GameConfig;
  gamePlayers: Player[];
  activePlayerIndex: number;
  turnNumber: number;
  misterXLastKnownPosition: number | null;
  misterXLastRevealTurn: number | null;
  misterXMoveHistory: MisterXMoveRecord[];
  winner: "detectives" | "mister-x" | null;
}

// Un contrôle minimal plutôt qu'une vraie validation de schéma : le but
// est juste d'éviter un crash si une ancienne sauvegarde, écrite par une
// version antérieure du jeu, ne correspond plus à la forme attendue.
function isSavedGame(value: unknown): value is SavedGame {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const candidate = value as Partial<SavedGame>;

  return (
    typeof candidate.config === "object" &&
    candidate.config !== null &&
    Array.isArray(candidate.gamePlayers) &&
    typeof candidate.activePlayerIndex === "number" &&
    typeof candidate.turnNumber === "number"
  );
}

export function saveGame(state: SavedGame): void {
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify(state));
  } catch {
    // Stockage indisponible (navigation privée, quota dépassé...) :
    // on continue sans sauvegarde plutôt que de casser la partie.
  }
}

export function loadGame(): SavedGame | null {
  try {
    const raw = localStorage.getItem(SAVE_KEY);

    if (!raw) {
      return null;
    }

    const parsed: unknown = JSON.parse(raw);

    if (!isSavedGame(parsed)) {
      return null;
    }

    return parsed;
  } catch {
    return null;
  }
}

export function clearSavedGame(): void {
  try {
    localStorage.removeItem(SAVE_KEY);
  } catch {
    // Rien à faire si le stockage n'est pas accessible.
  }
}
