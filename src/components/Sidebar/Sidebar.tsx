import "./Sidebar.css";

import type { Player } from "../../game/types/player";

interface SidebarProps {
  players: Player[];
  activePlayerId: string;
}

function Sidebar({ players, activePlayerId }: SidebarProps) {
  const activePlayer = players.find((player) => player.id === activePlayerId);

  return (
    <aside className="sidebar">
      <section className="sidebar-section">
        <h2>Joueurs</h2>

        {players.map((player) => (
          <div
            key={player.id}
            className={`
              player
              ${player.id === activePlayerId ? "player-active" : ""}
            `}
          >
            {player.role === "mister-x" ? "🎩" : "👮"} {player.name}
          </div>
        ))}
      </section>

      <section className="sidebar-section">
        <h2>Informations</h2>

        <p>
          Sélectionnez un joueur puis une destination possible.
        </p>
      </section>

      {activePlayer && (
        <section className="sidebar-section">
          <h2>Transports de {activePlayer.name}</h2>

          <div className="transport">
            <span>🚕 Taxi</span>
            <strong>{activePlayer.tickets.taxi}</strong>
          </div>

          <div className="transport">
            <span>🚌 Bus</span>
            <strong>{activePlayer.tickets.bus}</strong>
          </div>

          <div className="transport">
            <span>🚇 Métro</span>
            <strong>{activePlayer.tickets.metro}</strong>
          </div>

          {activePlayer.tickets.black !== undefined && (
            <div className="transport">
              <span>🎩 Black</span>
              <strong>{activePlayer.tickets.black}</strong>
            </div>
          )}
        </section>
      )}
    </aside>
  );
}

export default Sidebar;
