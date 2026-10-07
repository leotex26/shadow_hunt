import type { ReactNode } from "react";

// Couleurs de terrain, volontairement séparées de la palette de jeu
// (--color-teal / --color-brass ont un sens de gameplay — camp actif —
// qu'on ne veut pas mélanger avec du décor).
const WATER = "rgba(90, 130, 160, 0.18)";
const WATER_LINE = "rgba(130, 170, 195, 0.35)";
const FOLIAGE = "rgba(90, 140, 100, 0.16)";
const FOLIAGE_LINE = "rgba(110, 160, 115, 0.3)";
const BLOCK_LINE = "rgba(150, 160, 175, 0.22)";

// Taille (dans le repère 0-100, le même que les stations) d'une cellule
// de la grille sur laquelle le motif est généré.
const CELL_SIZE = 22;

// =========================
// PRNG déterministe
// =========================
//
// Le fond doit rester identique entre deux rendus d'une même carte (pas
// de scintillement à chaque re-render), mais différent d'une carte à
// l'autre. Un PRNG seedé par le nom de la carte donne les deux à la fois,
// sans avoir à dessiner un motif différent à la main pour chaque carte.

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
// MOTIFS
// =========================

// Un "îlot urbain" : un contour (le pâté de maisons) contenant 2 à 4
// bâtiments plus petits — uniquement des contours, pas de remplissage,
// pour rester discret derrière les trajets et les stations.
function cityBlock(rng: () => number, cx: number, cy: number, size: number, key: number): ReactNode {
  const outerW = size;
  const outerH = size * (0.6 + rng() * 0.5);

  const left = cx - outerW / 2;
  const top = cy - outerH / 2;

  const innerCount = 2 + Math.floor(rng() * 3);
  const cols = innerCount > 3 ? 2 : innerCount;
  const rows = Math.ceil(innerCount / cols);

  const padding = outerW * 0.14;
  const cellW = (outerW - padding * 2) / cols;
  const cellH = (outerH - padding * 2) / rows;

  const buildings: ReactNode[] = [];
  let placed = 0;

  for (let row = 0; row < rows && placed < innerCount; row++) {
    for (let col = 0; col < cols && placed < innerCount; col++) {
      const bw = cellW * (0.5 + rng() * 0.35);
      const bh = cellH * (0.5 + rng() * 0.35);
      const bx = left + padding + col * cellW + (cellW - bw) / 2;
      const by = top + padding + row * cellH + (cellH - bh) / 2;

      buildings.push(
        <rect
          key={`${key}-b${row}-${col}`}
          x={bx}
          y={by}
          width={bw}
          height={bh}
          rx={0.6}
          fill="none"
          stroke={BLOCK_LINE}
          strokeWidth={0.5}
        />,
      );

      placed += 1;
    }
  }

  return (
    <g key={key}>
      <rect
        x={left}
        y={top}
        width={outerW}
        height={outerH}
        rx={1.2}
        fill="none"
        stroke={BLOCK_LINE}
        strokeWidth={0.6}
      />
      {buildings}
    </g>
  );
}

// Un espace vert : un polygone irrégulier à faible opacité, imitant un
// petit parc ou un square plutôt qu'une forme géométrique trop nette.
function parkBlob(rng: () => number, cx: number, cy: number, size: number, key: number): ReactNode {
  const points = 6 + Math.floor(rng() * 3);
  const angleStep = (Math.PI * 2) / points;

  let d = "";

  for (let i = 0; i <= points; i++) {
    const angle = i * angleStep;
    const radius = size * (0.6 + rng() * 0.45);
    const x = cx + Math.cos(angle) * radius;
    const y = cy + Math.sin(angle) * radius * 0.75;

    d += i === 0 ? `M ${x.toFixed(2)},${y.toFixed(2)} ` : `L ${x.toFixed(2)},${y.toFixed(2)} `;
  }

  d += "Z";

  return <path key={key} d={d} fill={FOLIAGE} stroke={FOLIAGE_LINE} strokeWidth={0.4} />;
}

// Un point d'eau : un rectangle arrondi pâle, avec quelques traits en
// diagonale à l'intérieur pour suggérer de légères ondulations.
function waterZone(
  rng: () => number,
  cx: number,
  cy: number,
  w: number,
  h: number,
  key: number,
): ReactNode {
  const clipId = `water-clip-${key}`;
  const left = cx - w / 2;
  const top = cy - h / 2;

  const lineCount = 4 + Math.floor(rng() * 3);
  const lines: ReactNode[] = [];

  for (let i = 0; i < lineCount; i++) {
    const t = lineCount === 1 ? 0.5 : i / (lineCount - 1);
    const x = left + t * w;

    lines.push(
      <line
        key={i}
        x1={x - h * 0.15}
        y1={top}
        x2={x + h * 0.15}
        y2={top + h}
        stroke={WATER_LINE}
        strokeWidth={0.4}
      />,
    );
  }

  return (
    <g key={key}>
      <clipPath id={clipId}>
        <rect x={left} y={top} width={w} height={h} rx={1.5} />
      </clipPath>
      <rect x={left} y={top} width={w} height={h} rx={1.5} fill={WATER} />
      <g clipPath={`url(#${clipId})`}>{lines}</g>
    </g>
  );
}

// =========================
// GÉNÉRATION PAR CARTE
// =========================
//
// On parcourt une grille sur tout le plateau (avec un léger débordement
// hors cadre, comme les anciens fonds dessinés à la main) et, pour
// chaque cellule, on tire au sort ce qu'elle contient. Les probabilités
// sont choisies pour que les îlots urbains dominent, avec quelques
// espaces verts et, plus rarement, un point d'eau.
function generateCityBackground(mapId: string): ReactNode {
  const rng = mulberry32(hashString(mapId) || 1);
  const elements: ReactNode[] = [];
  let key = 0;

  for (let gy = -10; gy < 110; gy += CELL_SIZE) {
    for (let gx = -10; gx < 110; gx += CELL_SIZE) {
      const roll = rng();
      const cx = gx + CELL_SIZE / 2 + (rng() - 0.5) * CELL_SIZE * 0.3;
      const cy = gy + CELL_SIZE / 2 + (rng() - 0.5) * CELL_SIZE * 0.3;

      if (roll < 0.08) {
        elements.push(waterZone(rng, cx, cy, CELL_SIZE * 0.8, CELL_SIZE * 0.55, key));
      } else if (roll < 0.26) {
        elements.push(parkBlob(rng, cx, cy, CELL_SIZE * 0.3, key));
      } else if (roll < 0.85) {
        elements.push(cityBlock(rng, cx, cy, CELL_SIZE * 0.6, key));
      }
      // Le reste (15%) laisse la cellule vide : ça évite un fond trop
      // chargé et donne de la respiration entre les motifs.

      key += 1;
    }
  }

  return <>{elements}</>;
}

// mapId reste un `string` générique plutôt qu'un `MapId` importé : ce
// fichier est purement décoratif, il n'a pas besoin d'être couplé au
// typage strict du reste du jeu. Le motif est généré à partir de l'id,
// donc toute nouvelle carte obtient automatiquement un fond cohérent et
// qui lui est propre, sans dessin manuel supplémentaire.
export function getMapBackground(mapId: string): ReactNode {
  return generateCityBackground(mapId);
}
