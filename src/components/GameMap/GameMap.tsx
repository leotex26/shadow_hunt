import "./GameMap.css";

import { bellevue } from "../../game/maps/bellevue";
import type { Station, Connection } from "../../game/types/map";

function GameMap() {
  const getStation = (id: number): Station | undefined => {
    return bellevue.stations.find((station) => station.id === id);
  };

  const getTransportSymbol = (transport: Connection["transport"]) => {
    switch (transport) {
      case "taxi":
        return "🚕";
      case "bus":
        return "🚌";
      case "metro":
        return "🚇";
    }
  };

  return (
    <section className="game-map">
      <h2>{bellevue.name}</h2>

      <div className="map-board">
        {/* Connexions */}
        <svg className="connections">
          {bellevue.connections.map((connection, index) => {
            const from = getStation(connection.from);
            const to = getStation(connection.to);

            if (!from || !to) {
              return null;
            }

            const centerX = (from.x + to.x) / 2;
            const centerY = (from.y + to.y) / 2;

            return (
              <g key={index}>
                <line
                  x1={`${from.x}%`}
                  y1={`${from.y}%`}
                  x2={`${to.x}%`}
                  y2={`${to.y}%`}
                  className={`connection connection-${connection.transport}`}
                />

                <text
                  x={`${centerX}%`}
                  y={`${centerY}%`}
                  className="transport-symbol"
                >
                  {getTransportSymbol(connection.transport)}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Stations */}
        {bellevue.stations.map((station) => (
          <button
            key={station.id}
            className="station"
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
          </button>
        ))}
      </div>
    </section>
  );
}

export default GameMap;