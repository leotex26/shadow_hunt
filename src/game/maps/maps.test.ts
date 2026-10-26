import { describe, expect, it } from "vitest";

import { maps } from "./index";
import type { GameMap, Station, TransportType } from "../types/map";

// Distance (en % du plateau) en dessous de laquelle une ligne est considérée
// comme "passant devant" une station. Elle doit rester sensiblement plus
// petite que l'écart minimum entre deux stations.
const PASS_BY_DISTANCE = 5;

// Écart minimum entre deux stations : en dessous, les pastilles et leurs
// noms se chevauchent à l'écran.
const MIN_STATION_SPACING = 9;

const TRANSPORTS: TransportType[] = ["taxi", "bus", "metro"];

function stopsByTransport(map: GameMap): Record<TransportType, Set<number>> {
  const stops: Record<TransportType, Set<number>> = {
    taxi: new Set(),
    bus: new Set(),
    metro: new Set(),
  };

  for (const connection of map.connections) {
    for (const transport of connection.transports) {
      stops[transport].add(connection.from);
      stops[transport].add(connection.to);
    }
  }

  return stops;
}

// Distance entre un point et un segment, ou null si le point se projette
// en dehors du segment (donc ne peut pas être "passé devant").
function distanceToSegment(a: Station, b: Station, point: Station): number | null {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const t = ((point.x - a.x) * dx + (point.y - a.y) * dy) / (dx * dx + dy * dy);

  if (t <= 0 || t >= 1) {
    return null;
  }

  return Math.hypot(a.x + t * dx - point.x, a.y + t * dy - point.y);
}

function reachableFrom(map: GameMap, start: number): Set<number> {
  const neighbours = new Map<number, number[]>();

  for (const { from, to } of map.connections) {
    neighbours.set(from, [...(neighbours.get(from) ?? []), to]);
    neighbours.set(to, [...(neighbours.get(to) ?? []), from]);
  }

  const seen = new Set<number>([start]);
  const queue = [start];

  while (queue.length > 0) {
    const current = queue.pop()!;

    for (const next of neighbours.get(current) ?? []) {
      if (!seen.has(next)) {
        seen.add(next);
        queue.push(next);
      }
    }
  }

  return seen;
}

describe("registre des cartes", () => {
  it("indexe chaque carte sous son propre id", () => {
    for (const [key, map] of Object.entries(maps)) {
      expect(map.id).toBe(key);
    }
  });

  it("contient au moins une carte", () => {
    expect(Object.keys(maps).length).toBeGreaterThan(0);
  });
});

