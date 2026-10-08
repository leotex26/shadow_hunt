import type { ReactNode } from "react";

import type { GameMap as MapData } from "../../game/types/map";

// Couleurs de terrain, volontairement séparées de la palette de jeu
// (--color-teal / --color-brass ont un sens de gameplay — camp actif —
// qu'on ne veut pas mélanger avec du décor).
const WATER = "rgba(90, 130, 160, 0.16)";
const WATER_LINE = "rgba(130, 170, 195, 0.32)";
const FOLIAGE = "rgba(90, 140, 100, 0.14)";
const FOLIAGE_LINE = "rgba(110, 160, 115, 0.3)";
const BLOCK_LINE = "rgba(150, 160, 175, 0.24)";

// Taille (dans le repère 0-100, le même que les stations) d'une cellule
// de la grille sur laquelle le motif est généré.
const CELL_SIZE = 13;

// Distance minimale (toujours dans le repère 0-100) qu'un motif doit
// garder par rapport à une station, respectivement à un trajet, pour ne
// jamais venir recouvrir une station ou traverser une ligne : c'est ce
// qui fait que le décor se retrouve bien *entre* les trajets plutôt que
// posé au hasard par-dessus.
const STATION_MARGIN = 9;
const LINE_MARGIN = 5.5;

// =========================
// PRNG déterministe
// =========================
//
// Le fond doit rester identique entre deux rendus d'une même carte (pas
// de scintillement à chaque re-render), mais différent d'une carte à
// l'autre. Un PRNG seedé par le nom de la carte donne les deux à la
// fois, sans avoir à dessiner un motif différent à la main pour chaque
// carte.

