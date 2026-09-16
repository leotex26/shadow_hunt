import { useEffect, useState } from "react";
import "./App.css";

import StartScreen from "./components/screens/StartScreen/StartScreen";
import GameSetup from "./components/screens/GameSetup/GameSetup";

import Header from "./components/Header/Header";
import GameMap from "./components/GameMap/GameMap";
import Sidebar from "./components/Sidebar/Sidebar";
import GameFooter from "./components/GameFooter/GameFooter";

import { maps } from "./game/maps";
import { players as initialPlayers } from "./game/players";
import { getPossibleMoves, movePlayer } from "./game/engine/movement";

import type { AppScreen, GameConfig } from "./game/types/flow";
import type { Player } from "./game/types/player";

// Délai avant de passer automatiquement le tour du camp non joué par
// l'humain. Purement cosmétique (le temps de voir "à Mister X de jouer")
// en attendant qu'une vraie IA prenne ce tour en charge.
const AI_TURN_DELAY_MS = 600;

// Mister X révèle sa position tous les X tours (au sens "tour complet
// de table", voir turnNumber plus bas).
const MISTER_X_REVEAL_INTERVAL = 5;

function App() {
  const [screen, setScreen] = useState<AppScreen>("start");
  const [config, setConfig] = useState<GameConfig | null>(null);
  const [gamePlayers, setGamePlayers] = useState<Player[]>(initialPlayers);

  // Index du joueur dont c'est le tour dans `gamePlayers`.
  // Un "Tour" (au sens du compteur affiché) correspond à un tour complet
  // de la table : il s'incrémente quand on revient au premier joueur.
  const [activePlayerIndex, setActivePlayerIndex] = useState(0);
  const [turnNumber, setTurnNumber] = useState(1);

  // Dernière position de Mister X révélée aux détectives, et le tour
  // auquel elle a été révélée. Reste affichée jusqu'à la révélation
  // suivante (donc `null` seulement avant la toute première révélation).
  const [misterXLastKnownPosition, setMisterXLastKnownPosition] = useState<number | null>(null);
  const [misterXLastRevealTurn, setMisterXLastRevealTurn] = useState<number | null>(null);

  // Tous les hooks doivent être appelés avant les `return` conditionnels
  // ci-dessous, donc les calculs qui en dépendent (map, activePlayer...)
  // sont faits ici avec des gardes plutôt que dans la branche "game".
  const map = config ? maps[config.mapId] : null;
  const activePlayer = gamePlayers[activePlayerIndex];

  // Le joueur humain ne contrôle que le camp choisi dans GameSetup.
  // L'autre camp n'a pas encore d'IA : on se contente, pour l'instant,
  // de lui faire passer son tour automatiquement (voir l'effet ci-dessous).
  const isHumanTurn = config !== null && activePlayer.role === config.userRole;

  // Déplacements possibles pour le joueur actif, déjà filtrés par les
  // tickets qu'il possède encore. Vides quand ce n'est pas le tour du
  // joueur humain : impossible de jouer à la place du camp adverse.
  const possibleMoves = map && isHumanTurn ? getPossibleMoves(activePlayer, map) : [];

  // Prochain tour auquel Mister X révélera sa position (si le tour
  // courant en est déjà un, la révélation a lieu plus tard dans ce
  // même tour, quand vient son tour de jeu).
  const nextMisterXRevealTurn =
    Math.ceil(turnNumber / MISTER_X_REVEAL_INTERVAL) * MISTER_X_REVEAL_INTERVAL;

  const handleMove = (stationId: number) => {
    if (!map || !isHumanTurn) {
      return;
    }

    const movesToStation = possibleMoves.filter(
      (move) => move.stationId === stationId,
    );

    if (movesToStation.length === 0) {
      return;
    }

    // S'il existe plusieurs transports vers la même station,
    // on prend le premier pour l'instant (choix explicite à venir).
    const selectedMove = movesToStation[0];

    setGamePlayers((currentPlayers) =>
      currentPlayers.map((player) =>
        player.id === activePlayer.id
          ? movePlayer(player, selectedMove.stationId, selectedMove.transports[0])
          : player,
      ),
    );

    // Révélation périodique de Mister X : sa nouvelle position reste
    // affichée aux détectives jusqu'à la prochaine révélation.
    if (activePlayer.role === "mister-x" && turnNumber % MISTER_X_REVEAL_INTERVAL === 0) {
      setMisterXLastKnownPosition(selectedMove.stationId);
      setMisterXLastRevealTurn(turnNumber);
    }

    // Un déplacement termine le tour : le joueur suivant prend la main
    // automatiquement. "Finir le tour" reste utile pour passer sans
    // bouger (ex. aucun déplacement possible).
    handleEndTurn();
  };

  const handleEndTurn = () => {
    const nextIndex = (activePlayerIndex + 1) % gamePlayers.length;

    // On a fait le tour de tous les joueurs : le compteur de tour avance.
    if (nextIndex === 0) {
      setTurnNumber((currentTurn) => currentTurn + 1);
    }

    setActivePlayerIndex(nextIndex);
  };

  // Passe automatiquement le tour du camp que l'humain ne joue pas.
  // À remplacer par un vrai coup d'IA plus tard : la rotation elle-même
  // (handleEndTurn) n'a pas besoin de changer.
  useEffect(() => {
    if (screen !== "game" || !config || isHumanTurn) {
      return;
    }

    const timer = setTimeout(handleEndTurn, AI_TURN_DELAY_MS);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [screen, config, activePlayerIndex, isHumanTurn]);

  if (screen === "start") {
    return <StartScreen onStart={() => setScreen("setup")} />;
  }

  if (screen === "setup") {
    return (
      <GameSetup
        onBack={() => setScreen("start")}
        onConfirm={(selectedConfig) => {
          setConfig(selectedConfig);
          setScreen("game");
        }}
      />
    );
  }

  // screen === "game"
  // `config` et `map` sont garantis définis ici : on ne passe à "game"
  // qu'après GameSetup.onConfirm.
  return (
    <div className="game">
      <Header mapName={map!.name} />

      <main className="game-content">
        <GameMap
          map={map!}
          players={gamePlayers}
          activePlayer={activePlayer}
          possibleMoves={possibleMoves}
          viewerRole={config!.userRole}
          misterXLastKnownPosition={misterXLastKnownPosition}
          onMove={handleMove}
        />

        <Sidebar
          players={gamePlayers}
          activePlayerId={activePlayer.id}
          viewerRole={config!.userRole}
          misterXLastRevealTurn={misterXLastRevealTurn}
          nextMisterXRevealTurn={nextMisterXRevealTurn}
        />
      </main>

      <GameFooter
        turnNumber={turnNumber}
        activePlayerName={activePlayer.name}
        isHumanTurn={isHumanTurn}
        onEndTurn={handleEndTurn}
      />
    </div>
  );
}

export default App;
