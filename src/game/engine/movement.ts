import type { GameMap, Connection } from "../types/map";
import type { Player } from "../types/player";
import type { TransportType } from "../types/transport";

export interface PossibleMove {
  stationId: number;
  transport: TransportType;
}

export function getPossibleMoves(
  player: Player,
  map: GameMap
): PossibleMove[] {
  const possibleMoves: PossibleMove[] = [];

  // On cherche toutes les connexions reliées
  // à la position actuelle du joueur.
  const connections = map.connections.filter(
    (connection: Connection) =>
      connection.from === player.position ||
      connection.to === player.position
  );

  for (const connection of connections) {
    // Vérifie que le joueur possède encore un ticket
    // pour ce type de transport.
    if (player.tickets[connection.transport] <= 0) {
      continue;
    }

    // Si le joueur est du côté "from",
    // la destination est "to".
    // Sinon, la destination est "from".
    const destination =
      connection.from === player.position
        ? connection.to
        : connection.from;

    possibleMoves.push({
      stationId: destination,
      transport: connection.transport,
    });
  }

  return possibleMoves;
}


export function movePlayer(
  player: Player,
  stationId: number,
  transport: TransportType
): Player {
  return {
    ...player,

    position: stationId,

    tickets: {
      ...player.tickets,

      [transport]:
        player.tickets[transport] - 1,
    },
  };
}