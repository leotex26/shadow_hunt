import "./GameMap.css";

import { bellevue } from "../../game/maps/bellevue";
import { players } from "../../game/players";
import { getPossibleMoves } from "../../game/engine/movement";

import type {
  Station,
  Connection,
} from "../../game/types/map";

function GameMap() {
  const getStation = (id: number): Station | undefined => {
    return bellevue.stations.find(
      (station) => station.id === id
    );
  };

  // Pour le moment, on sélectionne automatiquement
  // le premier joueur : Détective 1.
  const activePlayer = players[0];

  // On récupère tous les déplacements possibles.
  const possibleMoves = getPossibleMoves(
    activePlayer,
    bellevue
  );

  const getTransportSymbol = (
    transport: Connection["transport"]
  ) => {
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
      .map((move) => move.transport);
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
          {bellevue.connections.map(
            (connection, index) => {
              const from = getStation(connection.from);
              const to = getStation(connection.to);

              if (!from || !to) {
                return null;
              }

              const centerX =
                (from.x + to.x) / 2;

              const centerY =
                (from.y + to.y) / 2;

              return (
                <g key={index}>
                  <line
                    x1={`${from.x}%`}
                    y1={`${from.y}%`}
                    x2={`${to.x}%`}
                    y2={`${to.y}%`}
                    className={
                      `connection connection-${connection.transport}`
                    }
                  />

                  <text
                    x={`${centerX}%`}
                    y={`${centerY}%`}
                    className="transport-symbol"
                  >
                    {getTransportSymbol(
                      connection.transport
                    )}
                  </text>
                </g>
              );
            }
          )}
        </svg>

        {/* =====================
            JOUEURS
        ====================== */}

        {players.map((player) => {
          const station = getStation(
            player.position
          );

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
          const transports =
            getStationTransports(station.id);

          const isPossibleDestination =
            transports.length > 0;

          return (
            <button
              key={station.id}
              className={`
                station
                ${
                  isPossibleDestination
                    ? "station-possible"
                    : ""
                }
              `}
              style={{
                left: `${station.x}%`,
                top: `${station.y}%`,
              }}
            >
              <span className="station-number">
                {station.id}
              </span>

              <span className="station-name">
                {station.name}
              </span>

              {/* Affichage du transport disponible */}
              {isPossibleDestination && (
                <span className="possible-transports">
                  {transports.map(
                    (transport, index) => (
                      <span key={index}>
                        {getTransportSymbol(
                          transport
                        )}
                      </span>
                    )
                  )}
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