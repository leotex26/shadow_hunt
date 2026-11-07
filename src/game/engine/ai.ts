import type { GameMap, TransportType } from "../types/map";
import type { MisterXMoveRecord } from "../types/history";
import type { Player } from "../types/player";
import type { Difficulty } from "../types/flow";
import { getPossibleMoves } from "./movement";
import type { TicketPayment } from "./movement";
import { getNeighbors, getStationDistances } from "./pathfinding";

export interface AiChoice {
  stationId: number;
  transport: TransportType;
  payment: TicketPayment;
}

// Informations publiques en plus de la dernière position connue. Tout est
// optionnel : sans elles, l'IA retombe sur un comportement plus simple.
// Les détectives n'utilisent QUE ce qu'un joueur humain verrait aussi
// (transports annoncés, tour de la dernière révélation) — jamais la vraie
// position de Mister X.
export interface AiContext {
  // Historique visible de Mister X (transport utilisé, ou masqué par un
  // ticket noir).
  misterXMoveHistory?: MisterXMoveRecord[];

  // Tour de la dernière révélation : seuls les coups joués après comptent
  // pour estimer où Mister X peut se trouver.
  misterXLastRevealTurn?: number | null;

  // Niveau de l'IA (le camp que l'humain ne joue pas). "normal" par défaut.
  difficulty?: Difficulty;

  // Source d'aléa, injectable pour des tests reproductibles.
  random?: () => number;
}

type Option = { stationId: number; transport: TransportType };

// Réglages de chaque niveau. Dans tous les cas, l'IA tire au sort parmi
// les coups quasi équivalents (écart de score <= tolerance, dans la limite
// de maxPool) : jouer toujours le meilleur coup la rendrait parfaitement
// prévisible dès qu'on a compris le pattern.
interface AiProfile {
  // Probabilité de jouer un coup au hasard plutôt que le coup réfléchi
  // (étourderie).
  blunderChance: number;
  maxPool: number;
  toleranceMisterX: number;
  toleranceDetective: number;
  // Multiplie la probabilité de payer en ticket noir (plafonnée à 1).
  blackMultiplier: number;
}

export const AI_PROFILES: Record<Difficulty, AiProfile> = {
  easy: {
    blunderChance: 0.15,
    maxPool: 4,
    toleranceMisterX: 4,
    toleranceDetective: 0.4,
    blackMultiplier: 0.5,
  },
  normal: {
    blunderChance: 0,
    maxPool: 3,
    toleranceMisterX: 2,
    toleranceDetective: 0.15,
    blackMultiplier: 1,
  },
  hard: {
    blunderChance: 0,
    maxPool: 2,
    toleranceMisterX: 0.5,
    toleranceDetective: 0.05,
    blackMultiplier: 1.3,
  },
};

// Distance utilisée quand une station est injoignable (carte non connexe) :
// très grande, sans valoir Infinity pour garder les sommes calculables.
const UNREACHABLE = 99;

// Probabilités de payer en ticket noir (quand Mister X a aussi le ticket
// normal) : on le garde en réserve quand rien ne presse, et on l'utilise
// quand les détectives sont proches ou que le transport trahirait
// beaucoup (le métro a peu d'arrêts : l'annoncer réduit fortement les
// positions possibles).
const BLACK_CHANCE_CALM = 0.15;
const BLACK_CHANCE_DANGER = 0.5;
const BLACK_CHANCE_METRO = 0.6;
const DANGER_DISTANCE = 3;

function createDistanceCache(map: GameMap) {
  const cache = new Map<number, Map<number, number>>();

  const from = (stationId: number) => {
    let distances = cache.get(stationId);

    if (!distances) {
      distances = getStationDistances(map, stationId);
      cache.set(stationId, distances);
    }

    return distances;
  };

  return {
    between: (a: number, b: number) => from(a).get(b) ?? UNREACHABLE,
  };
}

// Positions où Mister X peut se trouver d'après ce que les détectives
// savent : on part de la dernière position connue puis, pour chaque coup
// joué depuis, on avance sur les connexions compatibles avec le transport
// annoncé (n'importe lequel si le ticket était noir). Mister X ne peut pas
// non plus se trouver sur la case d'un détective (il serait capturé).
export function estimateMisterXPositions(
  map: GameMap,
  detectivePositions: number[],
  lastKnownPosition: number | null,
  history: MisterXMoveRecord[] = [],
  lastRevealTurn: number | null = null,
): Set<number> {
  const occupied = new Set(detectivePositions);
  const allStations = new Set(map.stations.map((station) => station.id));

  // Jamais révélé : aucune piste, tout est possible (sauf sous un détective).
  if (lastKnownPosition === null) {
    return new Set([...allStations].filter((id) => !occupied.has(id)));
  }

  let possible = new Set<number>([lastKnownPosition]);

  const movesSinceReveal = history
    .filter((record) => record.turn > (lastRevealTurn ?? -Infinity))
    .sort((a, b) => a.turn - b.turn);

  for (const record of movesSinceReveal) {
    const next = new Set<number>();

    for (const station of possible) {
      if (record.concealed) {
        // Ticket noir : le transport réel est inconnu, toute liaison convient.
        getNeighbors(map, station).forEach((neighbor) => next.add(neighbor));
      } else {
        getNeighbors(map, station, record.transport).forEach((neighbor) => next.add(neighbor));
      }
    }

    possible = next;
  }

  const result = new Set([...possible].filter((id) => !occupied.has(id)));

  // Garde-fou : si les données sont incohérentes (partie reprise, carte
  // modifiée...), mieux vaut une estimation large qu'un ensemble vide.
  return result.size > 0 ? result : new Set([...allStations].filter((id) => !occupied.has(id)));
}

