import "./App.css";

import Header from "./components/Header/Header";
import GameMap from "./components/GameMap/GameMap";
import Sidebar from "./components/Sidebar/Sidebar";
import GameFooter from "./components/GameFooter/GameFooter";

function App() {
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