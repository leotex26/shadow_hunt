import type { Player } from "./types/player";

export const players: Player[] = [
  {
    id: "detective-1",
    name: "Détective 1",
    role: "detective",

    position: 2,

    tickets: {
      taxi: 10,
      bus: 6,
      metro: 3,
    },
  },

  {
    id: "detective-2",
    name: "Détective 2",
    role: "detective",

    position: 5,

    tickets: {
      taxi: 10,
      bus: 6,
      metro: 3,
    },
  },

  {
    id: "mister-x",
    name: "Mister X",
    role: "mister-x",

    position: 8,

    tickets: {
      taxi: 10,
      bus: 6,
      metro: 3,
      black: 2,
    },
  },
];