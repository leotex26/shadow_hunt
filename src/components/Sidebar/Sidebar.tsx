import "./Sidebar.css";

import type { Player, PlayerRole } from "../../game/types/player";

interface SidebarProps {
  players: Player[];
  activePlayerId: string;
  // Rôle joué par l'humain : détermine si on peut afficher les tickets
  // du joueur actif (pas question de montrer ceux du camp adverse).
  viewerRole: PlayerRole;
  // Tour auquel Mister X a été vu pour la dernière fois (null si jamais
  // encore révélé), et prochain tour de révélation prévu.
  misterXLastRevealTurn: number | null;
  nextMisterXRevealTurn: number;
}

function Sidebar({
  players,
  activePlayerId,
  viewerRole,
  misterXLastRevealTurn,
  nextMisterXRevealTurn,
}: SidebarProps) {
  const activePlayer = players.find((player) => player.id === activePlayerId);
  const canSeeActivePlayerTickets = activePlayer?.role === viewerRole;

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

      {viewerRole !== "mister-x" && (
        <section className="sidebar-section">
          <h2>Mister X</h2>

          <p>
            {misterXLastRevealTurn !== null
              ? `Vu pour la dernière fois au tour ${misterXLastRevealTurn}.`
              : "Position jamais encore révélée."}
          </p>

          <p>Prochaine révélation : tour {nextMisterXRevealTurn}.</p>
        </section>
      )}

      {activePlayer && canSeeActivePlayerTickets && (
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

      {activePlayer && !canSeeActivePlayerTickets && (
        <section className="sidebar-section">
          <h2>Transports</h2>

          <p>Le camp adverse joue son tour.</p>
        </section>
      )}
    </aside>
  );
}

export default Sidebar;
