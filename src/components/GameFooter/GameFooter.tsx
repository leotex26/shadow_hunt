import "./GameFooter.css";

function GameFooter() {
  return (
    <footer className="game-footer">

      <div className="turn">
        Tour 1 / --
      </div>

      <div className="game-status">
        À vous de jouer
      </div>

      <button className="end-turn">
        Finir le tour
      </button>

    </footer>
  );
}

export default GameFooter;