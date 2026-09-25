import type { GameMap, TransportType } from "../types/map";
import type { Player } from "../types/player";
import { getPossibleMoves } from "./movement";
import type { TicketPayment } from "./movement";
import { getStationDistances } from "./pathfinding";

export interface AiChoice {
  stationId: number;
  transport: TransportType;
  payment: TicketPayment;
}

// Nombre des meilleures options (selon l'heuristique) parmi lesquelles
// l'IA tire au sort son coup. Volontairement pas 1 : jouer toujours le
// meilleur coup serait déterministe donc parfaitement prévisible dès
// qu'on a compris le pattern — pas franchement plus malin que l'aléatoire
// pur qu'on remplace.
const TOP_CHOICES_POOL = 3;

// Probabilité de payer en ticket noir quand Mister X a le choix (c'est-
// à-dire quand il a encore aussi le ticket normal correspondant).
const BLACK_TICKET_CHANCE = 0.3;

function choosePayment(player: Player, transport: TransportType): TicketPayment {
  const canPayNormal = (player.tickets[transport] ?? 0) > 0;
  const canPayBlack = (player.tickets.black ?? 0) > 0;

  // Plus de ticket normal mais un ticket noir disponible : c'est lui,
  // ou rien (ce cas ne devrait pas arriver si `options` vient bien de
  // getPossibleMoves, mais on reste explicite).
  if (!canPayNormal && canPayBlack) {
    return "black";
  }

  if (canPayNormal && canPayBlack && Math.random() < BLACK_TICKET_CHANCE) {
    return "black";
  }

  return transport;
}

// Choisit le prochain coup du camp non joué par l'humain. Heuristique
// volontairement simple :
// - Mister X s'éloigne du détective le plus proche (en nombre de
//   trajets sur le plateau, tickets non pris en compte pour ce calcul).
// - Les détectives se rapprochent de la dernière position connue de
//   Mister X — ou, s'il n'a jamais encore été révélé, choisissent au
//   hasard faute d'information exploitable.
// Retourne `null` si aucun déplacement n'est possible (plus de ticket).
export function chooseAiMove(
  player: Player,
  map: GameMap,
  gamePlayers: Player[],
  misterXLastKnownPosition: number | null,
): AiChoice | null {
  const moves = getPossibleMoves(player, map);

  const options = moves.flatMap((move) =>
    move.transports.map((transport) => ({ stationId: move.stationId, transport })),
  );

  if (options.length === 0) {
    return null;
  }

  let ranked: { stationId: number; transport: TransportType }[];

  if (player.role === "mister-x") {
    const detectivePositions = gamePlayers
      .filter((currentPlayer) => currentPlayer.role === "detective")
      .map((currentPlayer) => currentPlayer.position);

    const scored = options.map((option) => {
      const distances = getStationDistances(map, option.stationId);

      const minDistanceToDetective = Math.min(
        ...detectivePositions.map((position) => distances.get(position) ?? Infinity),
      );

      return { option, score: minDistanceToDetective };
    });

    // Le plus loin possible du détective le plus proche : score décroissant.
    scored.sort((a, b) => b.score - a.score);
    ranked = scored.map((entry) => entry.option);
  } else if (misterXLastKnownPosition !== null) {
    const distancesFromLastKnownPosition = getStationDistances(map, misterXLastKnownPosition);

    const scored = options.map((option) => ({
      option,
      score: distancesFromLastKnownPosition.get(option.stationId) ?? Infinity,
    }));

    // Le plus proche possible de la dernière position connue : score croissant.
    scored.sort((a, b) => a.score - b.score);
    ranked = scored.map((entry) => entry.option);
  } else {
    // Aucune piste : autant tirer au sort plutôt que de faire semblant
    // d'avoir une stratégie.
    ranked = options;
  }

  const pool = ranked.slice(0, Math.min(TOP_CHOICES_POOL, ranked.length));
  const chosen = pool[Math.floor(Math.random() * pool.length)];

  const payment: TicketPayment =
    player.role === "mister-x" ? choosePayment(player, chosen.transport) : chosen.transport;

  return { ...chosen, payment };
}
