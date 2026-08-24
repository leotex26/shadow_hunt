import "./Header.css";

function Header() {
  return (
    <header className="header">
      <h1>SHADOW HUNT</h1>

      <div className="map-name">
        Carte : Bellevue
      </div>

      <div className="header-actions">
        <button>?</button>
        <button>⚙</button>
      </div>
    </header>
  );
}

export default Header;