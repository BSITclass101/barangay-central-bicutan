import { useEffect, useRef } from "react";

// =====================================================
// REALTIME UPDATES HOOK (SSE)
// =====================================================
const SSE_URL = "http://localhost/barangay-api/api/events.php";

export const useRealtimeUpdates = (callback) => {
  const eventSourceRef = useRef(null);
  const callbackRef = useRef(callback);

  // Update callback ref
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  useEffect(() => {
    // =================================================
    // CONNECT TO SSE
    // =================================================
    const connect = () => {
      try {
        const eventSource = new EventSource(SSE_URL);
        eventSourceRef.current = eventSource;

        // =================================================
        // CONNECTED
        // =================================================
        eventSource.addEventListener("connected", (event) => {
          console.log("✅ SSE Connected:", event.data);
        });

        // =================================================
        // UPDATE EVENT
        // =================================================
        eventSource.addEventListener("update", (event) => {
          try {
            const data = JSON.parse(event.data);
            console.log("🔔 SSE Update received:", data);

            if (callbackRef.current) {
              callbackRef.current(data);
            }
          } catch (error) {
            console.error("Failed to parse SSE event:", error);
          }
        });

        // =================================================
        // ERROR HANDLING
        // =================================================
        eventSource.onerror = (error) => {
          console.warn("⚠️ SSE connection error. Reconnecting...", error);

          // Close current connection
          eventSource.close();
          eventSourceRef.current = null;

          // Reconnect after 3 seconds
          setTimeout(connect, 3000);
        };
      } catch (error) {
        console.error("SSE connection failed:", error);

        // Retry after 5 seconds
        setTimeout(connect, 5000);
      }
    };

    connect();

    // =================================================
    // CLEANUP
    // =================================================
    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }
    };
  }, []);

  return eventSourceRef.current;
};

export default useRealtimeUpdates;