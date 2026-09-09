import { useState } from "react";
import "./App.css";

import StartScreen from "src/components/screens/StartScreen";
import GameSetup from "src/components/screens/GameSetup";

import Header from "./components/Header/Header";
import GameMap from "./components/GameMap/GameMap";       
import Sidebar from "./components/Sidebar/Sidebar";
import GameFooter from "./components/GameFooter/GameFooter";

import type { AppScreen, GameConfig } from "./game/types/flow";

function App() {
  const [screen, setScreen] = useState<AppScreen>("start");
  const [config, setConfig] = useState<GameConfig | null>(null);

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
  // Note : `config` est forcément défini ici puisqu'on ne passe
  // à "game" qu'après GameSetup.onConfirm. On le garde en state pour
  // le brancher sur GameMap/Sidebar/Header quand ils accepteront des props
  // (carte choisie, rôle du joueur humain).
  void config;

  return (
    <div className="game">
      <Header />

      <main className="game-content">
        <GameMap />
        <Sidebar />
      </main>

      <GameFooter />
    </div>
  );
}

export default App;
