import "./Sidebar.css";

function Sidebar() {
  return (
    <aside className="sidebar">

      <section className="sidebar-section">
        <h2>Joueurs</h2>

        <div className="player">
          👮 Détective 1
        </div>

        <div className="player">
          👮 Détective 2
        </div>

        <div className="player">
          🎩 Mister X
        </div>
      </section>

      <section className="sidebar-section">
        <h2>Informations</h2>

        <p>
          Sélectionnez un joueur puis une destination possible.
        </p>
      </section>

      <section className="sidebar-section">
        <h2>Transports</h2>

        <div className="transport">
          <span>🚕 Taxi</span>
          <strong>10</strong>
        </div>

        <div className="transport">
          <span>🚌 Bus</span>
          <strong>6</strong>
        </div>

        <div className="transport">
          <span>🚇 Métro</span>
          <strong>3</strong>
        </div>
      </section>

    </aside>
  );
}

export default Sidebar;