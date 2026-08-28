export type TransportType =
  | "taxi"
  | "bus"
  | "metro";

export interface TransportTickets {
  taxi: number;
  bus: number;
  metro: number;

  black?: number;
}