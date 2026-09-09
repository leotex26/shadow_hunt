import type { GameMap } from "../types/map";

export const bellevue: GameMap = {
  id: "bellevue",
  name: "Bellevue",

  stations: [
    {
      id: 1,
      name: "Forêt",
      x: 15,
      y: 20,
    },
    {
      id: 2,
      name: "École",
      x: 35,
      y: 25,
    },
    {
      id: 3,
      name: "Mairie",
      x: 55,
      y: 20,
    },
    {
      id: 4,
      name: "Gare",
      x: 75,
      y: 25,
    },
    {
      id: 5,
      name: "Parc",
      x: 20,
      y: 45,
    },
    {
      id: 6,
      name: "Centre-ville",
      x: 50,
      y: 45,
    },
    {
      id: 7,
      name: "Marché",
      x: 75,
      y: 45,
    },
    {
      id: 8,
      name: "Lac",
      x: 25,
      y: 70,
    },
    {
      id: 9,
      name: "Hôpital",
      x: 50,
      y: 70,
    },
    {
      id: 10,
      name: "Port",
      x: 80,
      y: 70,
    },
    {
      id: 11,
      name: "Université",
      x: 55,
      y: 90,
    },
  ],

  connections: [
    // =====================
    // TAXI UNIQUEMENT
    // =====================

    {
      from: 1,
      to: 2,
      transports: ["taxi"],
    },

    {
      from: 1,
      to: 3,
      transports: ["taxi"],
    },

    {
      from: 2,
      to: 5,
      transports: ["taxi"],
    },

    {
      from: 3,
      to: 4,
      transports: ["taxi"],
    },

    {
      from: 5,
      to: 8,
      transports: ["taxi"],
    },

    {
      from: 9,
      to: 11,
      transports: ["taxi"],
    },

    // =====================
    // TAXI + BUS
    // =====================

    {
      from: 2,
      to: 3,
      transports: ["taxi", "bus"],
    },

    {
      from: 3,
      to: 6,
      transports: ["taxi", "bus"],
    },

    {
      from: 5,
      to: 6,
      transports: ["taxi", "bus"],
    },

    {
      from: 6,
      to: 7,
      transports: ["taxi", "bus"],
    },

    {
      from: 8,
      to: 9,
      transports: ["taxi", "bus"],
    },

    {
      from: 10,
      to: 11,
      transports: ["taxi", "bus"],
    },

    // =====================
    // TAXI + MÉTRO
    // =====================

    {
      from: 2,
      to: 6,
      transports: ["taxi", "metro"],
    },

    {
      from: 4,
      to: 7,
      transports: ["taxi", "metro"],
    },

    {
      from: 6,
      to: 9,
      transports: ["taxi", "metro"],
    },

    {
      from: 9,
      to: 10,
      transports: ["taxi", "metro"],
    },

    // =====================
    // TAXI + BUS + MÉTRO
    // =====================

    {
      from: 6,
      to: 9,
      transports: ["taxi", "bus", "metro"],
    },
  ],
};