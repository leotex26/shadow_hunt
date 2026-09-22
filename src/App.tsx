import { useEffect, useState } from "react";
import "./App.css";

import StartScreen from "./components/screens/StartScreen/StartScreen";
import Rules from "./components/screens/Rules/Rules";
import GameSetup from "./components/screens/GameSetup/GameSetup";

import Header from "./components/Header/Header";
import GameMap from "./components/GameMap/GameMap";
import Sidebar from "./components/Sidebar/Sidebar";
import GameFooter from "./components/GameFooter/GameFooter";

import { maps } from "./game/maps";
import { createInitialPlayers } from "./game/players";
import { getPossibleMoves, movePlayer } from "./game/engine/movement";
import type { TicketPayment } from "./game/engine/movement";
import { saveGame, loadGame, clearSavedGame } from "./game/persistence";

import type { AppScreen, GameConfig } from "./game/types/flow";
import type { Player } from "./game/types/player";
import type { TransportType } from "./game/types/map";
import type { MisterXMoveRecord } from "./game/types/history";

// Délai avant de passer automatiquement le tour du camp non joué par
// l'humain. Purement cosmétique (le temps de voir "à Mister X de jouer")
// en attendant qu'une vraie IA prenne ce tour en charge.
const AI_TURN_DELAY_MS = 600;

// Carte utilisée par défaut tant qu'aucune partie n'a encore démarré
// (juste pour donner un état initial cohérent à `gamePlayers` sur les
// écrans d'accueil/configuration — elle est remplacée dès que la vraie
// carte est choisie dans GameSetup).
const placeholderMap = Object.values(maps)[0];

