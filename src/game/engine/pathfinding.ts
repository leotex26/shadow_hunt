import type { GameMap } from "../types/map";

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

    const neighbors = map.connections
      .filter((connection) => connection.from === current || connection.to === current)
      .map((connection) => (connection.from === current ? connection.to : connection.from));

    for (const neighbor of neighbors) {
      if (!distances.has(neighbor)) {
        distances.set(neighbor, currentDistance + 1);
        queue.push(neighbor);
      }
    }
  }

  return distances;
}
