package org.example.Config;


import org.example.CustomUserDetails;
import org.example.CustomUserDetailsService;
import org.example.TokenService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.config.ChannelRegistration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.messaging.support.MessageHeaderAccessor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.authorization.AuthorizationDecision;
import org.springframework.security.authorization.AuthorizationManager;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;
import org.springframework.web.socket.config.annotation.WebSocketTransportRegistration;

@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    @Value("${frontend.url}")
    private String url;

    @Autowired
    CustomUserDetailsService userDetailsService;

    @Autowired
    private TokenService tokenService;

    @Bean
    public AuthorizationManager<Message<?>> messageAuthorizationManager() {
        return (authentication, object) -> new AuthorizationDecision(true);
    }

    @Override
    public void configureMessageBroker(MessageBrokerRegistry config) {
        config.enableSimpleBroker("/queue", "/topic");
        config.setApplicationDestinationPrefixes("/app");
        config.setUserDestinationPrefix("/user");
    }

    @Override
    public void configureWebSocketTransport(WebSocketTransportRegistration registration) {
        registration.setMessageSizeLimit(128 * 1024); // 128 KB
        registration.setSendBufferSizeLimit(512 * 1024); // 512 KB
        registration.setSendTimeLimit(20000); // 20 seconds
    }

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        registry.addEndpoint("/ws")
                .setAllowedOrigins(
                        "http://localhost:5173",
                        "http://localhost:5174",
                        "https://order-delivery-management-system.vercel.app",
                        url
                )
                .withSockJS();
    }

    @Override
    public void configureClientInboundChannel(ChannelRegistration registration) {
        System.out.println("!!!! ATTEMPTING TO REGISTER INTERCEPTOR !!!!");
        registration.interceptors(new ChannelInterceptor() {

            @Override
            public Message<?> preSend(Message<?> message, MessageChannel channel) {
                System.out.println(">>> Channel Activity: " + message.getHeaders());

                StompHeaderAccessor accessor =
                        MessageHeaderAccessor.getAccessor(message, StompHeaderAccessor.class);

                if (accessor != null) {
                    System.out.println("STOMP frame: " + accessor.getCommand());
                    System.out.println("Native headers: " + accessor.toNativeHeaderMap());
                }

                if (StompCommand.CONNECT.equals(accessor.getCommand())) {
                    try {
                        String authHeader = accessor.getFirstNativeHeader("Authorization");
                        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                            System.out.println("Missing or invalid Authorization header");
                            return null;
                        }

                        String token = authHeader.substring(7);
                        String username = tokenService.extractUsername(token);

                        CustomUserDetails userDetails = userDetailsService.loadUserById(Long.valueOf(username));
                        Long userId = userDetails.getId();

                        UsernamePasswordAuthenticationToken authToken =
                                new UsernamePasswordAuthenticationToken(
                                        userId.toString(), null, userDetails.getAuthorities());

                        accessor.setUser(authToken);

                        System.out.println("WebSocket principal set: " + accessor.getUser().getName());

                    } catch (Exception e) {
                        e.printStackTrace();
                        return null; // prevent channel crash
                    }
                }

                return message;
            }

        });
    }




}
