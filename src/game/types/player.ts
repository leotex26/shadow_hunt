import type { TransportTickets } from "./transport";

export type PlayerRole =
  | "detective"
  | "mister-x";

export interface Player {
  id: string;
  name: string;
  role: PlayerRole;

  position: number;

  tickets: TransportTickets;
}