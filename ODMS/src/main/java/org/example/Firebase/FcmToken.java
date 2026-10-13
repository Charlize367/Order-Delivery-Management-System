
package org.example.Firebase;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.LocalDateTime;

@Entity
public class FcmToken {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long tokenId;

    @NotNull(message = "User ID is required")
    private Long userId;

    @NotBlank(message = "FCM token is required")
    @Size(max = 500, message = "FCM token must not exceed 500 characters")
    private String token;

    private LocalDateTime createdAt;

    protected FcmToken() {
        // Required by JPA
    }

    public FcmToken(Long tokenId, Long userId, String token, LocalDateTime createdAt) {
        this.tokenId = tokenId;
        this.userId = userId;
        this.token = token;
        this.createdAt = createdAt;
    }

    public Long getTokenId() {
        return tokenId;
    }

    public void setTokenId(Long tokenId) {
        this.tokenId = tokenId;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public String getToken() {
        return token;
    }

    public void setToken(String token) {
        this.token = token;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}

