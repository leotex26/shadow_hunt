import type { GameMap, TransportType } from "../types/map";

// Stations directement reliées à `stationId` par une connexion — dans les
// deux sens, comme le moteur de déplacement. Si `transport` est fourni,
// seules comptent les connexions qui proposent ce transport (utile pour
// raisonner à partir d'un ticket connu, ex. l'historique de Mister X).
export function getNeighbors(
  map: GameMap,
  stationId: number,
  transport?: TransportType,
): number[] {
  const neighbors: number[] = [];

  for (const connection of map.connections) {
    if (transport && !connection.transports.includes(transport)) {
      continue;
    }

    if (connection.from === stationId) {
      neighbors.push(connection.to);
    } else if (connection.to === stationId) {
      neighbors.push(connection.from);
    }
  }

  return neighbors;
}

// Distance (en nombre de trajets) entre une station et toutes les
// autres, calculée uniquement sur la topologie de la carte — sans tenir
// compte des tickets disponibles. Sert d'heuristique de "proximité" à
// l'IA, pas de calcul de trajet réellement jouable.
export function getStationDistances(map: GameMap, fromStationId: number): Map<number, number> {
  const distances = new Map<number, number>([[fromStationId, 0]]);
  const queue: number[] = [fromStationId];

  while (queue.length > 0) {
    const current = queue.shift()!;
    const currentDistance = distances.get(current)!;

    for (const neighbor of getNeighbors(map, current)) {
      if (!distances.has(neighbor)) {
        distances.set(neighbor, currentDistance + 1);
        queue.push(neighbor);
      }
    }
  }

  return distances;
}
