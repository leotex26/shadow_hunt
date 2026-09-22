import type {
  GameMap,
  Connection,
  TransportType,
} from "../types/map";

import type { Player } from "../types/player";

export interface PossibleMove {
  stationId: number;

  // Tous les transports possibles
  // pour atteindre cette station.
  transports: TransportType[];
}

export function getPossibleMoves(
  player: Player,
  map: GameMap
): PossibleMove[] {
  // On regroupe par destination plutôt que par connexion : si deux
  // connexions mènent à la même station (ex. doublon dans les données
  // de la carte), elles fusionnent en une seule entrée au lieu de
  // proposer deux fois le même transport.
  const transportsByDestination = new Map<number, Set<TransportType>>();

  // On cherche toutes les connexions
  // reliées à la position actuelle.
  const connections = map.connections.filter(
    (connection: Connection) =>
      connection.from === player.position ||
      connection.to === player.position
  );

  for (const connection of connections) {
    // Destination selon le sens
    // dans lequel le joueur arrive.
    const destination =
      connection.from === player.position
        ? connection.to
        : connection.from;

    // Un trajet reste possible dès que le joueur peut le payer soit avec
    // le ticket du transport concerné, soit avec un ticket noir (qui
    // remplace n'importe quel transport — seul Mister X en possède).
    const availableTransports =
      connection.transports.filter(
        (transport) => player.tickets[transport] > 0 || (player.tickets.black ?? 0) > 0
      );

    // Aucun transport utilisable.
    if (availableTransports.length === 0) {
      continue;
    }

    const transports = transportsByDestination.get(destination) ?? new Set<TransportType>();
    availableTransports.forEach((transport) => transports.add(transport));
    transportsByDestination.set(destination, transports);
  }

  return Array.from(transportsByDestination.entries()).map(
    ([stationId, transports]) => ({
      stationId,
      transports: Array.from(transports),
    }),
  );
}

// Un déplacement se paie soit avec le ticket du transport emprunté, soit
// avec un ticket noir (qui masque aux détectives lequel a été utilisé).
export type TicketPayment = TransportType | "black";

export function movePlayer(
  player: Player,
  stationId: number,
  payment: TicketPayment
): Player {
  const remainingTickets = player.tickets[payment] ?? 0;

  // Sécurité :
  // impossible de déplacer le joueur
  // s'il n'a plus de ticket.
  if (remainingTickets <= 0) {
    return player;
  }

  return {
    ...player,

    position: stationId,

    tickets: {
      ...player.tickets,

      [payment]: remainingTickets - 1,
    },
  };
}