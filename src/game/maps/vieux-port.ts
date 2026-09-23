import type { GameMap } from "../types/map";

export const vieuxPort: GameMap = {
  id: "vieux-port",
  name: "Vieux-Port",
  description: "Un quartier portuaire plus vaste, pour une partie plus longue et plus tactique.",

  stations: [
    // Quai (rangée du haut)
    { id: 1, name: "Quai Nord", x: 10, y: 12 },
    { id: 2, name: "Entrepôt", x: 25, y: 10 },
    { id: 3, name: "Capitainerie", x: 40, y: 12 },
    { id: 4, name: "Phare", x: 55, y: 10 },
    { id: 5, name: "Chantier Naval", x: 70, y: 12 },
    { id: 6, name: "Douanes", x: 85, y: 15 },

    // Rangée intermédiaire haute
    { id: 7, name: "Marché", x: 15, y: 32 },
    { id: 8, name: "Taverne", x: 32, y: 30 },
    { id: 9, name: "Gare", x: 48, y: 32 },
    { id: 10, name: "Pont Levant", x: 63, y: 30 },
    { id: 11, name: "Caserne", x: 80, y: 33 },

    // Rangée intermédiaire basse
    { id: 12, name: "Vieille Ville", x: 12, y: 52 },
    { id: 13, name: "Cathédrale", x: 28, y: 50 },
    { id: 14, name: "Place Centrale", x: 45, y: 53 },
    { id: 15, name: "Banque", x: 60, y: 50 },
    { id: 16, name: "Théâtre", x: 78, y: 53 },

    // Rangée du bas
    { id: 17, name: "Ruelles", x: 15, y: 75 },
    { id: 18, name: "Usine", x: 32, y: 73 },
    { id: 19, name: "Cimetière", x: 50, y: 76 },
    { id: 20, name: "Sortie Sud", x: 68, y: 74 },
  ],

  connections: [
    // =====================
    // TAXI SEUL
    // =====================
    { from: 1, to: 2, transports: ["taxi"] },
    { from: 3, to: 4, transports: ["taxi"] },
    { from: 5, to: 6, transports: ["taxi"] },
    { from: 8, to: 9, transports: ["taxi"] },
    { from: 12, to: 13, transports: ["taxi"] },
    { from: 15, to: 16, transports: ["taxi"] },
    { from: 18, to: 19, transports: ["taxi"] },
    { from: 3, to: 8, transports: ["taxi"] },
    { from: 7, to: 12, transports: ["taxi"] },
    { from: 11, to: 16, transports: ["taxi"] },
    { from: 13, to: 18, transports: ["taxi"] },
    { from: 15, to: 20, transports: ["taxi"] },

    // =====================
    // TAXI + BUS
    // =====================
    { from: 2, to: 3, transports: ["taxi", "bus"] },
    { from: 4, to: 5, transports: ["taxi", "bus"] },
    { from: 7, to: 8, transports: ["taxi", "bus"] },
    { from: 10, to: 11, transports: ["taxi", "bus"] },
    { from: 13, to: 14, transports: ["taxi", "bus"] },
    { from: 17, to: 18, transports: ["taxi", "bus"] },
    { from: 19, to: 20, transports: ["taxi", "bus"] },
    { from: 10, to: 15, transports: ["taxi", "bus"] },

    // =====================
    // TAXI + MÉTRO
    // =====================
    { from: 1, to: 7, transports: ["taxi", "metro"] },
    { from: 4, to: 9, transports: ["taxi", "metro"] },
    { from: 6, to: 11, transports: ["taxi", "metro"] },
    { from: 9, to: 14, transports: ["taxi", "metro"] },
    { from: 12, to: 17, transports: ["taxi", "metro"] },
    { from: 14, to: 19, transports: ["taxi", "metro"] },

    // =====================
    // TAXI + BUS + MÉTRO
    // (correspondances principales)
    // =====================
    { from: 9, to: 10, transports: ["taxi", "bus", "metro"] },
    { from: 14, to: 15, transports: ["taxi", "bus", "metro"] },
  ],

  // Vieux-Port fait presque le double de Bellevue (20 stations contre
  // 11) : plus de terrain à couvrir pour les détectives, donc une
  // partie plus longue et des réserves de tickets plus généreuses.
  balance: {
    ticketsByRole: {
      detective: {
        taxi: 6,
        bus: 4,
        metro: 3,
      },

      "mister-x": {
        taxi: 6,
        bus: 4,
        metro: 3,
        black: 3,
      },
    },

    startingPositions: {
      detectives: [2, 16],
      misterX: 9,
    },

    revealTurns: [3, 7, 11, 15, 18],
    finalTurn: 18,
  },
};
