import { useEffect, useState } from "react";
import "./GameMap.css";

import type { GameMap as GameMapData, Station, TransportType } from "../../game/types/map";
import type { Player, PlayerRole } from "../../game/types/player";
import type { PossibleMove } from "../../game/engine/movement";

interface GameMapProps {
  map: GameMapData;
  players: Player[];
  activePlayer: Player;
  possibleMoves: PossibleMove[];
  // Rôle joué par l'humain : détermine si Mister X est visible sur la carte.
  viewerRole: PlayerRole;
  // Dernière position de Mister X révélée aux détectives (null tant
  // qu'aucune révélation n'a encore eu lieu).
  misterXLastKnownPosition: number | null;
  onMove: (stationId: number, transport: TransportType) => void;
}

function GameMap({
  map,
  players,
  activePlayer,
  possibleMoves,
  viewerRole,
  misterXLastKnownPosition,
  onMove,
}: GameMapProps) {
  // Station pour laquelle on attend que le joueur choisisse son
  // transport (uniquement quand plusieurs sont disponibles).
  const [pendingStationId, setPendingStationId] = useState<number | null>(null);

  // On ferme le sélecteur ouvert dès que le tour change, pour éviter
  // qu'il reste affiché par erreur au tour suivant.
  useEffect(() => {
    setPendingStationId(null);
  }, [activePlayer.id]);

  const getStation = (id: number): Station | undefined => {
    return map.stations.find((station) => station.id === id);
  };

  const getTransportSymbol = (transport: TransportType) => {
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

  // Un seul transport possible : on part directement, rien à choisir.
  // Plusieurs : on ouvre (ou referme, si déjà ouvert) le sélecteur au
  // lieu de partir immédiatement avec le premier de la liste.
  const handleStationClick = (stationId: number, transports: TransportType[]) => {
    if (transports.length === 0) {
      return;
    }

    if (transports.length === 1) {
      onMove(stationId, transports[0]);
      setPendingStationId(null);
      return;
    }

    setPendingStationId((current) => (current === stationId ? null : stationId));
  };

  const confirmMove = (stationId: number, transport: TransportType) => {
    onMove(stationId, transport);
    setPendingStationId(null);
  };

  const pendingStation = (() => {
    if (pendingStationId === null) {
      return null;
    }

    const station = getStation(pendingStationId);
    const transports = getStationTransports(pendingStationId);

    if (!station || transports.length <= 1) {
      return null;
    }

    return { stationId: pendingStationId, x: station.x, y: station.y, transports };
  })();

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

          // Mister X reste caché, sauf pour le joueur qui l'incarne.
          if (player.role === "mister-x" && viewerRole !== "mister-x") {
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
              {player.role === "mister-x" ? "🎩" : "👮"}
            </div>
          );
        })}

        {/* =====================
            DERNIÈRE POSITION CONNUE DE MISTER X
            (détectives uniquement — reste affichée jusqu'à la
            prochaine révélation)
        ====================== */}

        {viewerRole !== "mister-x" &&
          misterXLastKnownPosition !== null &&
          (() => {
            const station = getStation(misterXLastKnownPosition);

            if (!station) {
              return null;
            }

            return (
              <div
                className="player-token player-token-last-known"
                style={{
                  left: `${station.x}%`,
                  top: `${station.y}%`,
                }}
                title="Dernière position connue de Mister X"
              >
                🎩
              </div>
            );
          })()}

        {/* =====================
            STATIONS
        ====================== */}

        {map.stations.map((station) => {
          const transports = getStationTransports(station.id);

          const isPossibleDestination = transports.length > 0;
          const hasTransportChoice = transports.length > 1;

          return (
            <button
              onClick={() => handleStationClick(station.id, transports)}
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

              {/* Un seul transport possible : pas de choix à faire,
                  on l'affiche juste à titre indicatif. */}
              {isPossibleDestination && !hasTransportChoice && (
                <span className="possible-transports">
                  <span>{getTransportSymbol(transports[0])}</span>
                </span>
              )}

              {/* Plusieurs transports possibles : on l'indique, le
                  choix se fait via le sélecteur au clic. */}
              {isPossibleDestination && hasTransportChoice && (
                <span className="possible-transports possible-transports--choice">
                  {transports.map((transport) => (
                    <span key={transport}>{getTransportSymbol(transport)}</span>
                  ))}
                </span>
              )}
            </button>
          );
        })}

        {/* =====================
            SÉLECTEUR DE TRANSPORT
            (en dehors des boutons de station : un <button> ne peut
            pas contenir d'autres boutons)
        ====================== */}

        {pendingStation && (
          <div
            className="transport-picker"
            style={{
              left: `${pendingStation.x}%`,
              top: `${pendingStation.y}%`,
            }}
          >
            {pendingStation.transports.map((transport) => (
              <button
                key={transport}
                type="button"
                className="transport-picker__option"
                onClick={() => confirmMove(pendingStation.stationId, transport)}
              >
                {getTransportSymbol(transport)}
              </button>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

export default GameMap;
