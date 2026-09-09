import "./StartScreen.css";

interface StartScreenProps {
  onStart: () => void;
}

function StartScreen({ onStart }: StartScreenProps) {
  return (
    <div className="start-screen">
      <div className="start-screen__content">
        <p className="start-screen__kicker">Un jeu de filature</p>

        <h1 className="start-screen__title">
          Shadow<span className="start-screen__title-accent">Hunt</span>
        </h1>

        <p className="start-screen__tagline">
          Un fugitif. Une poignée de détectives. Une ville qui ne dit rien.
        </p>

        <button
          type="button"
          className="start-screen__cta"
          onClick={onStart}
        >
          Démarrer une partie
        </button>

        <div className="start-screen__secondary">
          <button type="button" className="start-screen__link" disabled>
            Règles
          </button>
          <span className="start-screen__dot">·</span>
          <button type="button" className="start-screen__link" disabled>
            Options
          </button>
        </div>
      </div>
    </div>
  );
}

export default StartScreen;
