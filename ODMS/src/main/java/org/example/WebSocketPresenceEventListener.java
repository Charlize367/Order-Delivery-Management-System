package org.example;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.event.EventListener;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.messaging.SessionConnectedEvent;
import org.springframework.web.socket.messaging.SessionDisconnectEvent;

import java.security.Principal;

@Component
public class WebSocketPresenceEventListener {

    private static final Logger logger = LoggerFactory.getLogger(WebSocketPresenceEventListener.class);

    @EventListener
    public void handleWebSocketConnectListener(SessionConnectedEvent event) {
        StompHeaderAccessor headerAccessor = StompHeaderAccessor.wrap(event.getMessage());

        // This is the Principal you set in your ChannelInterceptor
        Principal user = headerAccessor.getUser();

        if (user != null) {
            String userId = user.getName();
            String sessionId = headerAccessor.getSessionId();

            logger.info("✅ WebSocket Ready: User [{}] is connected on session [{}]", userId, sessionId);
            logger.debug("User is now reachable at /user/queue/specific");
        } else {
            logger.warn("❌ WebSocket connected, but no Principal found. Specific notifications will fail.");
        }
    }

    @EventListener
    public void handleWebSocketDisconnectListener(SessionDisconnectEvent event) {
        StompHeaderAccessor headerAccessor = StompHeaderAccessor.wrap(event.getMessage());
        Principal user = headerAccessor.getUser();

        if (user != null) {
            logger.info("User [{}] has disconnected.", user.getName());
        }
    }
}
