import type { Difficulty } from "./types/flow";

// Libellés des niveaux de difficulté, partagés par l'écran de
// configuration (avant la partie) et les réglages en cours de partie.
export const DIFFICULTY_OPTIONS: { id: Difficulty; label: string; description: string }[] = [
  {
    id: "easy",
    label: "Facile",
    description: "L'ordinateur hésite et fait des erreurs.",
  },
  {
    id: "normal",
    label: "Normal",
    description: "Un adversaire sérieux, mais qui reste battable.",
  },
  {
    id: "hard",
    label: "Difficile",
    description: "L'ordinateur joue presque toujours le meilleur coup.",
  },
];
