// Fond en image pour une carte donnée. Pour l'instant, toutes les cartes
// utilisent le fond généré en SVG (voir mapBackgrounds.tsx) — caler une
// vraie image sur les positions en % des stations se désynchronisait dès
// que la fenêtre changeait de proportions, et ne correspondait jamais
// vraiment à la disposition réelle des trajets.
//
// Un id absent de ce registre retombe sur le fond SVG généré. Si une
// carte a vraiment besoin d'une image de fond à l'avenir, l'ajouter ici
// avec son import.
export const mapBackgroundImages: Record<string, string> = {};
