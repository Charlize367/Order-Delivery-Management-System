package org.example.Favorite;

import jakarta.persistence.*;
import org.example.Catalog.Catalog;
import org.example.Users.Users;

import java.time.Instant;
import java.util.Objects;

@Entity
public class Favorite {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long favoriteId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private Users user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "catalog_id", nullable = false)
    private Catalog catalog;

    @Column(nullable = false)
    private Instant createdAt;

    public Favorite() {
    }

    public Favorite(
            Long favoriteId,
            Users user,
            Catalog catalog,
            Instant createdAt
    ) {
        this.favoriteId = favoriteId;
        this.user = user;
        this.catalog = catalog;
        this.createdAt = createdAt;
    }

    public Long getFavoriteId() {
        return favoriteId;
    }

    public void setFavoriteId(Long favoriteId) {
        this.favoriteId = favoriteId;
    }

    public Users getUser() {
        return user;
    }

    public void setUser(Users user) {
        this.user = user;
    }

    public Catalog getCatalog() {
        return catalog;
    }

    public void setCatalog(Catalog catalog) {
        this.catalog = catalog;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof Favorite favorite)) return false;
        return Objects.equals(favoriteId, favorite.favoriteId);
    }

    @Override
    public int hashCode() {
        return Objects.hash(favoriteId);
    }
}