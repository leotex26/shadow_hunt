import { useState } from "react";
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

function App() {
  const [screen, setScreen] = useState<AppScreen>("start");
  const [config, setConfig] = useState<GameConfig | null>(null);
  const [gamePlayers, setGamePlayers] = useState<Player[]>(initialPlayers);

  // Index du joueur dont c'est le tour dans `gamePlayers`.
  // Un "Tour" (au sens du compteur affiché) correspond à un tour complet
  // de la table : il s'incrémente quand on revient au premier joueur.
  const [activePlayerIndex, setActivePlayerIndex] = useState(0);
  const [turnNumber, setTurnNumber] = useState(1);

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
  // `config` est garanti défini ici : on ne passe à "game"
  // qu'après GameSetup.onConfirm.
  const map = maps[config!.mapId];

  // Pour l'instant, tous les joueurs (détectives et Mister X) sont
  // contrôlés depuis cette même interface, à tour de rôle ; l'IA qui
  // contrôlera automatiquement le camp que le joueur humain n'a pas
  // choisi viendra dans une prochaine étape.
  const activePlayer = gamePlayers[activePlayerIndex];

  // Déplacements possibles pour le joueur actif, déjà filtrés
  // par les tickets qu'il possède encore (voir game/engine/movement.ts).
  const possibleMoves = getPossibleMoves(activePlayer, map);

  const handleMove = (stationId: number) => {
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
  };

  const handleEndTurn = () => {
    const nextIndex = (activePlayerIndex + 1) % gamePlayers.length;

    // On a fait le tour de tous les joueurs : le compteur de tour avance.
    if (nextIndex === 0) {
      setTurnNumber((currentTurn) => currentTurn + 1);
    }

    setActivePlayerIndex(nextIndex);
  };

  return (
    <div className="game">
      <Header mapName={map.name} />

      <main className="game-content">
        <GameMap
          map={map}
          players={gamePlayers}
          activePlayer={activePlayer}
          possibleMoves={possibleMoves}
          onMove={handleMove}
        />

        <Sidebar players={gamePlayers} activePlayerId={activePlayer.id} />
      </main>

      <GameFooter
        turnNumber={turnNumber}
        activePlayerName={activePlayer.name}
        onEndTurn={handleEndTurn}
      />
    </div>
  );
}

export default App;
