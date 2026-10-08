import vieuxPortBackground from "../../assets/maps/vieux-port-background.png";

// Fond en image pour une carte donnée. Les cartes absentes de ce
// registre retombent sur le fond généré en SVG (voir mapBackgrounds.tsx).
//
// Le CSS étire cette image en `background-size: 100% 100%` (et non
// `cover`) : elle est donc toujours calée exactement sur le cadre du
// plateau, sans recentrage à faire — voir GameMap.css.
export const mapBackgroundImages: Record<string, string> = {
  "vieux-port": vieuxPortBackground,
};