function mulberry32(seed: number) {
  let a = seed;

  return function random() {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;

    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;

    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function hashString(value: string): number {
  let hash = 0;

  for (let i = 0; i < value.length; i++) {
    hash = (hash << 5) - hash + value.charCodeAt(i);
    hash |= 0;
  }

  return hash;
}

// =========================
// GÉOMÉTRIE : éviter stations et trajets
// =========================

function distanceToSegment(
  px: number,
  py: number,
  ax: number,
  ay: number,
  bx: number,
  by: number,
): number {
  const dx = bx - ax;
  const dy = by - ay;
  const lengthSquared = dx * dx + dy * dy;

  if (lengthSquared === 0) {
    return Math.hypot(px - ax, py - ay);
  }

  // Projection du point sur le segment, bornée à [0, 1] pour rester
  // entre les deux extrémités plutôt que sur la droite infinie.
  let t = ((px - ax) * dx + (py - ay) * dy) / lengthSquared;
  t = Math.max(0, Math.min(1, t));

  const closestX = ax + t * dx;
  const closestY = ay + t * dy;

  return Math.hypot(px - closestX, py - closestY);
}

// Distance d'un point à la station la plus proche, et au trajet
// (segment entre deux stations reliées) le plus proche. Un motif ne
// doit être placé que là où ces deux distances sont assez grandes.
function distancesToNetwork(map: MapData, x: number, y: number) {
  let nearestStation = Infinity;

  for (const station of map.stations) {
    const distance = Math.hypot(station.x - x, station.y - y);

    if (distance < nearestStation) {
      nearestStation = distance;
    }
  }

  let nearestLine = Infinity;

  for (const connection of map.connections) {
    const from = map.stations.find((station) => station.id === connection.from);
    const to = map.stations.find((station) => station.id === connection.to);

    if (!from || !to) {
      continue;
    }

    const distance = distanceToSegment(x, y, from.x, from.y, to.x, to.y);

    if (distance < nearestLine) {
      nearestLine = distance;
    }
  }

  return { nearestStation, nearestLine };
}

// =========================
// MOTIFS
// =========================
//
// Tous les motifs partagent le même vocabulaire graphique : un simple
// rectangle au trait fin, à peine arrondi, dans l'esprit d'un plan
// cadastral — plutôt que des formes « illustrées » (bâtiments aux coins
// très arrondis, parcs en forme de nuage) qui, à cette échelle, finissent
// par ressembler à des icônes plutôt qu'à du décor de plan.

// Un pâté de maisons : un rectangle divisé par une ou deux lignes
// droites, comme un parcellaire vu de plan.
function cityBlock(rng: () => number, cx: number, cy: number, size: number, key: number): ReactNode {
  const outerW = size;
  const outerH = size * (0.55 + rng() * 0.45);

  const left = cx - outerW / 2;
  const top = cy - outerH / 2;

  const divisions = 1 + Math.floor(rng() * 2);
  const vertical = rng() < 0.5;

  const partitions: ReactNode[] = [];

  for (let i = 1; i <= divisions; i++) {
    const t = i / (divisions + 1);

    if (vertical) {
      const x = left + t * outerW;

      partitions.push(
        <line key={`${key}-d${i}`} x1={x} y1={top} x2={x} y2={top + outerH} stroke={BLOCK_LINE} strokeWidth={0.4} />,
      );
    } else {
      const y = top + t * outerH;

      partitions.push(
        <line key={`${key}-d${i}`} x1={left} y1={y} x2={left + outerW} y2={y} stroke={BLOCK_LINE} strokeWidth={0.4} />,
      );
    }
  }

  return (
    <g key={key}>
      <rect x={left} y={top} width={outerW} height={outerH} rx={0.4} fill="none" stroke={BLOCK_LINE} strokeWidth={0.6} />
      {partitions}
    </g>
  );
}

// Une parcelle hachurée : un rectangle au trait fin, rempli d'un
// hachurage en diagonale — le même procédé que les plans d'architecte
// utilisent pour distinguer un type de terrain (ici : vert pour un
// espace vert, bleu pour un point d'eau) sans dessiner de forme
// représentative.
function hatchedPlot(
  rng: () => number,
  cx: number,
  cy: number,
  w: number,
  h: number,
  key: number,
  fill: string,
  line: string,
): ReactNode {
  const clipId = `hatch-clip-${key}`;
  const left = cx - w / 2;
  const top = cy - h / 2;

  const lineCount = 4 + Math.floor(rng() * 3);
  const hatching: ReactNode[] = [];

  for (let i = 0; i < lineCount; i++) {
    const t = lineCount === 1 ? 0.5 : i / (lineCount - 1);
    const x = left + t * w;

    hatching.push(
      <line
        key={i}
        x1={x - h * 0.15}
        y1={top}
        x2={x + h * 0.15}
        y2={top + h}
        stroke={line}
        strokeWidth={0.4}
      />,
    );
  }

  return (
    <g key={key}>
      <clipPath id={clipId}>
        <rect x={left} y={top} width={w} height={h} rx={0.4} />
      </clipPath>
      <rect x={left} y={top} width={w} height={h} rx={0.4} fill={fill} stroke={line} strokeWidth={0.4} />
      <g clipPath={`url(#${clipId})`}>{hatching}</g>
    </g>
  );
}

// =========================
// GÉNÉRATION PAR CARTE
// =========================
//
// On parcourt une grille sur tout le plateau et, pour chaque cellule, on
// ne tente de poser un motif QUE si son centre est assez loin de toute
// station et de tout trajet (voir distancesToNetwork) — c'est ce qui
// garantit que le décor se glisse dans les espaces entre les trajets au
// lieu d'être posé n'importe où, y compris par-dessus une ligne ou une
// station. La taille du motif est en plus plafonnée par la place
// réellement disponible à cet endroit précis.
function generateCityBackground(map: MapData): ReactNode {
  const rng = mulberry32(hashString(map.id) || 1);
  const elements: ReactNode[] = [];
  let key = 0;

  for (let gy = 0; gy < 100; gy += CELL_SIZE) {
    for (let gx = 0; gx < 100; gx += CELL_SIZE) {
      const jitterX = (rng() - 0.5) * CELL_SIZE * 0.4;
      const jitterY = (rng() - 0.5) * CELL_SIZE * 0.4;
      const cx = gx + CELL_SIZE / 2 + jitterX;
      const cy = gy + CELL_SIZE / 2 + jitterY;

      const { nearestStation, nearestLine } = distancesToNetwork(map, cx, cy);

      if (nearestStation < STATION_MARGIN || nearestLine < LINE_MARGIN) {
        // Trop près d'une station ou d'un trajet : on laisse la cellule
        // vide plutôt que de risquer de dessiner par-dessus.
        continue;
      }

      // La place réellement libre autour de ce point borne la taille du
      // motif, pour qu'il reste bien contenu dans l'espace entre les
      // trajets plutôt que de déborder dessus.
      const clearance = Math.min(nearestStation, nearestLine);
      const maxSize = Math.min(CELL_SIZE * 0.85, clearance * 1.3);

      if (maxSize < 4) {
        continue;
      }

      const roll = rng();

      if (roll < 0.1) {
        elements.push(hatchedPlot(rng, cx, cy, maxSize * 0.9, maxSize * 0.65, key, WATER, WATER_LINE));
      } else if (roll < 0.3) {
        elements.push(hatchedPlot(rng, cx, cy, maxSize * 0.8, maxSize * 0.6, key, FOLIAGE, FOLIAGE_LINE));
      } else if (roll < 0.88) {
        elements.push(cityBlock(rng, cx, cy, maxSize * 0.85, key));
      }
      // Le reste laisse la cellule vide : ça évite un fond trop chargé
      // et donne de la respiration entre les motifs.

      key += 1;
    }
  }

  return <>{elements}</>;
}

// Le motif est généré à partir des vraies stations et trajets de la
// carte, donc toute nouvelle carte obtient automatiquement un fond
// cohérent — glissé entre ses trajets à elle — sans dessin manuel
// supplémentaire.
export function getMapBackground(map: MapData): ReactNode {
  return generateCityBackground(map);
}
