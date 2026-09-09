import "./GameMap.css";

import { bellevue } from "../../game/maps/bellevue";
import { players } from "../../game/players";
import { useState } from "react";

import type { Station, Connection } from "../../game/types/map";

import { getPossibleMoves, movePlayer } from "../../game/engine/movement";

function GameMap() {
  const getStation = (id: number): Station | undefined => {
    return bellevue.stations.find((station) => station.id === id);
  };

  // Pour le moment, on sélectionne automatiquement
  // le premier joueur : Détective 1.
  const [gamePlayers, setGamePlayers] = useState(players);

  const activePlayer = gamePlayers[0];

  // On récupère tous les déplacements possibles.
  const possibleMoves = getPossibleMoves(activePlayer, bellevue);

  const handleMove = (stationId: number) => {
    const movesToStation = possibleMoves.filter(
      (move) => move.stationId === stationId,
    );

    if (movesToStation.length === 0) {
      return;
    }

    // Pour le moment, s'il existe plusieurs moyens
    // de transport vers la même station, on prend le premier.
    const selectedMove = movesToStation[0];

    setGamePlayers((currentPlayers) =>
      currentPlayers.map((player) => {
        if (player.id !== activePlayer.id) {
          return player;
        }

        return movePlayer(
          player,
          selectedMove.stationId,
          selectedMove.transports[0],
        );
      }),
    );
  };

  const getTransportSymbol = (transport: Connection["transports"][number]) => {
    switch (transport) {
      case "taxi":
        return "🚕";

      case "bus":
        return "🚌";

      case "metro":
        return "🚇";
    }
  };

  // Retourne tous les moyens de transport permettant
  // d'atteindre une station.
  const getStationTransports = (stationId: number) => {
    return possibleMoves
      .filter((move) => move.stationId === stationId)
      .flatMap((move) => move.transports);
  };

  return (
    <section className="game-map">
      <h2>{bellevue.name}</h2>

      <p className="active-player">
        Tour de : <strong>{activePlayer.name}</strong>
      </p>

      <div className="map-board">
        {/* =====================
            CONNEXIONS
        ====================== */}

        <svg className="connections">
          {bellevue.connections.map((connection, index) => {
            const from = getStation(connection.from);
            const to = getStation(connection.to);

            if (!from || !to) {
              return null;
            }

            return (
              <g key={index}>
                {connection.transports.map((transport, transportIndex) => (
                  <line
                    key={`${transport}-${transportIndex}`}
                    x1={`${from.x}%`}
                    y1={`${from.y}%`}
                    x2={`${to.x}%`}
                    y2={`${to.y}%`}
                    className={`
                connection
                connection-${transport}
              `}
                  />
                ))}
              </g>
            );
          })}
        </svg>

        {/* =====================
            JOUEURS
        ====================== */}

        {gamePlayers.map((player) => {
          const station = getStation(player.position);

          if (!station) {
            return null;
          }

          // Mister X reste caché.
          if (player.role === "mister-x") {
            return null;
          }

          return (
            <div
              key={player.id}
              className="player-token"
              style={{
                left: `${station.x}%`,
                top: `${station.y}%`,
              }}
            >
              👮
            </div>
          );
        })}

        {/* =====================
            STATIONS
        ====================== */}

        {bellevue.stations.map((station) => {
          const transports = getStationTransports(station.id);

          const isPossibleDestination = transports.length > 0;

          return (
            <button
              onClick={() => {
                if (isPossibleDestination) {
                  handleMove(station.id);
                }
              }}
              disabled={!isPossibleDestination}
              key={station.id}
              className={`
                station
                ${isPossibleDestination ? "station-possible" : ""}
              `}
              style={{
                left: `${station.x}%`,
                top: `${station.y}%`,
              }}
            >
              <span className="station-number">{station.id}</span>

              <span className="station-name">{station.name}</span>

              {/* Affichage du transport disponible */}
              {isPossibleDestination && (
                <span className="possible-transports">
                  {transports.map((transport, index) => (
                    <span key={index}>{getTransportSymbol(transport)}</span>
                  ))}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </section>
  );
}

export default GameMap;
