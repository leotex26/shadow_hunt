import "./GameFooter.css";

interface GameFooterProps {
  turnNumber: number;
  activePlayerName: string;
  isHumanTurn: boolean;
  onEndTurn: () => void;
}

function GameFooter({ turnNumber, activePlayerName, isHumanTurn, onEndTurn }: GameFooterProps) {
  return (
    <footer className="game-footer">

      <div className="turn">
        Tour {turnNumber}
      </div>

      <div className="game-status">
        {isHumanTurn ? `À ${activePlayerName} de jouer` : `${activePlayerName} joue…`}
      </div>

      <button className="end-turn" onClick={onEndTurn}>
        Finir le tour
      </button>

    </footer>
  );
}

export default GameFooter;
