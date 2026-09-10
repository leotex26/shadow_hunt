import "./Header.css";

interface HeaderProps {
  mapName: string;
}

function Header({ mapName }: HeaderProps) {
  return (
    <header className="header">
      <h1>SHADOW HUNT</h1>

      <div className="map-name">
        Carte : {mapName}
      </div>

      <div className="header-actions">
        <button>?</button>
        <button>⚙</button>
      </div>
    </header>
  );
}

export default Header;