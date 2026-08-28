import type { TransportType } from "./transport";

export interface Station {
  id: number;
  name: string;
  x: number;
  y: number;
}

export interface Connection {
  from: number;
  to: number;
  transport: TransportType;
}

export interface GameMap {
  id: string;
  name: string;
  stations: Station[];
  connections: Connection[];
}