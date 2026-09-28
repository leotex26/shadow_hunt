import type { ReactNode } from "react";

// Couleurs de terrain, volontairement séparées de la palette de jeu
// (--color-teal / --color-brass ont un sens de gameplay — camp actif —
// qu'on ne veut pas mélanger avec du décor).
const WATER = "rgba(90, 130, 160, 0.16)";
const FOLIAGE = "rgba(90, 140, 100, 0.14)";

// Coordonnées à la main dans un repère 0-100 (même échelle que les
// stations), avec un léger débordement hors cadre (valeurs négatives
// ou > 100) pour que les formes se coupent naturellement au bord du
// plateau plutôt que de s'arrêter pile sur une arête visible.

function BellevueBackground() {
  return (
    <>
      {/* Forêt (station 1) + Parc (station 5) : bande boisée à gauche */}
      <path
        d="M -5,5 C 12,-2 28,8 24,24 C 32,34 26,52 8,56 C -8,50 -9,20 -5,5 Z"
        fill={FOLIAGE}
      />

      {/* Lac (station 8) et ses berges, jusque vers le Port (station 10) */}
      <path
        d="M 8,63 C 24,58 44,61 60,64 C 76,67 92,62 106,66 L 106,88 C 78,93 38,90 8,85 Z"
        fill={WATER}
      />
    </>
  );
}

function VieuxPortBackground() {
  return (
    // Darse du port : bande d'eau le long du quai (stations 1 à 6)
    <path
      d="M -5,-5 L 105,-5 L 105,23 C 88,29 68,20 50,25 C 32,30 14,20 -5,25 Z"
      fill={WATER}
    />
  );
}

// mapId reste un `string` générique plutôt qu'un `MapId` importé : ce
// fichier est purement décoratif, il n'a pas besoin d'être couplé au
// typage strict du reste du jeu. Un id inconnu retombe sur `null`.
export function getMapBackground(mapId: string): ReactNode {
  switch (mapId) {
    case "bellevue":
      return <BellevueBackground />;

    case "vieux-port":
      return <VieuxPortBackground />;

    default:
      return null;
  }
}
