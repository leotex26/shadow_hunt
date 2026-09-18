import type { TransportTickets } from "./transport";

export type TransportType = "taxi" | "bus" | "metro";

export interface Station {
  id: number;
  name: string;

  // Position sur la carte en pourcentage
  x: number;
  y: number;
}

export interface Connection {
  from: number;
  to: number;

  // Plusieurs transports peuvent être disponibles
  // pour le même trajet.
  transports: TransportType[];
}

// Équilibrage propre à chaque carte : sur une petite carte, Mister X n'a
// besoin ni d'autant de tickets ni d'autant de tours pour espérer s'en
// sortir que sur une grande. Ces chiffres vivent avec la carte plutôt
// que d'être fixés une fois pour toutes dans le moteur de jeu.
export interface MapBalance {
  ticketsByRole: {
    detective: TransportTickets;
    "mister-x": TransportTickets;
  };

  startingPositions: {
    detectives: number[];
    misterX: number;
  };

  // Tours auxquels Mister X est démasqué.
  revealTurns: number[];

  // Dernier tour de la partie : Mister X gagne s'il n'est pas
  // capturé avant la fin de ce tour.
  finalTurn: number;
}

export interface GameMap {
  id: string;
  name: string;

  stations: Station[];
  connections: Connection[];

  balance: MapBalance;
}