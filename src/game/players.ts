import type { GameMap } from "./types/map";
import type { Player } from "./types/player";

// Construit les joueurs de départ à partir de l'équilibrage propre à
// la carte choisie (tickets, positions de départ) plutôt que des
// valeurs fixes, qui n'auraient aucun sens d'une carte à l'autre.
export function createInitialPlayers(map: GameMap): Player[] {
  const { ticketsByRole, startingPositions } = map.balance;

  return [
    {
      id: "detective-1",
      name: "Détective 1",
      role: "detective",

      position: startingPositions.detectives[0],

      tickets: { ...ticketsByRole.detective },
    },

    {
      id: "detective-2",
      name: "Détective 2",
      role: "detective",

      position: startingPositions.detectives[1] ?? startingPositions.detectives[0],

      tickets: { ...ticketsByRole.detective },
    },

    {
      id: "mister-x",
      name: "Mister X",
      role: "mister-x",

      position: startingPositions.misterX,

      tickets: { ...ticketsByRole["mister-x"] },
    },
  ];
}
