import "./GameMap.css";

import type { GameMap as GameMapData, Station, Connection } from "../../game/types/map";
import type { Player } from "../../game/types/player";
import type { PossibleMove } from "../../game/engine/movement";

interface GameMapProps {
  map: GameMapData;
  players: Player[];
  activePlayer: Player;
  possibleMoves: PossibleMove[];
  onMove: (stationId: number) => void;
}

function GameMap({ map, players, activePlayer, possibleMoves, onMove }: GameMapProps) {
  const getStation = (id: number): Station | undefined => {
    return map.stations.find((station) => station.id === id);
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
  // d'atteindre une station, déjà filtrés par ticket disponible
  // (voir game/engine/movement.ts : getPossibleMoves).
  const getStationTransports = (stationId: number) => {
    return possibleMoves
      .filter((move) => move.stationId === stationId)
      .flatMap((move) => move.transports);
  };

  return (
    <section className="game-map">
      <h2>{map.name}</h2>

      <p className="active-player">
        Tour de : <strong>{activePlayer.name}</strong>
      </p>

      <div className="map-board">
        {/* =====================
            CONNEXIONS
        ====================== */}

        <svg className="connections">
          {map.connections.map((connection, index) => {
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

        {players.map((player) => {
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

        {map.stations.map((station) => {
          const transports = getStationTransports(station.id);

          const isPossibleDestination = transports.length > 0;

          return (
            <button
              onClick={() => {
                if (isPossibleDestination) {
                  onMove(station.id);
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
