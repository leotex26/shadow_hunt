import type { GameMap } from "../types/map";

// Grand Boulevard : 28 stations (contre 20 pour Vieux-Port), organisées
// en cinq avenues est-ouest reliées par des rues perpendiculaires. Les
// positions sont volontairement légèrement déformées (pas de grille
// régulière) pour un tracé plus organique : les stations sautées par un
// bus ou un métro restent toutefois à moins de ~4 % de la ligne qui les
// croise, pour qu'on les voie bien "passer devant".
//
// Trois réseaux, du plus dense au plus rare :
//   - TAXI  : toutes les rues, de station voisine à station voisine
//             (13 stations desservies = toutes les 28).
//   - BUS   : 13 stations seulement. Chaque liaison saute par-dessus une
//             station qui n'est PAS un arrêt de bus : on avance de deux
//             cases pour un seul ticket, ce que le taxi ne sait pas faire.
//   - MÉTRO : 8 stations seulement, avec les plus longs sauts.
//
// Règle de lecture (comme sur le vrai plateau) : une station est un arrêt
// pour un transport si une liaison de ce transport la touche. Une ligne
// peut passer devant une station sans s'y arrêter : on ne peut alors s'y
// rendre qu'avec les autres transports de cette station.
export const grandBoulevard: GameMap = {
  id: "grand-boulevard",
  name: "Grand Boulevard",
  description: "Un vaste quartier d'affaires, pour les parties les plus longues et les plus stratégiques.",

  stations: [
    // Rangée 1 — Porte Nord (haut)
    { id: 1, name: "Porte Nord", x: 5, y: 8 },
    { id: 2, name: "Grand Hôtel", x: 21, y: 10.5 },
    { id: 3, name: "Opéra", x: 35, y: 8 },
    { id: 4, name: "Bourse", x: 52.5, y: 12 },
    { id: 5, name: "Tour d'Affaires", x: 66, y: 8 },
    { id: 6, name: "Gare Centrale", x: 84.5, y: 6 },

    // Rangée 2
    { id: 7, name: "Jardin Public", x: 10.5, y: 23.5 },
    { id: 8, name: "Galerie Marchande", x: 24, y: 32 },
    { id: 9, name: "Préfecture", x: 44, y: 29 },
    { id: 10, name: "Grand Magasin", x: 57, y: 28.5 },
    { id: 11, name: "Ambassade", x: 72.5, y: 28 },
    { id: 12, name: "Hippodrome", x: 91, y: 24.5 },

    // Rangée 3 — le Grand Boulevard lui-même
    { id: 13, name: "Université", x: 10.5, y: 47 },
    { id: 14, name: "Place de la République", x: 28, y: 53 },
    { id: 15, name: "Palais de Justice", x: 45, y: 52.5 },
    { id: 16, name: "Conservatoire", x: 57.5, y: 50.5 },
    { id: 17, name: "Stade", x: 78, y: 50 },
    { id: 18, name: "Caserne Sud", x: 93, y: 46 },

    // Rangée 4
    { id: 19, name: "Marché Couvert", x: 11, y: 63 },
    { id: 20, name: "Quartier Latin", x: 23.5, y: 71.5 },
    { id: 21, name: "Boulevard Sud", x: 43, y: 75.5 },
    { id: 22, name: "Zone Industrielle", x: 60.5, y: 73.5 },
    { id: 23, name: "Port Fluvial", x: 72.5, y: 70 },
    { id: 24, name: "Terminus Est", x: 90.5, y: 62.5 },

    // Rangée 5 — faubourgs (bas, plus étroit)
    { id: 25, name: "Faubourg Ouest", x: 15.5, y: 91.5 },
    { id: 26, name: "Rond-Point", x: 35.5, y: 94 },
    { id: 27, name: "Faubourg Est", x: 49.5, y: 89.5 },
    { id: 28, name: "Terminus Sud", x: 67.5, y: 86 },
  ],

  connections: [
    // =====================
    // TAXI — toutes les rues, de voisin à voisin
    // =====================

    // Rues est-ouest
    { from: 1, to: 2, transports: ["taxi"] },
    { from: 2, to: 3, transports: ["taxi"] },
    { from: 3, to: 4, transports: ["taxi"] },
    { from: 4, to: 5, transports: ["taxi"] },
    { from: 5, to: 6, transports: ["taxi"] },

    { from: 7, to: 8, transports: ["taxi"] },
    { from: 8, to: 9, transports: ["taxi"] },
    { from: 9, to: 10, transports: ["taxi"] },
    { from: 10, to: 11, transports: ["taxi"] },
    { from: 11, to: 12, transports: ["taxi"] },

    { from: 13, to: 14, transports: ["taxi"] },
    { from: 14, to: 15, transports: ["taxi"] },
    { from: 15, to: 16, transports: ["taxi"] },
    { from: 16, to: 17, transports: ["taxi"] },
    { from: 17, to: 18, transports: ["taxi"] },

    { from: 19, to: 20, transports: ["taxi"] },
    { from: 20, to: 21, transports: ["taxi"] },
    { from: 21, to: 22, transports: ["taxi"] },
    { from: 22, to: 23, transports: ["taxi"] },
    { from: 23, to: 24, transports: ["taxi"] },

    { from: 25, to: 26, transports: ["taxi"] },
    { from: 26, to: 27, transports: ["taxi"] },
    { from: 27, to: 28, transports: ["taxi"] },

    // Rues nord-sud
    { from: 1, to: 7, transports: ["taxi"] },
    { from: 2, to: 8, transports: ["taxi"] },
    { from: 3, to: 9, transports: ["taxi"] },
    { from: 4, to: 10, transports: ["taxi"] },
    { from: 5, to: 11, transports: ["taxi"] },
    { from: 6, to: 12, transports: ["taxi"] },

    { from: 7, to: 13, transports: ["taxi"] },
    { from: 8, to: 14, transports: ["taxi"] },
    { from: 9, to: 15, transports: ["taxi"] },
    { from: 10, to: 16, transports: ["taxi"] },
    { from: 11, to: 17, transports: ["taxi"] },
    { from: 12, to: 18, transports: ["taxi"] },

    { from: 13, to: 19, transports: ["taxi"] },
    { from: 14, to: 20, transports: ["taxi"] },
    { from: 15, to: 21, transports: ["taxi"] },
    { from: 16, to: 22, transports: ["taxi"] },
    { from: 17, to: 23, transports: ["taxi"] },
    { from: 18, to: 24, transports: ["taxi"] },

    // Les faubourgs (rangée 5) ne couvrent que les quatre colonnes centrales.
    { from: 20, to: 25, transports: ["taxi"] },
    { from: 21, to: 26, transports: ["taxi"] },
    { from: 22, to: 27, transports: ["taxi"] },
    { from: 23, to: 28, transports: ["taxi"] },

    // =====================
    // BUS — 13 arrêts : 1, 3, 5, 6, 8, 10, 13, 15, 17, 18, 20, 22, 24
    // =====================
    //
    // Chaque liaison saute par-dessus une station qui n'est pas un arrêt
    // de bus (2, 4, 7, 9, 12, 14, 16, 21, 23) : deux cases pour un ticket.
    // Bus seul : pas de taxi en doublon sur ces liaisons-là.

    // Rangée 1 : 1 → 3 (saute 2), 3 → 5 (saute 4)
    { from: 1, to: 3, transports: ["bus"] },
    { from: 3, to: 5, transports: ["bus"] },

    // Rangée 2 : 8 → 10 (saute 9)
    { from: 8, to: 10, transports: ["bus"] },

    // Le boulevard : 13 → 15 (saute 14), 15 → 17 (saute 16)
    { from: 13, to: 15, transports: ["bus"] },
    { from: 15, to: 17, transports: ["bus"] },

    // Rangée 4 : 20 → 22 (saute 21), 22 → 24 (saute 23)
    { from: 20, to: 22, transports: ["bus"] },
    { from: 22, to: 24, transports: ["bus"] },

    // Avenues nord-sud
    { from: 1, to: 13, transports: ["bus"] }, // saute 7
    { from: 3, to: 15, transports: ["bus"] }, // saute 9
    { from: 8, to: 20, transports: ["bus"] }, // saute 14
    { from: 10, to: 22, transports: ["bus"] }, // saute 16
    { from: 6, to: 18, transports: ["bus"] }, // saute 12

    // =====================
    // MÉTRO — 8 arrêts : 2, 4, 5, 14, 17, 22, 26, 28
    // =====================
    //
    // Même principe, avec les sauts les plus longs. Métro seul.
    //
    // Ligne 1 : 2 → 14 saute 8 ; 14 → 26 est une longue diagonale vers le sud
    // qui ne passe devant aucune station.
    { from: 2, to: 14, transports: ["metro"] },
    { from: 14, to: 26, transports: ["metro"] },

    // Ligne 2 (colonne 5) : 5 → 17 saute 11, 17 → 28 saute 23.
    { from: 5, to: 17, transports: ["metro"] },
    { from: 17, to: 28, transports: ["metro"] },

    // Ligne 3 (colonne 4) : 4 → 22 saute 10 et 16.
    { from: 4, to: 22, transports: ["metro"] },

    // Correspondance sur le boulevard : 14 → 17 saute 15 et 16.
    { from: 14, to: 17, transports: ["metro"] },
  ],

  // Grand Boulevard est la plus grande carte du jeu (28 stations) : la
  // plus longue à couvrir pour les détectives, donc la partie la plus
  // longue et les réserves de tickets les plus généreuses.
  balance: {
    ticketsByRole: {
      detective: {
        taxi: 8,
        bus: 5,
        metro: 4,
      },

      "mister-x": {
        taxi: 8,
        bus: 5,
        metro: 4,
        black: 4,
      },
    },

    startingPositions: {
      detectives: [1, 24],
      misterX: 15,
    },

    revealTurns: [3, 7, 11, 15, 19, 23],
    finalTurn: 23,
  },
};
