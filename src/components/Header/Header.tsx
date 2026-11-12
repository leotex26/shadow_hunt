import "./Header.css";

interface HeaderProps {
  mapName: string;
  // Ouvre les règles par-dessus la partie.
  onShowRules?: () => void;
  // Ouvre les réglages (vitesse de l'ordinateur, difficulté).
  onShowSettings?: () => void;
  // Abandonne la partie en cours et revient à l'écran d'accueil.
  // Optionnel : Header pourrait un jour servir ailleurs que pendant une
  // partie, où cette action n'aurait pas de sens.
  onQuit?: () => void;
}

function Header({ mapName, onShowRules, onShowSettings, onQuit }: HeaderProps) {
  return (
    <header className="header">
      <h1>SHADOW HUNT</h1>

      <div className="map-name">
        Carte : {mapName}
      </div>

      <div className="header-actions">
        {onShowRules && (
          <button type="button" title="Règles du jeu" aria-label="Règles du jeu" onClick={onShowRules}>
            ?
          </button>
        )}

        {onShowSettings && (
          <button type="button" title="Réglages" aria-label="Réglages" onClick={onShowSettings}>
            ⚙
          </button>
        )}

        {onQuit && (
          <button
            type="button"
            className="header-actions__quit"
            title="Abandonner la partie et revenir au menu"
            onClick={onQuit}
          >
            Quitter
          </button>
        )}
      </div>
    </header>
  );
}

export default Header;
