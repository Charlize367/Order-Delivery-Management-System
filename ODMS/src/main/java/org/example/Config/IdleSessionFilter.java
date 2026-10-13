
package org.example.Config;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.example.LoginSession;
import org.example.LoginSessionRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.time.Instant;

@Component
public class IdleSessionFilter extends OncePerRequestFilter {

    private final LoginSessionRepository sessionRepository;
    private final long idleTimeoutMs;

    public IdleSessionFilter(
            LoginSessionRepository sessionRepository,
            @Value("${app.session.idle-timeout-ms}") long idleTimeoutMs
    ) {
        this.sessionRepository = sessionRepository;
        this.idleTimeoutMs = idleTimeoutMs;
    }

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain
    ) throws ServletException, IOException {

        String header = request.getHeader(HttpHeaders.AUTHORIZATION);

        // Let Spring Security handle missing or malformed bearer tokens.
        if (header == null || !header.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }

        String token = header.substring(7);

        try {
            // The JWT has already been authenticated by Spring's
            // bearer-token filter before this filter runs.
            // This filter is registered after that filter below.
            io.jsonwebtoken.Claims claims =
                    io.jsonwebtoken.Jwts.parserBuilder()
                            .build()
                            .parseClaimsJwt(token)
                            .getBody();

            String sessionId = claims.getId();

            if (sessionId == null) {
                reject(response);
                return;
            }

            var optionalSession =
                    sessionRepository.findBySessionId(sessionId);

            if (optionalSession.isEmpty()) {
                reject(response);
                return;
            }

            LoginSession session = optionalSession.get();
            Instant now = Instant.now();

            if (session.isRevoked()
                    || !session.getLastActivityAt()
                    .isAfter(now.minusMillis(idleTimeoutMs))) {
                reject(response);
                return;
            }

            session.setLastActivityAt(now);
            sessionRepository.save(session);

            filterChain.doFilter(request, response);

        } catch (Exception ex) {
            reject(response);
        }
    }

    private void reject(HttpServletResponse response) throws IOException {
        response.setStatus(HttpStatus.UNAUTHORIZED.value());
        response.setContentType("application/json");
        response.getWriter().write(
                "{\"error\":\"Session expired. Please log in again.\"}"
        );
    }
}