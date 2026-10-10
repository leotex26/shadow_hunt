import type { GameMap } from "../types/map";

// Grand Boulevard remplace Bellevue comme carte la plus grande du jeu :
// 28 stations (contre 20 pour Vieux-Port), organisées en cinq avenues
// est-ouest reliées par des rues perpendiculaires. La rangée du milieu
// (13 à 18) EST le grand boulevard du nom de la carte — c'est la seule
// rangée entièrement doublée taxi+bus, comme une vraie artère.
export const grandBoulevard: GameMap = {
  id: "grand-boulevard",
  name: "Grand Boulevard",
  description: "Un vaste quartier d'affaires, pour les parties les plus longues et les plus stratégiques.",

  stations: [
    // Rangée 1 — Porte Nord (haut)
    { id: 1, name: "Porte Nord", x: 8, y: 8 },
    { id: 2, name: "Grand Hôtel", x: 24, y: 8 },
    { id: 3, name: "Opéra", x: 40, y: 8 },
    { id: 4, name: "Bourse", x: 56, y: 8 },
    { id: 5, name: "Tour d'Affaires", x: 72, y: 8 },
    { id: 6, name: "Gare Centrale", x: 88, y: 8 },

    // Rangée 2
    { id: 7, name: "Jardin Public", x: 8, y: 28 },
    { id: 8, name: "Galerie Marchande", x: 24, y: 28 },
    { id: 9, name: "Préfecture", x: 40, y: 28 },
    { id: 10, name: "Grand Magasin", x: 56, y: 28 },
    { id: 11, name: "Ambassade", x: 72, y: 28 },
    { id: 12, name: "Hippodrome", x: 88, y: 28 },

    // Rangée 3 — le Grand Boulevard lui-même
    { id: 13, name: "Université", x: 8, y: 50 },
    { id: 14, name: "Place de la République", x: 24, y: 50 },
    { id: 15, name: "Palais de Justice", x: 40, y: 50 },
    { id: 16, name: "Conservatoire", x: 56, y: 50 },
    { id: 17, name: "Stade", x: 72, y: 50 },
    { id: 18, name: "Caserne Sud", x: 88, y: 50 },

    // Rangée 4
    { id: 19, name: "Marché Couvert", x: 8, y: 70 },
    { id: 20, name: "Quartier Latin", x: 24, y: 70 },
    { id: 21, name: "Boulevard Sud", x: 40, y: 70 },
    { id: 22, name: "Zone Industrielle", x: 56, y: 70 },
    { id: 23, name: "Port Fluvial", x: 72, y: 70 },
    { id: 24, name: "Terminus Est", x: 88, y: 70 },

    // Rangée 5 — faubourgs (bas, plus étroit)
    { id: 25, name: "Faubourg Ouest", x: 24, y: 90 },
    { id: 26, name: "Rond-Point", x: 40, y: 90 },
    { id: 27, name: "Faubourg Est", x: 56, y: 90 },
    { id: 28, name: "Terminus Sud", x: 72, y: 90 },
  ],

  connections: [
    // =====================
    // RUES (taxi seul) — rangées 1, 2, 4 et 5
    // =====================
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

    { from: 19, to: 20, transports: ["taxi"] },
    { from: 20, to: 21, transports: ["taxi"] },
    { from: 21, to: 22, transports: ["taxi"] },
    { from: 22, to: 23, transports: ["taxi"] },
    { from: 23, to: 24, transports: ["taxi"] },

    { from: 25, to: 26, transports: ["taxi"] },
    { from: 26, to: 27, transports: ["taxi"] },
    { from: 27, to: 28, transports: ["taxi"] },

    // =====================
    // LE GRAND BOULEVARD (taxi + bus) — rangée 3, dans toute sa longueur
    // =====================
    { from: 13, to: 14, transports: ["taxi", "bus"] },
    { from: 14, to: 15, transports: ["taxi", "bus"] },
    { from: 15, to: 16, transports: ["taxi", "bus"] },
    { from: 16, to: 17, transports: ["taxi", "bus"] },
    { from: 17, to: 18, transports: ["taxi", "bus"] },

    // =====================
    // AVENUES NORD-SUD (taxi + bus) — une par colonne, sur toute la
    // hauteur de la carte sauf vers les faubourgs (rangée 5, voir
    // ci-dessous)
    // =====================
    { from: 1, to: 7, transports: ["taxi", "bus"] },
    { from: 2, to: 8, transports: ["taxi", "bus"] },
    { from: 3, to: 9, transports: ["taxi", "bus"] },
    { from: 4, to: 10, transports: ["taxi", "bus"] },
    { from: 5, to: 11, transports: ["taxi", "bus"] },
    { from: 6, to: 12, transports: ["taxi", "bus"] },

    { from: 7, to: 13, transports: ["taxi", "bus"] },
    { from: 8, to: 14, transports: ["taxi", "bus"] },
    { from: 9, to: 15, transports: ["taxi", "bus"] },
    { from: 10, to: 16, transports: ["taxi", "bus"] },
    { from: 11, to: 17, transports: ["taxi", "bus"] },
    { from: 12, to: 18, transports: ["taxi", "bus"] },

    { from: 13, to: 19, transports: ["taxi", "bus"] },
    { from: 14, to: 20, transports: ["taxi", "bus"] },
    { from: 15, to: 21, transports: ["taxi", "bus"] },
    { from: 16, to: 22, transports: ["taxi", "bus"] },
    { from: 17, to: 23, transports: ["taxi", "bus"] },
    { from: 18, to: 24, transports: ["taxi", "bus"] },

    // Les faubourgs (rangée 5) ne couvrent que les quatre colonnes
    // centrales — liaison taxi simple, pas de ligne de bus jusque-là.
    { from: 20, to: 25, transports: ["taxi"] },
    { from: 21, to: 26, transports: ["taxi"] },
    { from: 22, to: 27, transports: ["taxi"] },
    { from: 23, to: 28, transports: ["taxi"] },

    // =====================
    // MÉTRO SEUL — lignes longue distance
    // =====================
    //
    // Même principe que pour Vieux-Port : chaque liaison saute par-dessus
    // une station qui n'est pas elle-même un arrêt de métro, et ne peut
    // se faire qu'en métro (pas de taxi ni de bus en secours).
    //
    // Ligne 1 (colonne 2) : 2 → 14 saute 8, 14 → 26 saute 20.
    { from: 2, to: 14, transports: ["metro"] },
    { from: 14, to: 26, transports: ["metro"] },

    // Ligne 2 (colonne 5) : 5 → 17 saute 11, 17 → 28 saute 23.
    { from: 5, to: 17, transports: ["metro"] },
    { from: 17, to: 28, transports: ["metro"] },

    // Ligne 3 (colonne 4, plus courte) : 4 → 16 saute 10.
    { from: 4, to: 16, transports: ["metro"] },

    // Correspondance : la ligne 1 et la ligne 2 se croisent sur le
    // boulevard lui-même, d'un bout à l'autre, en sautant par-dessus
    // Palais de Justice et Conservatoire (15 et 16 — pas des arrêts de
    // métro sur cette ligne-ci).
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