function pickFromPool<T>(
  sortedBest: { option: T; score: number }[],
  tolerance: number,
  maxPool: number,
  random: () => number,
): T {
  const best = sortedBest[0].score;

  const pool = sortedBest
    .filter((entry) => Math.abs(entry.score - best) <= tolerance)
    .slice(0, maxPool);

  return pool[Math.floor(random() * pool.length)].option;
}

function choosePayment(
  player: Player,
  transport: TransportType,
  nearestDetectiveDistance: number,
  blackMultiplier: number,
  random: () => number,
): TicketPayment {
  const canPayNormal = (player.tickets[transport] ?? 0) > 0;
  const blackLeft = player.tickets.black ?? 0;

  // Plus de ticket normal mais un ticket noir : c'est lui, ou rien.
  if (!canPayNormal && blackLeft > 0) {
    return "black";
  }

  if (!canPayNormal || blackLeft <= 0) {
    return transport;
  }

  const inDanger = nearestDetectiveDistance <= DANGER_DISTANCE;

  let chance = inDanger ? BLACK_CHANCE_DANGER : BLACK_CHANCE_CALM;

  if (transport === "metro") {
    chance = Math.max(chance, BLACK_CHANCE_METRO);
  }

  // Dernier ticket noir : on ne le gaspille que si c'est vraiment chaud.
  if (blackLeft === 1 && !inDanger) {
    chance /= 2;
  }

  return random() < Math.min(1, chance * blackMultiplier) ? "black" : transport;
}

// Choisit le prochain coup du camp non joué par l'humain.
//
// Mister X : maximise la distance au détective le plus proche (et évite
// de se laisser acculer : on préfère les stations d'où il reste des
// sorties loin des détectives).
//
// Détectives : estiment l'ensemble des positions possibles de Mister X
// (dernière position connue + transports annoncés depuis) et se placent
// pour minimiser la distance moyenne à cet ensemble. Comme chaque
// détective compte les autres comme déjà en place, ils se répartissent
// naturellement au lieu de foncer tous sur la même case. Sans aucune
// piste, ils se dispersent pour couvrir la carte.
//
// Retourne `null` si aucun déplacement n'est possible (plus de ticket).
export function chooseAiMove(
  player: Player,
  map: GameMap,
  gamePlayers: Player[],
  misterXLastKnownPosition: number | null,
  context: AiContext = {},
): AiChoice | null {
  const random = context.random ?? Math.random;
  const profile = AI_PROFILES[context.difficulty ?? "normal"];

  const moves = getPossibleMoves(player, map);

  const options: Option[] = moves.flatMap((move) =>
    move.transports.map((transport) => ({ stationId: move.stationId, transport })),
  );

  if (options.length === 0) {
    return null;
  }

  // Étourderie : parfois, l'IA joue simplement au hasard.
  if (random() < profile.blunderChance) {
    const pick = options[Math.floor(random() * options.length)];

    return {
      ...pick,
      payment: player.role === "mister-x"
        ? choosePayment(player, pick.transport, Infinity, profile.blackMultiplier, random)
        : pick.transport,
    };
  }

  const distance = createDistanceCache(map);

  const detectives = gamePlayers.filter((current) => current.role === "detective");
  const detectivePositions = detectives.map((current) => current.position);

  if (player.role === "mister-x") {
    const scored = options.map((option) => {
      const distances = detectivePositions.map((position) =>
        distance.between(option.stationId, position),
      );

      const nearest = Math.min(...distances);
      const total = distances.reduce((sum, value) => sum + value, 0);

      const neighbors = getNeighbors(map, option.stationId);

      // Sorties : voisines de la destination où aucun détective n'est à
      // portée immédiate. Peu de sorties = risque de se faire coincer.
      const safeExits = neighbors.filter((neighbor) =>
        detectivePositions.every((position) => distance.between(neighbor, position) >= 2),
      ).length;

      let score = nearest * 10 + total + safeExits * 1.5 + neighbors.length * 0.5;

      if (nearest === 0) {
        score -= 1000;
      } else if (nearest === 1) {
        score -= 50;
      }

      return { option, score, nearest };
    });

    scored.sort((a, b) => b.score - a.score);

    const chosenEntry = pickFromPool(scored, profile.toleranceMisterX, profile.maxPool, random);
    const chosen = scored.find((entry) => entry.option === chosenEntry)!;

    return {
      ...chosenEntry,
      payment: choosePayment(
        player,
        chosenEntry.transport,
        chosen.nearest,
        profile.blackMultiplier,
        random,
      ),
    };
  }

  // --- Détectives ---

  const possiblePositions = estimateMisterXPositions(
    map,
    detectivePositions,
    misterXLastKnownPosition,
    context.misterXMoveHistory,
    context.misterXLastRevealTurn ?? null,
  );

  const otherPositions = detectives
    .filter((current) => current.id !== player.id)
    .map((current) => current.position);

  const scored = options.map((option) => {
    const placed = [...otherPositions, option.stationId];

    let total = 0;

    for (const target of possiblePositions) {
      total += Math.min(...placed.map((position) => distance.between(position, target)));
    }

    let score = total / possiblePositions.size;

    // Deux détectives sur la même case ne couvrent rien de plus.
    if (otherPositions.includes(option.stationId)) {
      score += 0.5;
    }

    // À couverture égale, on ménage les tickets rares : les transports
    // dont il reste le moins d'exemplaires coûtent un peu plus cher.
    score += 0.005 / (1 + (player.tickets[option.transport] ?? 0));

    return { option, score };
  });

  scored.sort((a, b) => a.score - b.score);

  const chosen = pickFromPool(scored, profile.toleranceDetective, profile.maxPool, random);

  return { ...chosen, payment: chosen.transport };
}
