import { useState } from "react";

import type { PlayerRole } from "../../../game/types/player";
import type { MapId, GameConfig } from "../../../game/types/flow";

import "./GameSetup.css";

interface GameSetupProps {
  onConfirm: (config: GameConfig) => void;
  onBack: () => void;
}

// Registre des cartes disponibles pour l'écran de sélection.
// Ajouter une carte = ajouter un fichier dans game/maps/ + une entrée ici.
const AVAILABLE_MAPS: { id: MapId; name: string; description: string }[] = [
  {
    id: "bellevue",
    name: "Bellevue",
    description: "Petite carte de test, idéale pour apprendre les règles.",
  },
];

const ROLES: { id: PlayerRole; label: string; pitch: string }[] = [
  {
    id: "detective",
    label: "👮 Jouer la Police",
    pitch: "Coordonnez les détectives et traquez Mister X.",
  },
  {
    id: "mister-x",
    label: "🎩 Jouer Mister X",
    pitch: "Semez les détectives et restez caché le plus longtemps possible.",
  },
];

function GameSetup({ onConfirm, onBack }: GameSetupProps) {
  const [mapId, setMapId] = useState<MapId>(AVAILABLE_MAPS[0].id);
  const [userRole, setUserRole] = useState<PlayerRole | null>(null);

  const canStart = userRole !== null;

  return (
    <div className="game-setup">
      <div className="game-setup__header">
        <button type="button" className="game-setup__back" onClick={onBack}>
          ← Retour
        </button>

        <h1>Nouvelle partie</h1>
      </div>

      <section className="game-setup__section">
        <h2>Carte</h2>

        <div className="game-setup__maps">
          {AVAILABLE_MAPS.map((map) => (
            <button
              key={map.id}
              type="button"
              className={`
                game-setup__map
                ${mapId === map.id ? "game-setup__map--selected" : ""}
              `}
              onClick={() => setMapId(map.id)}
            >
              <span className="game-setup__map-name">{map.name}</span>
              <span className="game-setup__map-desc">{map.description}</span>
            </button>
          ))}
        </div>
      </section>

      <section className="game-setup__section">
        <h2>Votre rôle</h2>

        <div className="game-setup__roles">
          {ROLES.map((role) => (
            <button
              key={role.id}
              type="button"
              className={`
                game-setup__role
                ${userRole === role.id ? "game-setup__role--selected" : ""}
              `}
              onClick={() => setUserRole(role.id)}
            >
              <span className="game-setup__role-label">{role.label}</span>
              <span className="game-setup__role-pitch">{role.pitch}</span>
            </button>
          ))}
        </div>
      </section>

      <button
        type="button"
        className="game-setup__confirm"
        disabled={!canStart}
        onClick={() => userRole && onConfirm({ mapId, userRole })}
      >
        Démarrer
      </button>
    </div>
  );
}

export default GameSetup;
