
import React, { useEffect } from "react";

export default function GetDriverLocation({ id }) {
  useEffect(() => {
    let watchId;
    let client;

    const startLocationTracking = async () => {
      if (!id) {
        console.error("No driver ID provided.");
        return;
      }

      if (!navigator.geolocation) {
        console.error("Geolocation is not supported by this browser.");
        return;
      }

      try {
        const SockJS = (await import("sockjs-client")).default;
        const { Client } = await import("@stomp/stompjs");

        const token = localStorage.getItem("jwtToken");

        if (!token) {
          console.error("No JWT token found.");
          return;
        }

        const socket = new SockJS("http://localhost:8087/ws");

        client = new Client({
          webSocketFactory: () => socket,

          connectHeaders: {
            Authorization: `Bearer ${token}`,
          },

          debug: (str) => console.log("STOMP:", str),

          onConnect: () => {
            console.log("LOCATION TRACKING: CONNECTED");

            // Start watching the driver's location
            watchId = navigator.geolocation.watchPosition(
              (position) => {
                const { latitude, longitude, accuracy } = position.coords;

                console.log("DRIVER GPS:", {
                  latitude,
                  longitude,
                  accuracy,
                });

                // Only send when the WebSocket is connected
                if (client && client.connected) {
                  client.publish({
                    destination: "/app/driver/location",
                    body: JSON.stringify({
                      latitude,
                      longitude,
                    }),
                  });

                  console.log("DRIVER LOCATION SENT");
                }
              },

              (error) => {
                console.error("Error getting driver location:", error);

                switch (error.code) {
                  case error.PERMISSION_DENIED:
                    console.error("Location permission was denied.");
                    break;

                  case error.POSITION_UNAVAILABLE:
                    console.error(
                      "Location is currently unavailable. Trying again..."
                    );
                    break;

                  case error.TIMEOUT:
                    console.error(
                      "Location request timed out. Trying again..."
                    );
                    break;

                  default:
                    console.error("Unknown location error.");
                }
              },

              {
                    enableHighAccuracy: false, // Allows faster, cell/Wi-Fi rough estimates
                    timeout: 10000,            // Gives the device 10 seconds to resolve
                    maximumAge: 60000   
              }
            );
          },

          onStompError: (frame) => {
            console.error("LOCATION TRACKING ERROR:", frame);
          },

          onWebSocketError: (error) => {
            console.error("WEBSOCKET ERROR:", error);
          },
        });

        client.activate();
      } catch (error) {
        console.error("Failed to start location tracking:", error);
      }
    };

    startLocationTracking();

    // Cleanup when driver leaves the page/component
    return () => {
      console.log("STOPPING LOCATION TRACKING");

      if (watchId !== undefined) {
        navigator.geolocation.clearWatch(watchId);
      }

      if (client) {
        client.deactivate();
      }
    };
  }, [id]);

  return null;
}

