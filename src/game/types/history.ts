import type { TransportType } from "./map";

// Une ligne de l'historique visible par les détectives : le tour, et le
// transport utilisé — sauf si `concealed` est vrai (ticket noir payé),
// auquel cas le transport réel reste inconnu ("❓" côté affichage).
export interface MisterXMoveRecord {
  turn: number;
  transport: TransportType;
  concealed: boolean;
}
