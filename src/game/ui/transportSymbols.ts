import type { TransportType } from "../types/map";

export function getTransportSymbol(transport: TransportType): string {
  switch (transport) {
    case "taxi":
      return "🚕";

    case "bus":
      return "🚌";

    case "metro":
      return "🚇";
  }
}