describe.each(Object.values(maps))("carte $name", (map) => {
  const stationIds = new Set(map.stations.map((station) => station.id));
  const stops = stopsByTransport(map);

  describe("stations", () => {
    it("ont des identifiants uniques", () => {
      expect(stationIds.size).toBe(map.stations.length);
    });

    it("ont toutes un nom non vide", () => {
      for (const station of map.stations) {
        expect(station.name.trim()).not.toBe("");
      }
    });

    it("sont toutes placées dans le plateau (0-100 %)", () => {
      for (const station of map.stations) {
        expect(station.x).toBeGreaterThanOrEqual(0);
        expect(station.x).toBeLessThanOrEqual(100);
        expect(station.y).toBeGreaterThanOrEqual(0);
        expect(station.y).toBeLessThanOrEqual(100);
      }
    });

    it("ne se chevauchent pas à l'écran", () => {
      for (const a of map.stations) {
        for (const b of map.stations) {
          if (a.id < b.id) {
            expect(
              Math.hypot(a.x - b.x, a.y - b.y),
              `stations ${a.id} et ${b.id} trop proches`,
            ).toBeGreaterThanOrEqual(MIN_STATION_SPACING);
          }
        }
      }
    });
  });

  describe("connexions", () => {
    it("relient uniquement des stations existantes", () => {
      for (const { from, to } of map.connections) {
        expect(stationIds.has(from), `station ${from} inconnue`).toBe(true);
        expect(stationIds.has(to), `station ${to} inconnue`).toBe(true);
      }
    });

    it("ne relient jamais une station à elle-même", () => {
      for (const { from, to } of map.connections) {
        expect(from).not.toBe(to);
      }
    });

    it("proposent au moins un transport, sans répétition", () => {
      for (const { from, to, transports } of map.connections) {
        expect(transports.length, `liaison ${from}-${to}`).toBeGreaterThan(0);
        expect(new Set(transports).size, `liaison ${from}-${to}`).toBe(transports.length);

        for (const transport of transports) {
          expect(TRANSPORTS).toContain(transport);
        }
      }
    });

    it("n'ont pas de doublon (une même paire apparaît une seule fois)", () => {
      const pairs = map.connections.map(({ from, to }) =>
        [Math.min(from, to), Math.max(from, to)].join("-"),
      );
      const duplicates = pairs.filter((pair, index) => pairs.indexOf(pair) !== index);

      expect(duplicates).toEqual([]);
    });

    it("forment un réseau connexe : toute station est atteignable depuis toute autre", () => {
      const reachable = reachableFrom(map, map.stations[0].id);

      expect([...stationIds].filter((id) => !reachable.has(id))).toEqual([]);
    });
  });

  describe("transports", () => {
    it("desservent toutes les stations en taxi (personne n'est bloqué)", () => {
      expect([...stationIds].filter((id) => !stops.taxi.has(id))).toEqual([]);
    });

    it("rendent le bus plus rare que le taxi", () => {
      expect(stops.bus.size).toBeGreaterThan(0);
      expect(stops.bus.size).toBeLessThan(stops.taxi.size);
    });

    it("rendent le métro plus rare que le taxi", () => {
      expect(stops.metro.size).toBeGreaterThan(0);
      expect(stops.metro.size).toBeLessThan(stops.taxi.size);
    });

    it("offrent au bus et au métro au moins une liaison qui ne double aucun taxi", () => {
      // Un bus ou un métro qui n'existe que "en doublon" d'un taxi
      // n'apporterait aucun avantage tactique.
      for (const transport of ["bus", "metro"] as const) {
        const exclusive = map.connections.filter(
          (connection) =>
            connection.transports.includes(transport) &&
            !connection.transports.includes("taxi"),
        );

        expect(exclusive.length, `liaisons ${transport} sans taxi`).toBeGreaterThan(0);
      }
    });

    it("ne font jamais passer une ligne sur un arrêt du même transport", () => {
      // Règle des "arrêts" : une ligne peut passer devant une station qui
      // n'est PAS un arrêt de ce transport, mais jamais devant un vrai
      // arrêt sans que le joueur puisse y descendre.
      const byId = new Map(map.stations.map((station) => [station.id, station]));
      const problems: string[] = [];

      for (const { from, to, transports } of map.connections) {
        const a = byId.get(from)!;
        const b = byId.get(to)!;

        for (const transport of transports) {
          for (const station of map.stations) {
            if (station.id === from || station.id === to) {
              continue;
            }

            const distance = distanceToSegment(a, b, station);

            if (
              distance !== null &&
              distance < PASS_BY_DISTANCE &&
              stops[transport].has(station.id)
            ) {
              problems.push(
                `${transport} ${from}→${to} passe sur l'arrêt ${station.id} (à ${distance.toFixed(1)} %)`,
              );
            }
          }
        }
      }

      expect(problems).toEqual([]);
    });
  });

  describe("équilibrage", () => {
    const { ticketsByRole, startingPositions, revealTurns, finalTurn } = map.balance;

    it("démarre sur des stations existantes", () => {
      for (const position of [...startingPositions.detectives, startingPositions.misterX]) {
        expect(stationIds.has(position), `départ ${position} inconnu`).toBe(true);
      }
    });

    it("ne fait pas démarrer Mister X sur un détective", () => {
      expect(startingPositions.detectives).not.toContain(startingPositions.misterX);
    });

    it("permet à chaque joueur d'atteindre toutes les stations depuis son départ", () => {
      for (const position of [...startingPositions.detectives, startingPositions.misterX]) {
        expect(reachableFrom(map, position).size).toBe(stationIds.size);
      }
    });

    it("donne à chacun des tickets entiers et positifs", () => {
      for (const role of ["detective", "mister-x"] as const) {
        for (const transport of TRANSPORTS) {
          const count = ticketsByRole[role][transport];

          expect(Number.isInteger(count)).toBe(true);
          expect(count, `${role} / ${transport}`).toBeGreaterThan(0);
        }
      }
    });

    it("réserve les tickets noirs à Mister X", () => {
      expect(ticketsByRole.detective.black ?? 0).toBe(0);
      expect(ticketsByRole["mister-x"].black ?? 0).toBeGreaterThan(0);
    });

    it("révèle Mister X à des tours croissants, avant la fin de la partie", () => {
      expect(revealTurns.length).toBeGreaterThan(0);
      expect([...revealTurns].sort((a, b) => a - b)).toEqual(revealTurns);

      for (const turn of revealTurns) {
        expect(turn).toBeGreaterThan(0);
        expect(turn).toBeLessThanOrEqual(finalTurn);
      }
    });
  });
});
