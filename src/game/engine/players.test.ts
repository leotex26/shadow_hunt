import { describe, expect, it } from "vitest";

import { createInitialPlayers } from "./players";
import { maps } from "./maps";

describe.each(Object.values(maps))("createInitialPlayers — $name", (map) => {
  const players = createInitialPlayers(map);

  it("crée deux détectives et Mister X", () => {
    expect(players.map((player) => player.role)).toEqual([
      "detective",
      "detective",
      "mister-x",
    ]);
  });

  it("donne des identifiants uniques", () => {
    const ids = players.map((player) => player.id);

    expect(new Set(ids).size).toBe(ids.length);
  });

  it("place chaque joueur sur sa position de départ", () => {
    const { startingPositions } = map.balance;

    expect(players[0].position).toBe(startingPositions.detectives[0]);
    expect(players[1].position).toBe(
      startingPositions.detectives[1] ?? startingPositions.detectives[0],
    );
    expect(players[2].position).toBe(startingPositions.misterX);
  });

  it("distribue les tickets de l'équilibrage de la carte", () => {
    const { ticketsByRole } = map.balance;

    expect(players[0].tickets).toEqual(ticketsByRole.detective);
    expect(players[2].tickets).toEqual(ticketsByRole["mister-x"]);
  });

  it("donne à chaque joueur sa propre copie des tickets", () => {
    // Si les deux détectives partageaient le même objet, dépenser un
    // ticket pour l'un le retirerait aussi à l'autre.
    expect(players[0].tickets).not.toBe(players[1].tickets);
    expect(players[0].tickets).not.toBe(map.balance.ticketsByRole.detective);

    players[0].tickets.taxi -= 1;

    expect(players[1].tickets.taxi).toBe(map.balance.ticketsByRole.detective.taxi);
  });

  it("seul Mister X possède des tickets noirs", () => {
    expect(players[0].tickets.black ?? 0).toBe(0);
    expect(players[1].tickets.black ?? 0).toBe(0);
    expect(players[2].tickets.black ?? 0).toBeGreaterThan(0);
  });
});
