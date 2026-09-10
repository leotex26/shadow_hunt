import "./GameFooter.css";

interface GameFooterProps {
  turnNumber: number;
  activePlayerName: string;
  onEndTurn: () => void;
}

function GameFooter({ turnNumber, activePlayerName, onEndTurn }: GameFooterProps) {
  return (
    <footer className="game-footer">

      <div className="turn">
        Tour {turnNumber}
      </div>

      <div className="game-status">
        À {activePlayerName} de jouer
      </div>

      <button className="end-turn" onClick={onEndTurn}>
        Finir le tour
      </button>

    </footer>
  );
}

export default GameFooter;
