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

export interface GameMap {
  id: string;
  name: string;

  stations: Station[];
  connections: Connection[];
}