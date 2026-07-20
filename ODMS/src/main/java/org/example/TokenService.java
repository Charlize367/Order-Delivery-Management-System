package org.example;

import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.security.oauth2.jwt.*;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.stream.Collectors;

@Service
public class TokenService {

    @Autowired
    private JwtDecoder jwtDecoder;

    @Autowired
    private JwtEncoder encoder;

    private boolean initialized = false;

    @PostConstruct
    public void init() {
        initialized = true;
        System.out.println("✅ TokenService initialized. Encoder ready: " + encoder.getClass().getName());
    }

    public String extractUsername(String token) {
        Jwt jwt = jwtDecoder.decode(token);
        return jwt.getSubject();
    }

    public String extractUserId(String token) {
        Jwt jwt = jwtDecoder.decode(token);
        return jwt.getClaimAsString("userId");
    }



    public String generateToken(Authentication authentication) {
        if (!initialized) {
            throw new IllegalStateException(
                    "TokenService called too early! Encoder not ready. Wait until Spring context is initialized."
            );
        }

        JwsHeader jwsHeader = JwsHeader.with(MacAlgorithm.HS256).build();

        Instant now = Instant.now();
        String scope = authentication.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .collect(Collectors.joining(" "));

        JwtClaimsSet claims = JwtClaimsSet.builder()
                .issuer("self")
                .issuedAt(now)
                .expiresAt(now.plus(1, ChronoUnit.HOURS))
                .subject(authentication.getName())
                .claim("scope", scope)
                .build();

        System.out.println("⚡ Generating JWT with claims: " + claims.getClaims());

        try {
            String token = encoder.encode(JwtEncoderParameters.from(jwsHeader, claims)).getTokenValue();
            System.out.println("✅ JWT generated successfully: " + token);
            return token;
        } catch (JwtEncodingException e) {
            System.err.println("❌ Failed to encode JWT: " + e.getMessage());
            e.printStackTrace();
            throw e;
        }
    }

    @PostConstruct
    public void checkEncoderType() {
        System.out.println("Encoder class: " + encoder.getClass());

        try {
            java.lang.reflect.Field secretField = encoder.getClass().getDeclaredField("secret");
            secretField.setAccessible(true);
            Object secretValue = secretField.get(encoder);
            System.out.println("HMAC secret backing? " + (secretValue != null));
        } catch (NoSuchFieldException e) {
            System.out.println("No HMAC secret field → probably JWKSource-backed");
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}