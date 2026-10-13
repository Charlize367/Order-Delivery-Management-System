package org.example.Favorite;

import org.example.Catalog.CatalogResponse;

import java.time.Instant;

public record FavoriteResponse(
        Long favoriteId,
        Long userId,
        CatalogResponse catalog,
        Instant createdAt
) {
}