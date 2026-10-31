import { describe, expect, it } from "vitest";

import { chooseAiMove, estimateMisterXPositions } from "./ai";
import { getNeighbors } from "./pathfinding";
import type { GameMap } from "../types/map";
import type { Player } from "../types/player";

// Couloir de 7 stations en ligne, avec un raccourci métro 2 → 6 :
//
//   1 - 2 - 3 - 4 - 5 - 6 - 7        (taxi partout)
//        \_____________/             (métro 2-6)
//
// et une branche 4 → 8 en bus.
const corridor: GameMap = {
  id: "corridor",
  name: "Couloir",
  description: "",
  stations: [1, 2, 3, 4, 5, 6, 7, 8].map((id) => ({ id, name: `S${id}`, x: id * 10, y: 50 })),
  connections: [
    { from: 1, to: 2, transports: ["taxi"] },
    { from: 2, to: 3, transports: ["taxi"] },
    { from: 3, to: 4, transports: ["taxi"] },
    { from: 4, to: 5, transports: ["taxi"] },
    { from: 5, to: 6, transports: ["taxi"] },
    { from: 6, to: 7, transports: ["taxi"] },
    { from: 2, to: 6, transports: ["metro"] },
    { from: 4, to: 8, transports: ["bus"] },
  ],
  balance: {
    ticketsByRole: {
      detective: { taxi: 5, bus: 5, metro: 5 },
      "mister-x": { taxi: 5, bus: 5, metro: 5, black: 2 },
    },
    startingPositions: { detectives: [1, 7], misterX: 4 },
    revealTurns: [3],
    finalTurn: 10,
  },
};

const fullTickets = { taxi: 5, bus: 5, metro: 5 };

function detective(id: string, position: number, tickets = fullTickets): Player {
  return { id, name: id, role: "detective", position, tickets };
}

function misterX(position: number, tickets = { ...fullTickets, black: 2 }): Player {
  return { id: "mister-x", name: "Mister X", role: "mister-x", position, tickets };
}

// Aléa figé : choisit toujours la première option du pool.
const first = () => 0;

describe("getNeighbors", () => {
  it("renvoie les voisins dans les deux sens", () => {
    expect(getNeighbors(corridor, 3).sort()).toEqual([2, 4]);
  });

  it("peut filtrer sur un transport", () => {
    expect(getNeighbors(corridor, 2, "metro")).toEqual([6]);
    expect(getNeighbors(corridor, 2, "bus")).toEqual([]);
  });
});

describe("estimateMisterXPositions", () => {
  const history = (...records: [number, "taxi" | "bus" | "metro", boolean?][]) =>
    records.map(([turn, transport, concealed]) => ({ turn, transport, concealed: concealed ?? false }));

  it("sans aucune révélation, tout est possible sauf sous un détective", () => {
    const result = estimateMisterXPositions(corridor, [1, 7], null);

    expect([...result].sort((a, b) => a - b)).toEqual([2, 3, 4, 5, 6, 8]);
  });

  it("juste après une révélation, seule la position connue est possible", () => {
    expect([...estimateMisterXPositions(corridor, [1, 7], 4)]).toEqual([4]);
  });

  it("suit les transports annoncés depuis la révélation", () => {
    // Révélé en 4, puis un tour de bus : seule la station 8 est possible.
    const result = estimateMisterXPositions(corridor, [1, 7], 4, history([4, "bus"]), 3);

    expect([...result]).toEqual([8]);
  });

  it("ignore les coups joués avant ou pendant le tour de révélation", () => {
    const result = estimateMisterXPositions(corridor, [1, 7], 4, history([2, "metro"], [3, "taxi"]), 3);

    expect([...result]).toEqual([4]);
  });

  it("élargit les possibilités quand le ticket était noir", () => {
    const result = estimateMisterXPositions(corridor, [1, 7], 4, history([4, "taxi", true]), 3);

    // Depuis 4, toute liaison convient : 3, 5 ou 8.
    expect([...result].sort((a, b) => a - b)).toEqual([3, 5, 8]);
  });

  it("enchaîne plusieurs coups", () => {
    const result = estimateMisterXPositions(
      corridor,
      [1, 7],
      4,
      history([4, "taxi"], [5, "taxi"]),
      3,
    );

    // 4 -> {3,5} -> {2,4,6} (taxi), sans les cases occupées par un détective.
    expect([...result].sort((a, b) => a - b)).toEqual([2, 4, 6]);
  });

  it("retire les cases occupées par un détective", () => {
    const result = estimateMisterXPositions(corridor, [3, 5], 4, history([4, "taxi"]), 3);

    // 3 et 5 seraient les destinations, mais un détective y est déjà.
    expect(result.has(3)).toBe(false);
    expect(result.has(5)).toBe(false);
  });

  it("ne renvoie jamais un ensemble vide (garde-fou)", () => {
    // Transport impossible depuis la position connue : estimation large.
    const result = estimateMisterXPositions(corridor, [1, 7], 4, history([4, "metro"]), 3);

    expect(result.size).toBeGreaterThan(0);
  });
});

