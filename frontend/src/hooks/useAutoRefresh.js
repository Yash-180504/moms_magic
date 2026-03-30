import { useEffect, useRef } from "react";

const WS_URL = 'wss://momsmagic-production.up.railway.app';

/**
 * Connects to the backend WebSocket and calls `onRefresh` every time
 * the server broadcasts a refresh event (~every 2 seconds).
 *
 * Automatically reconnects if the connection drops.
 */
export function useAutoRefresh(onRefresh) {
  const callbackRef = useRef(onRefresh);
  callbackRef.current = onRefresh; // always call the latest version

  useEffect(() => {
    let ws;
    let reconnectTimer;
    let alive = true;

    function connect() {
      ws = new WebSocket(WS_URL);

      ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data);
          if (msg.type === "refresh") {
            callbackRef.current();
          }
        } catch {
          /* ignore malformed messages */
        }
      };

      ws.onclose = () => {
        if (!alive) return;
        // Reconnect after 3 s if connection drops
        reconnectTimer = setTimeout(connect, 3000);
      };

      ws.onerror = () => ws.close();
    }

    connect();

    return () => {
      alive = false;
      clearTimeout(reconnectTimer);
      ws?.close();
    };
  }, []); // run once — callback always stays fresh via ref
}