function App() {
  const [screen, setScreen] = useState<AppScreen>("start");
  const [config, setConfig] = useState<GameConfig | null>(null);
  const [gamePlayers, setGamePlayers] = useState<Player[]>(() =>
    createInitialPlayers(placeholderMap),
  );

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

  // Historique des transports utilisés par Mister X, visible par les
  // détectives : un ticket noir masque le transport réel ("❓" côté
  // affichage) au lieu de le révéler.
  const [misterXMoveHistory, setMisterXMoveHistory] = useState<MisterXMoveRecord[]>([]);

  // Défini dès qu'un détective se pose sur la case de Mister X, que
  // Mister X survit jusqu'au dernier tour, ou que tous les détectives
  // sont bloqués (plus aucun déplacement possible). Fige la partie une
  // fois non-null.
  const [winner, setWinner] = useState<"detectives" | "mister-x" | null>(null);

  // Tous les hooks doivent être appelés avant les `return` conditionnels
  // ci-dessous, donc les calculs qui en dépendent (map, activePlayer...)
  // sont faits ici avec des gardes plutôt que dans la branche "game".
  const map = config ? maps[config.mapId] : null;
  const activePlayer = gamePlayers[activePlayerIndex];

  // Tours de révélation et durée de partie propres à la carte en cours
  // (voir bellevue.ts, champ `balance`). Tableaux/valeurs "vides" tant
  // qu'aucune carte n'est encore choisie — sans incidence, puisque tout
  // ce qui les utilise est de toute façon gardé par `screen === "game"`.
  const revealTurns = map?.balance.revealTurns ?? [];
  const finalTurn = map?.balance.finalTurn ?? Infinity;

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
  const nextMisterXRevealTurn = revealTurns.find((turn) => turn >= turnNumber) ?? null;

  // Règle officielle : un détective ne peut pas passer son tour tant
  // qu'un déplacement lui est possible (Mister X, lui, le peut : il n'a
  // pas cette contrainte).
  const mustMove = isHumanTurn && activePlayer.role === "detective" && possibleMoves.length > 0;

  const handleMove = (stationId: number, transport: TransportType, payment: TicketPayment) => {
    if (!map || !isHumanTurn || winner) {
      return;
    }

    // Sécurité : on vérifie que ce transport est bien l'un de ceux
    // réellement disponibles vers cette station (tickets compris),
    // plutôt que de faire confiance à ce que le composant renvoie.
    const move = possibleMoves.find((possibleMove) => possibleMove.stationId === stationId);

    if (!move || !move.transports.includes(transport)) {
      return;
    }

    // Le paiement doit être réellement possible : le ticket normal du
    // transport choisi, ou un ticket noir (Mister X uniquement).
    const canPay =
      payment === "black"
        ? (activePlayer.tickets.black ?? 0) > 0
        : (activePlayer.tickets[payment] ?? 0) > 0;

    if (!canPay) {
      return;
    }

    const captured = applyMove(activePlayer, stationId, transport, payment);

    if (!captured) {
      handleEndTurn();
    }
  };

  // Applique un déplacement (choix humain ou coup automatique) : met à
  // jour la position/les tickets du joueur avec le paiement précis
  // choisi (ticket du transport, ou ticket noir), journalise le
  // déplacement de Mister X pour l'historique visible des détectives,
  // déclenche la révélation de sa position si c'est le tour qu'il faut,
  // et détecte une capture.
  // Retourne `true` si ce déplacement vient de mettre fin à la partie.
  const applyMove = (
    player: Player,
    stationId: number,
    transport: TransportType,
    payment: TicketPayment,
  ): boolean => {
    const nextPlayers = gamePlayers.map((currentPlayer) =>
      currentPlayer.id === player.id
        ? movePlayer(currentPlayer, stationId, payment)
        : currentPlayer,
    );

    setGamePlayers(nextPlayers);

    if (player.role === "mister-x") {
      // Historique visible des détectives : le transport réel, sauf
      // paiement en ticket noir, qui le masque.
      setMisterXMoveHistory((history) => [
        ...history,
        { turn: turnNumber, transport, concealed: payment === "black" },
      ]);

      // Révélation périodique de Mister X : sa nouvelle position reste
      // affichée aux détectives jusqu'à la prochaine révélation. Elle a
      // lieu même si le déplacement a été payé en ticket noir — seul le
      // *transport* reste caché, pas la position aux tours de révélation.
      if (revealTurns.includes(turnNumber)) {
        setMisterXLastKnownPosition(stationId);
        setMisterXLastRevealTurn(turnNumber);
      }
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

    if (nextIndex === 0) {
      // Le dernier tour de la carte vient de se terminer sans capture :
      // Mister X survit.
      if (turnNumber >= finalTurn) {
        setWinner("mister-x");
        return;
      }

      // Plus aucun détective ne peut se déplacer (tickets épuisés,
      // impasse...) : Mister X gagne aussi.
      if (map) {
        const detectives = gamePlayers.filter((player) => player.role === "detective");
        const allDetectivesStuck = detectives.every(
          (detective) => getPossibleMoves(detective, map).length === 0,
        );

        if (allDetectivesStuck) {
          setWinner("mister-x");
          return;
        }
      }

      // On a fait le tour de tous les joueurs : le compteur de tour avance.
      setTurnNumber((currentTurn) => currentTurn + 1);
    }

    setActivePlayerIndex(nextIndex);
  };

  const resetGame = () => {
    clearSavedGame();

    setGamePlayers(createInitialPlayers(placeholderMap));
    setActivePlayerIndex(0);
    setTurnNumber(1);
    setMisterXLastKnownPosition(null);
    setMisterXLastRevealTurn(null);
    setMisterXMoveHistory([]);
    setWinner(null);
    setConfig(null);
    setScreen("start");
  };

  // Reprend la partie enregistrée dans localStorage (si elle existe —
  // voir le bouton "Reprendre la partie" sur l'écran d'accueil).
  const resumeGame = () => {
    const saved = loadGame();

    if (!saved) {
      return;
    }

    setConfig(saved.config);
    setGamePlayers(saved.gamePlayers);
    setActivePlayerIndex(saved.activePlayerIndex);
    setTurnNumber(saved.turnNumber);
    setMisterXLastKnownPosition(saved.misterXLastKnownPosition);
    setMisterXLastRevealTurn(saved.misterXLastRevealTurn);
    setMisterXMoveHistory(saved.misterXMoveHistory);
    setWinner(saved.winner);
    setScreen("game");
  };

  // Utilisé uniquement par le bouton "Finir le tour" : refuse de passer
  // si le joueur humain est un détective qui peut encore se déplacer.
  const handleManualEndTurn = () => {
    if (mustMove) {
      return;
    }

    handleEndTurn();
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

      // On aplatit en paires (station, transport) pour tirer au sort
      // uniformément parmi toutes les combinaisons réellement possibles,
      // plutôt que de toujours prendre le premier transport de la liste.
      const options = aiMoves.flatMap((move) =>
        move.transports.map((transport) => ({ stationId: move.stationId, transport })),
      );

      let captured = false;

      if (options.length > 0) {
        const choice = options[Math.floor(Math.random() * options.length)];

        // Choix du paiement : s'il n'a plus le ticket normal, le ticket
        // noir est la seule option (c'est justement pour ça qu'il était
        // dans la liste). S'il a les deux, l'IA en garde un peu sous le
        // coude et ne le joue qu'une fois sur trois environ.
        const canPayNormal = (activePlayer.tickets[choice.transport] ?? 0) > 0;
        const canPayBlack = (activePlayer.tickets.black ?? 0) > 0;

        const payment: TicketPayment =
          !canPayNormal && canPayBlack
            ? "black"
            : canPayNormal && canPayBlack && Math.random() < 0.3
              ? "black"
              : choice.transport;

        captured = applyMove(activePlayer, choice.stationId, choice.transport, payment);
      }

      if (!captured) {
        handleEndTurn();
      }
    }, AI_TURN_DELAY_MS);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [screen, config, activePlayerIndex, isHumanTurn, map, winner]);

  // Sauvegarde automatique de la partie en cours, à chaque changement
  // significatif — et nettoyage dès que la partie est terminée (rien à
  // reprendre une fois qu'il y a un vainqueur).
  useEffect(() => {
    if (screen !== "game" || !config) {
      return;
    }

    if (winner) {
      clearSavedGame();
      return;
    }

    saveGame({
      config,
      gamePlayers,
      activePlayerIndex,
      turnNumber,
      misterXLastKnownPosition,
      misterXLastRevealTurn,
      misterXMoveHistory,
      winner,
    });
  }, [
    screen,
    config,
    gamePlayers,
    activePlayerIndex,
    turnNumber,
    misterXLastKnownPosition,
    misterXLastRevealTurn,
    misterXMoveHistory,
    winner,
  ]);

  if (screen === "start") {
    return (
      <StartScreen
        onStart={() => setScreen("setup")}
        onShowRules={() => setScreen("rules")}
        hasSavedGame={loadGame() !== null}
        onResume={resumeGame}
      />
    );
  }

  if (screen === "rules") {
    return <Rules onBack={() => setScreen("start")} />;
  }

  if (screen === "setup") {
    return (
      <GameSetup
        onBack={() => setScreen("start")}
        onConfirm={(selectedConfig) => {
          setConfig(selectedConfig);
          setGamePlayers(createInitialPlayers(maps[selectedConfig.mapId]));
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
        <h1>
          {winner === "detectives"
            ? "Mister X a été démasqué !"
            : "Mister X s'échappe !"}
        </h1>

        <p>
          {winner === "detectives"
            ? captureStation
              ? `Rattrapé à la station ${captureStation.name}.`
              : "Rattrapé par les détectives."
            : "Les détectives n'ont pas réussi à le rattraper."}
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
          misterXMoveHistory={misterXMoveHistory}
        />
      </main>

      <GameFooter
        turnNumber={turnNumber}
        activePlayerName={activePlayer.name}
        isHumanTurn={isHumanTurn}
        mustMove={mustMove}
        onEndTurn={handleManualEndTurn}
      />
    </div>
  );
}

export default App;
