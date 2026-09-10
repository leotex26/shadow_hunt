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

  // Pour l'instant, le joueur actif est toujours le premier détective ;
  // la rotation de tour (et l'IA de Mister X / des détectives) viendra
  // avec la prochaine étape.
  const activePlayer = gamePlayers[0];

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

      <GameFooter />
    </div>
  );
}

export default App;
