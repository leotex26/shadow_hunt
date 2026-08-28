import type { GameMap } from "../types/map";

export const bellevue: GameMap = {
  id: "bellevue",
  name: "Bellevue",

  stations: [
    {
      id: 1,
      name: "Forêt",
      x: 50,
      y: 8
    },
    {
      id: 2,
      name: "École",
      x: 20,
      y: 25
    },
    {
      id: 3,
      name: "Mairie",
      x: 50,
      y: 25
    },
    {
      id: 4,
      name: "Gare",
      x: 80,
      y: 25
    },
    {
      id: 5,
      name: "Parc",
      x: 20,
      y: 50
    },
    {
      id: 6,
      name: "Place centrale",
      x: 50,
      y: 50
    },
    {
      id: 7,
      name: "Marché",
      x: 80,
      y: 50
    },
    {
      id: 8,
      name: "Port",
      x: 20,
      y: 75
    },
    {
      id: 9,
      name: "Café",
      x: 50,
      y: 75
    },
    {
      id: 10,
      name: "Stade",
      x: 80,
      y: 75
    },
    {
      id: 11,
      name: "Ferme",
      x: 50,
      y: 92
    }
  ],

  connections: [
    // Taxi
    { from: 1, to: 3, transport: "taxi" },
    { from: 2, to: 3, transport: "taxi" },
    { from: 3, to: 4, transport: "taxi" },
    { from: 5, to: 6, transport: "taxi" },
    { from: 6, to: 7, transport: "taxi" },
    { from: 8, to: 9, transport: "taxi" },
    { from: 9, to: 10, transport: "taxi" },
    { from: 10, to: 11, transport: "taxi" },

    // Bus
    { from: 2, to: 5, transport: "bus" },
    { from: 4, to: 7, transport: "bus" },
    { from: 6, to: 9, transport: "bus" },

    // Métro
    { from: 3, to: 6, transport: "metro" },
    { from: 5, to: 8, transport: "metro" },
    { from: 9, to: 11, transport: "metro" }
  ]
};