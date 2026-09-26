import { useEffect, useRef, useState } from "react";
import "./GameMap.css";

import type { GameMap as GameMapData, Station, TransportType } from "../../game/types/map";
import type { Player, PlayerRole } from "../../game/types/player";
import type { PossibleMove, TicketPayment } from "../../game/engine/movement";
import { getTransportSymbol } from "../../game/ui/transportSymbols";

// Écart, en pixels, entre deux lignes de transport parallèles sur un
// même trajet (ex. taxi + bus + métro entre les deux mêmes stations).
const CONNECTION_LINE_SPACING_PX = 5;

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
  onMove: (stationId: number, transport: TransportType, payment: TicketPayment) => void;
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

  // Mister X, tant qu'il lui reste un ticket noir, peut choisir de payer
  // avec pour cacher aux détectives le transport réellement utilisé —
  // donc, dans ce cas, il y a toujours un choix à faire, même vers une
  // station qui n'a qu'un seul transport.
  const canUseBlackTicket =
    activePlayer.role === "mister-x" &&
    viewerRole === "mister-x" &&
    (activePlayer.tickets.black ?? 0) > 0;

  // Taille réelle (en pixels) du plateau, pour convertir les coordonnées
  // en % des stations en vraies positions et pouvoir calculer un
  // décalage perpendiculaire correct entre lignes parallèles — un calcul
  // fait uniquement en %, sans connaître les dimensions réelles, donnerait
  // des angles faussés dès que le plateau n'est pas parfaitement carré.
  const mapBoardRef = useRef<HTMLDivElement>(null);
  const [boardSize, setBoardSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const element = mapBoardRef.current;

    if (!element) {
      return;
    }

    const updateSize = () => {
      setBoardSize({ width: element.clientWidth, height: element.clientHeight });
    };

    updateSize();

    const observer = new ResizeObserver(updateSize);
    observer.observe(element);

    return () => observer.disconnect();
  }, []);

  const toPixels = (station: Station) => ({
    x: (station.x / 100) * boardSize.width,
    y: (station.y / 100) * boardSize.height,
  });

  const getStation = (id: number): Station | undefined => {
    return map.stations.find((station) => station.id === id);
  };

  // Retourne tous les moyens de transport permettant
  // d'atteindre une station, déjà filtrés par ticket disponible
  // (voir game/engine/movement.ts : getPossibleMoves).
  const getStationTransports = (stationId: number) => {
    return possibleMoves
      .filter((move) => move.stationId === stationId)
      .flatMap((move) => move.transports);
  };

  // Un seul transport possible ET rien à décider en plus (pas de ticket
  // noir à envisager) : on part directement, rien à choisir. Sinon, on
  // ouvre (ou referme, si déjà ouvert) le sélecteur au lieu de partir
  // immédiatement avec le premier transport de la liste.
  const handleStationClick = (stationId: number, transports: TransportType[]) => {
    if (transports.length === 0) {
      return;
    }

    if (transports.length === 1 && !canUseBlackTicket) {
      onMove(stationId, transports[0], transports[0]);
      setPendingStationId(null);
      return;
    }

    setPendingStationId((current) => (current === stationId ? null : stationId));
  };

  const confirmMove = (stationId: number, transport: TransportType, payment: TicketPayment) => {
    onMove(stationId, transport, payment);
    setPendingStationId(null);
  };

  const pendingStation = (() => {
    if (pendingStationId === null) {
      return null;
    }

    const station = getStation(pendingStationId);
    const transports = getStationTransports(pendingStationId);

    if (!station || transports.length === 0) {
      return null;
    }

    if (transports.length <= 1 && !canUseBlackTicket) {
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

      <div
        className={`map-board map-board--${activePlayer.role}`}
        ref={mapBoardRef}
      >
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

            const fromPx = toPixels(from);
            const toPx = toPixels(to);

            const dx = toPx.x - fromPx.x;
            const dy = toPx.y - fromPx.y;
            const length = Math.hypot(dx, dy) || 1;

            // Vecteur unitaire perpendiculaire au trajet : c'est lui qui
            // permet d'écarter les lignes parallèles au lieu qu'elles se
            // superposent exactement (comme sur le vrai plateau).
            const perpX = -dy / length;
            const perpY = dx / length;

            const transportCount = connection.transports.length;

            return (
              <g key={index}>
                {connection.transports.map((transport, transportIndex) => {
                  const offset =
                    (transportIndex - (transportCount - 1) / 2) * CONNECTION_LINE_SPACING_PX;

                  return (
                    <line
                      key={transport}
                      x1={fromPx.x + perpX * offset}
                      y1={fromPx.y + perpY * offset}
                      x2={toPx.x + perpX * offset}
                      y2={toPx.y + perpY * offset}
                      className={`connection connection-${transport}`}
                    />
                  );
                })}
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
          const hasTransportChoice = transports.length > 1 || (isPossibleDestination && canUseBlackTicket);

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
            {pendingStation.transports.map((transport) => {
              const canPayNormal = (activePlayer.tickets[transport] ?? 0) > 0;

              return (
                <div key={transport} className="transport-picker__group">
                  {canPayNormal && (
                    <button
                      type="button"
                      className="transport-picker__option"
                      title={`Payer avec un ticket ${transport}`}
                      onClick={() => confirmMove(pendingStation.stationId, transport, transport)}
                    >
                      {getTransportSymbol(transport)}
                    </button>
                  )}

                  {canUseBlackTicket && (
                    <button
                      type="button"
                      className="transport-picker__option transport-picker__option--black"
                      title={`Payer avec un ticket noir (cache le transport ${transport} aux détectives)`}
                      onClick={() => confirmMove(pendingStation.stationId, transport, "black")}
                    >
                      {getTransportSymbol(transport)}
                      <span className="transport-picker__black-mark">❓</span>
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}

export default GameMap;
