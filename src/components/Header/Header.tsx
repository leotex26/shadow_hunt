import "./Header.css";

interface HeaderProps {
  mapName: string;
  // Abandonne la partie en cours et revient à l'écran d'accueil.
  // Optionnel : Header pourrait un jour servir ailleurs que pendant une
  // partie, où cette action n'aurait pas de sens.
  onQuit?: () => void;
}

function Header({ mapName, onQuit }: HeaderProps) {
  return (
    <header className="header">
      <h1>SHADOW HUNT</h1>

      <div className="map-name">
        Carte : {mapName}
      </div>

      <div className="header-actions">
        <button>?</button>
        <button>⚙</button>

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