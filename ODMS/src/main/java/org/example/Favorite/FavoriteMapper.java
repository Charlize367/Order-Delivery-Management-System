package org.example.Favorite;

import org.example.Catalog.CatalogMapper;
import org.springframework.stereotype.Component;

@Component
public class FavoriteMapper {

    private final CatalogMapper catalogMapper;

    public FavoriteMapper(CatalogMapper catalogMapper) {
        this.catalogMapper = catalogMapper;
    }

    public FavoriteResponse toResponse(Favorite favorite) {
        return new FavoriteResponse(
                favorite.getFavoriteId(),
                favorite.getUser().getUserId(),
                catalogMapper.toResponse(favorite.getCatalog()),
                favorite.getCreatedAt()
        );
    }
}