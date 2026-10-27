import { describe, expect, it } from "vitest";

import { getPossibleMoves, movePlayer } from "./movement";
import type { GameMap } from "../types/map";
import type { Player } from "../types/player";

// Mini-carte de test, volontairement indépendante des vraies cartes du jeu
// (qui, elles, changeront) : on teste ici le moteur, pas l'équilibrage.
//
//   1 --taxi-- 2 --taxi+bus-- 3
//   |                         |
//   +----------metro----------+
//
// et une station 4, reliée à 2 par un doublon de taxi (deux entrées).
const testMap: GameMap = {
  id: "test",
  name: "Test",
  description: "",
  stations: [
    { id: 1, name: "A", x: 10, y: 10 },
    { id: 2, name: "B", x: 50, y: 10 },
    { id: 3, name: "C", x: 90, y: 10 },
    { id: 4, name: "D", x: 50, y: 60 },
  ],
  connections: [
    { from: 1, to: 2, transports: ["taxi"] },
    { from: 2, to: 3, transports: ["taxi", "bus"] },
    { from: 1, to: 3, transports: ["metro"] },
    { from: 2, to: 4, transports: ["taxi"] },
    { from: 4, to: 2, transports: ["taxi"] },
  ],
  balance: {
    ticketsByRole: {
      detective: { taxi: 1, bus: 1, metro: 1 },
      "mister-x": { taxi: 1, bus: 1, metro: 1, black: 1 },
    },
    startingPositions: { detectives: [1, 1], misterX: 3 },
    revealTurns: [3],
    finalTurn: 5,
  },
};

function makePlayer(overrides: Partial<Player> = {}): Player {
  return {
    id: "p1",
    name: "Joueur",
    role: "detective",
    position: 1,
    tickets: { taxi: 2, bus: 2, metro: 2 },
    ...overrides,
  };
}

const byStation = (moves: ReturnType<typeof getPossibleMoves>) =>
  Object.fromEntries(moves.map((move) => [move.stationId, [...move.transports].sort()]));

describe("getPossibleMoves", () => {
  it("liste chaque destination reliée à la position actuelle", () => {
    const moves = getPossibleMoves(makePlayer({ position: 1 }), testMap);

    expect(byStation(moves)).toEqual({
      2: ["taxi"],
      3: ["metro"],
    });
  });

  it("fonctionne dans les deux sens d'une connexion (from et to)", () => {
    // La connexion 1-2 est déclarée de 1 vers 2 : depuis 2, on doit
    // pouvoir rejoindre 1.
    const moves = getPossibleMoves(makePlayer({ position: 2 }), testMap);

    expect(byStation(moves)[1]).toEqual(["taxi"]);
  });

  it("regroupe tous les transports d'une même liaison", () => {
    const moves = getPossibleMoves(makePlayer({ position: 3 }), testMap);

    expect(byStation(moves)[2]).toEqual(["bus", "taxi"]);
  });

  it("fusionne les doublons de connexion en une seule destination", () => {
    const moves = getPossibleMoves(makePlayer({ position: 4 }), testMap);

    expect(moves).toHaveLength(1);
    expect(moves[0].stationId).toBe(2);
    expect(moves[0].transports).toEqual(["taxi"]);
  });

  it("ne propose pas un transport dont le joueur n'a plus de ticket", () => {
    const player = makePlayer({
      position: 2,
      tickets: { taxi: 0, bus: 1, metro: 1 },
    });

    const moves = byStation(getPossibleMoves(player, testMap));

    // 2 -> 3 reste possible en bus uniquement ; 2 -> 1 et 2 -> 4 (taxi seul)
    // disparaissent.
    expect(moves).toEqual({ 3: ["bus"] });
  });

  it("ne propose aucune destination sans aucun ticket", () => {
    const player = makePlayer({
      position: 2,
      tickets: { taxi: 0, bus: 0, metro: 0 },
    });

    expect(getPossibleMoves(player, testMap)).toEqual([]);
  });

  it("un ticket noir permet d'emprunter n'importe quel transport", () => {
    const player = makePlayer({
      role: "mister-x",
      position: 1,
      tickets: { taxi: 0, bus: 0, metro: 0, black: 1 },
    });

    expect(byStation(getPossibleMoves(player, testMap))).toEqual({
      2: ["taxi"],
      3: ["metro"],
    });
  });

  it("ne renvoie rien pour une station qui n'existe sur aucune connexion", () => {
    expect(getPossibleMoves(makePlayer({ position: 99 }), testMap)).toEqual([]);
  });

  it("traite chaque connexion comme un seul saut, quelle que soit la distance dessinée", () => {
    // Règle centrale du jeu : 1 -> 3 est un unique ticket de métro,
    // même si 2 se trouve entre les deux sur le plateau.
    const moves = byStation(getPossibleMoves(makePlayer({ position: 1 }), testMap));

    expect(moves[3]).toEqual(["metro"]);
    // ... et 3 n'est atteignable ni en taxi ni en bus depuis 1.
    expect(moves[3]).not.toContain("taxi");
    expect(moves[3]).not.toContain("bus");
  });
});

describe("movePlayer", () => {
  it("déplace le joueur et consomme un ticket du transport utilisé", () => {
    const player = makePlayer({ position: 1, tickets: { taxi: 2, bus: 2, metro: 2 } });

    const moved = movePlayer(player, 2, "taxi");

    expect(moved.position).toBe(2);
    expect(moved.tickets).toEqual({ taxi: 1, bus: 2, metro: 2 });
  });

  it("consomme un ticket noir quand le joueur paie avec", () => {
    const player = makePlayer({
      role: "mister-x",
      tickets: { taxi: 2, bus: 2, metro: 2, black: 2 },
    });

    const moved = movePlayer(player, 2, "black");

    expect(moved.position).toBe(2);
    expect(moved.tickets.black).toBe(1);
    expect(moved.tickets.taxi).toBe(2);
  });

  it("ne modifie pas le joueur d'origine (immutabilité)", () => {
    const player = makePlayer();
    const snapshot = JSON.parse(JSON.stringify(player));

    movePlayer(player, 2, "taxi");

    expect(player).toEqual(snapshot);
  });

  it("refuse le déplacement s'il ne reste plus de ticket", () => {
    const player = makePlayer({ tickets: { taxi: 0, bus: 2, metro: 2 } });

    expect(movePlayer(player, 2, "taxi")).toBe(player);
  });

  it("refuse un ticket noir quand le joueur n'en possède pas", () => {
    const player = makePlayer({ tickets: { taxi: 2, bus: 2, metro: 2 } });

    expect(movePlayer(player, 2, "black")).toBe(player);
  });

  it("peut dépenser son dernier ticket mais pas descendre sous zéro", () => {
    const player = makePlayer({ tickets: { taxi: 1, bus: 0, metro: 0 } });

    const once = movePlayer(player, 2, "taxi");
    expect(once.tickets.taxi).toBe(0);

    const twice = movePlayer(once, 3, "taxi");
    expect(twice).toBe(once);
    expect(twice.tickets.taxi).toBe(0);
  });
});
