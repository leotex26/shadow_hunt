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
import type { PossibleMove } from "./game/engine/movement";

import type { AppScreen, GameConfig } from "./game/types/flow";
import type { Player } from "./game/types/player";

// Délai avant de passer automatiquement le tour du camp non joué par
// l'humain. Purement cosmétique (le temps de voir "à Mister X de jouer")
// en attendant qu'une vraie IA prenne ce tour en charge.
const AI_TURN_DELAY_MS = 600;

// Tours de révélation classiques de Scotland Yard : Mister X est démasqué
// aux tours 3, 8, 13, 18 et 24 (aucune révélation supplémentaire après).
const MISTER_X_REVEAL_TURNS = [3, 8, 13, 18, 24];

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

  // Défini dès qu'un détective se pose sur la case de Mister X — même
  // s'il ne le "savait" pas, sa position étant cachée entre deux
  // révélations. Fige la partie une fois non-null.
  const [winner, setWinner] = useState<"detectives" | null>(null);

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

  // Prochain tour auquel Mister X révélera sa position (null s'il n'y
  // en a plus, le tour courant ayant dépassé la dernière révélation).
  const nextMisterXRevealTurn = MISTER_X_REVEAL_TURNS.find((turn) => turn >= turnNumber) ?? null;

  const handleMove = (stationId: number) => {
    if (!map || !isHumanTurn || winner) {
      return;
    }

    const movesToStation = possibleMoves.filter(
      (move) => move.stationId === stationId,
    );

    const captured = applyMove(activePlayer, movesToStation);

    if (!captured) {
      handleEndTurn();
    }
  };

  // Applique un déplacement (choix humain ou coup automatique) : met à
  // jour la position/les tickets du joueur, déclenche la révélation de
  // Mister X si c'est le tour qu'il faut, et détecte une capture.
  // Ne fait rien si la liste de coups passée est vide.
  // Retourne `true` si ce déplacement vient de mettre fin à la partie.
  const applyMove = (player: Player, movesForStation: PossibleMove[]): boolean => {
    if (movesForStation.length === 0) {
      return false;
    }

    // S'il existe plusieurs transports vers la même station,
    // on prend le premier pour l'instant (choix explicite à venir).
    const selectedMove = movesForStation[0];

    const nextPlayers = gamePlayers.map((currentPlayer) =>
      currentPlayer.id === player.id
        ? movePlayer(currentPlayer, selectedMove.stationId, selectedMove.transports[0])
        : currentPlayer,
    );

    setGamePlayers(nextPlayers);

    // Révélation périodique de Mister X : sa nouvelle position reste
    // affichée aux détectives jusqu'à la prochaine révélation.
    if (player.role === "mister-x" && MISTER_X_REVEAL_TURNS.includes(turnNumber)) {
      setMisterXLastKnownPosition(selectedMove.stationId);
      setMisterXLastRevealTurn(turnNumber);
    }

    // Capture : un détective (celui qui vient de bouger, ou Mister X qui
    // vient de se déplacer droit sur un détective) partage la case de
    // Mister X. La partie s'arrête immédiatement.
    const misterX = nextPlayers.find((currentPlayer) => currentPlayer.role === "mister-x");
    const isCaught =
      misterX !== undefined &&
      nextPlayers.some(
        (currentPlayer) =>
          currentPlayer.role === "detective" && currentPlayer.position === misterX.position,
      );

    if (isCaught && misterX) {
      setWinner("detectives");

      // Il est de toute façon démasqué à cet instant.
      setMisterXLastKnownPosition(misterX.position);
      setMisterXLastRevealTurn(turnNumber);

      return true;
    }

    return false;
  };

  const handleEndTurn = () => {
    const nextIndex = (activePlayerIndex + 1) % gamePlayers.length;

    // On a fait le tour de tous les joueurs : le compteur de tour avance.
    if (nextIndex === 0) {
      setTurnNumber((currentTurn) => currentTurn + 1);
    }

    setActivePlayerIndex(nextIndex);
  };

  const resetGame = () => {
    setGamePlayers(initialPlayers);
    setActivePlayerIndex(0);
    setTurnNumber(1);
    setMisterXLastKnownPosition(null);
    setMisterXLastRevealTurn(null);
    setWinner(null);
    setConfig(null);
    setScreen("start");
  };

  // Fait jouer automatiquement le camp que l'humain ne contrôle pas :
  // un déplacement aléatoire parmi ceux possibles (ou aucun s'il n'y en
  // a pas), puis passage du tour. C'est ici que branchera une vraie IA
  // plus tard — seul le choix du coup changera, pas la mécanique autour.
  useEffect(() => {
    if (screen !== "game" || !config || isHumanTurn || !map || winner) {
      return;
    }

    const timer = setTimeout(() => {
      const aiMoves = getPossibleMoves(activePlayer, map);
      let captured = false;

      if (aiMoves.length > 0) {
        const randomMove = aiMoves[Math.floor(Math.random() * aiMoves.length)];
        captured = applyMove(activePlayer, [randomMove]);
      }

      if (!captured) {
        handleEndTurn();
      }
    }, AI_TURN_DELAY_MS);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [screen, config, activePlayerIndex, isHumanTurn, map, winner]);

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
  if (winner) {
    const captureStation =
      misterXLastKnownPosition !== null
        ? map!.stations.find((station) => station.id === misterXLastKnownPosition)
        : undefined;

    return (
      <div className="game-over">
        <h1>Mister X a été démasqué !</h1>

        <p>
          {captureStation
            ? `Rattrapé à la station ${captureStation.name}.`
            : "Rattrapé par les détectives."}
        </p>

        <button type="button" onClick={resetGame}>
          Nouvelle partie
        </button>
      </div>
    );
  }

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
