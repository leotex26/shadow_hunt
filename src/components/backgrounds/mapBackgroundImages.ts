import vieuxPortBackground from "../../../assets/maps/vieux-port-background.png";

// Toutes les cartes n'ont pas forcément une image de fond — Bellevue
// garde pour l'instant son fond en SVG (voir mapBackgrounds.tsx).
// Un id absent de ce registre retombe sur ce fond SVG.
export const mapBackgroundImages: Record<string, string> = {
  "vieux-port": vieuxPortBackground,
};
