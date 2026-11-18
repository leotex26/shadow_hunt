import type { Difficulty } from "../../game/types/flow";
import { DIFFICULTY_OPTIONS } from "../../game/difficulty";
import { AI_SPEED_OPTIONS } from "../../game/settings";
import type { AiSpeed } from "../../game/settings";

import "./SettingsPanel.css";

interface SettingsPanelProps {
  aiSpeed: AiSpeed;
  onAiSpeedChange: (speed: AiSpeed) => void;

  difficulty: Difficulty;
  onDifficultyChange: (difficulty: Difficulty) => void;

  onClose: () => void;
}

function SettingsPanel({
  aiSpeed,
  onAiSpeedChange,
  difficulty,
  onDifficultyChange,
  onClose,
}: SettingsPanelProps) {
  return (
    <div className="settings">
      <div className="settings__header">
        <h2>Réglages</h2>

        <button type="button" className="settings__close" onClick={onClose}>
          Fermer
        </button>
      </div>

      <section className="settings__section">
        <h3 id="settings-speed">Vitesse de l'ordinateur</h3>

        <p className="settings__hint">Le temps qu'il prend avant de jouer son coup.</p>

        <div className="settings__choices" role="radiogroup" aria-labelledby="settings-speed">
          {AI_SPEED_OPTIONS.map((option) => (
            <button
              key={option.id}
              type="button"
              role="radio"
              aria-checked={aiSpeed === option.id}
              className={`settings__choice ${aiSpeed === option.id ? "settings__choice--selected" : ""}`}
              onClick={() => onAiSpeedChange(option.id)}
            >
              {option.label}
            </button>
          ))}
        </div>
      </section>

      <section className="settings__section">
        <h3 id="settings-difficulty">Difficulté</h3>

        <p className="settings__hint">S'applique aux prochains coups de l'ordinateur.</p>

        <div
          className="settings__choices settings__choices--stacked"
          role="radiogroup"
          aria-labelledby="settings-difficulty"
        >
          {DIFFICULTY_OPTIONS.map((option) => (
            <button
              key={option.id}
              type="button"
              role="radio"
              aria-checked={difficulty === option.id}
              className={`settings__choice ${difficulty === option.id ? "settings__choice--selected" : ""}`}
              onClick={() => onDifficultyChange(option.id)}
            >
              <span className="settings__choice-label">{option.label}</span>
              <span className="settings__choice-desc">{option.description}</span>
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}

export default SettingsPanel;