describe("chooseAiMove — Mister X", () => {
  it("renvoie null sans aucun ticket utilisable", () => {
    const player = misterX(4, { taxi: 0, bus: 0, metro: 0, black: 0 });

    expect(chooseAiMove(player, corridor, [detective("d1", 1), player], null)).toBeNull();
  });

  it("s'éloigne du détective le plus proche", () => {
    const player = misterX(4);
    const players = [detective("d1", 3), detective("d2", 1), player];

    const choice = chooseAiMove(player, corridor, players, null, { random: first })!;

    // Détective en 3 : aller en 3 est interdit, aller en 5 ou 8 l'éloigne.
    expect([5, 8]).toContain(choice.stationId);
  });

  it("n'atterrit jamais sur un détective ni à côté quand une autre issue existe", () => {
    const player = misterX(4);
    const players = [detective("d1", 3), detective("d2", 5), player];

    for (let i = 0; i < 20; i++) {
      const choice = chooseAiMove(player, corridor, players, null)!;

      // 3 et 5 sont occupés ; la seule issue sûre est la branche bus vers 8.
      expect(choice.stationId).toBe(8);
    }
  });

  it("utilise le raccourci métro pour fuir quand c'est le plus loin", () => {
    const player = misterX(2);
    const players = [detective("d1", 1), detective("d2", 3), player];

    const choice = chooseAiMove(player, corridor, players, null, { random: first })!;

    expect(choice.stationId).toBe(6);
    expect(choice.transport).toBe("metro");
  });

  it("paie en ticket noir quand il n'a plus le ticket normal", () => {
    const player = misterX(2, { taxi: 0, bus: 0, metro: 0, black: 1 });
    const players = [detective("d1", 1), detective("d2", 7), player];

    const choice = chooseAiMove(player, corridor, players, null)!;

    expect(choice.payment).toBe("black");
  });

  it("ne paie jamais en noir sans ticket noir", () => {
    const player = misterX(2, { ...fullTickets, black: 0 });
    const players = [detective("d1", 1), detective("d2", 7), player];

    for (let i = 0; i < 20; i++) {
      expect(chooseAiMove(player, corridor, players, null)!.payment).not.toBe("black");
    }
  });

  it("n'utilise le noir que pour un transport qu'il peut vraiment emprunter", () => {
    const player = misterX(4);
    const players = [detective("d1", 3), detective("d2", 1), player];

    for (let i = 0; i < 50; i++) {
      const choice = chooseAiMove(player, corridor, players, null)!;

      if (choice.payment === "black") {
        expect(["taxi", "bus", "metro"]).toContain(choice.transport);
      }
    }
  });
});

describe("chooseAiMove — détectives", () => {
  it("se rapproche d'une position connue de Mister X", () => {
    const d1 = detective("d1", 1);
    const d2 = detective("d2", 7);
    const x = misterX(4);

    const choice = chooseAiMove(d1, corridor, [d1, d2, x], 4, { random: first })!;

    // Depuis 1, la seule direction utile est 2.
    expect(choice.stationId).toBe(2);
    expect(choice.payment).toBe(choice.transport);
  });

  it("se répartit au lieu de foncer à deux sur la même case", () => {
    // Mister X vu en 4 puis ticket noir : possible en 3, 5 ou 8.
    const history = [{ turn: 4, transport: "taxi" as const, concealed: true }];
    const context = { misterXMoveHistory: history, misterXLastRevealTurn: 3, random: first };

    const d1 = detective("d1", 2);
    const d2 = detective("d2", 6);
    const x = misterX(4);

    const choice1 = chooseAiMove(d1, corridor, [d1, d2, x], 4, context)!;
    const choice2 = chooseAiMove(d2, corridor, [d1, d2, x], 4, context)!;

    expect(choice1.stationId).toBe(3);
    expect(choice2.stationId).toBe(5);
  });

  it("préfère la case la plus proche de l'ensemble des positions possibles", () => {
    // Mister X révélé en 4 puis bus : forcément en 8.
    const context = {
      misterXMoveHistory: [{ turn: 4, transport: "bus" as const, concealed: false }],
      misterXLastRevealTurn: 3,
      random: first,
    };

    const d1 = detective("d1", 3);
    const d2 = detective("d2", 7);
    const x = misterX(8);

    const choice = chooseAiMove(d1, corridor, [d1, d2, x], 4, context)!;

    // Depuis 3, on ne peut aller qu'en 2 ou 4 ; 4 touche directement 8.
    expect(choice.stationId).toBe(4);
  });

  it("joue quand même sans aucune piste, jamais sur une case impossible", () => {
    const d1 = detective("d1", 1);
    const d2 = detective("d2", 7);
    const x = misterX(4);

    const choice = chooseAiMove(d1, corridor, [d1, d2, x], null)!;

    expect(choice.stationId).toBe(2);
  });

  it("ne dépense jamais un ticket qu'il n'a pas", () => {
    const d1 = detective("d1", 2, { taxi: 0, bus: 0, metro: 1 });
    const d2 = detective("d2", 7);
    const x = misterX(4);

    const choice = chooseAiMove(d1, corridor, [d1, d2, x], 4, { random: first })!;

    expect(choice.transport).toBe("metro");
    expect(choice.stationId).toBe(6);
  });

  it("renvoie null quand il ne reste aucun ticket", () => {
    const d1 = detective("d1", 2, { taxi: 0, bus: 0, metro: 0 });
    const x = misterX(4);

    expect(chooseAiMove(d1, corridor, [d1, x], 4)).toBeNull();
  });

  it("n'utilise que des informations publiques (la vraie position de Mister X n'influence rien)", () => {
    const context = { random: first };
    const d1 = detective("d1", 2);
    const d2 = detective("d2", 6);

    const withXAt4 = chooseAiMove(d1, corridor, [d1, d2, misterX(4)], 4, context);
    const withXAt8 = chooseAiMove(d1, corridor, [d1, d2, misterX(8)], 4, context);

    expect(withXAt4).toEqual(withXAt8);
  });
});
