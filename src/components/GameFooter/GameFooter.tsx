import "./GameFooter.css";

interface GameFooterProps {
  turnNumber: number;
  activePlayerName: string;
  isHumanTurn: boolean;
  // Vrai si le joueur actif est un détective humain qui peut encore
  // bouger : la règle officielle lui interdit de passer son tour.
  mustMove: boolean;
  onEndTurn: () => void;
}

function GameFooter({ turnNumber, activePlayerName, isHumanTurn, mustMove, onEndTurn }: GameFooterProps) {
  return (
    <footer className="game-footer">

      <div className="turn">
        Tour {turnNumber}
      </div>

      <div className="game-status">
        {!isHumanTurn && `${activePlayerName} joue…`}
        {isHumanTurn && mustMove && `${activePlayerName} doit se déplacer`}
        {isHumanTurn && !mustMove && `À ${activePlayerName} de jouer`}
      </div>

      <button className="end-turn" onClick={onEndTurn} disabled={mustMove}>
        Finir le tour
      </button>

    </footer>
  );
}

export default GameFooter;
