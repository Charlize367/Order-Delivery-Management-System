import React, { useEffect } from "react";
import { useNotifications} from "./NotificationContext";


export default function NotificationHandler() {
  const { addNotification, showToast, fetchHistory } = useNotifications();
  const token = localStorage.getItem("jwtToken");

  useEffect(() => {
   
    
    if (typeof window === "undefined") return;

   
    if (typeof global === "undefined") window.global = window;

   
    const loadStomp = async () => {

      await fetchHistory(true);

      const SockJS = (await import("sockjs-client")).default;
      const { Client } = await import("@stomp/stompjs");

      const userId = localStorage.getItem("user_ID");
      if (!userId) {
        console.warn("No userId in localStorage");
        return;
      }

      console.log("Connecting WebSocket for user:", userId);

      const socket = new SockJS("http://localhost:8087/ws", null, { withCredentials: true });

      console.log("SockJS instance:", socket);
      const stompClient = new Client({
        webSocketFactory: () => socket,
        connectHeaders: {
    Authorization: `Bearer ${token}`
  },
        reconnectDelay: 5000,
        debug: (str) => console.log("STOMP:", str),
        onConnect: () => {
          console.log("Connected to WebSocket");
          stompClient.subscribe("/user/queue/notifications", (message) => {
            console.log("NOTIFICATION RECEIVED:", message.body);
            const data = JSON.parse(message.body);
            addNotification(data);
            showToast(data);
          });
        },
        onStompError: (frame) => {
          console.error(
            "Broker reported error: " + frame.headers["message"]
          );
          console.error("Additional details: " + frame.body);
        },
      });

      stompClient.activate();
    };

    loadStomp();
  }, [fetchHistory, addNotification, token]);

  return null;
}