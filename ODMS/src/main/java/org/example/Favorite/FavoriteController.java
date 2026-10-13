package org.example.Favorite;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("api/v1/favorites")
public class FavoriteController {

    private final FavoriteService favoriteService;

    public FavoriteController(FavoriteService favoriteService) {
        this.favoriteService = favoriteService;
    }

    @PostMapping("/catalog/{catalogId}")
    public ResponseEntity<Boolean> addFavorite(
            @PathVariable Long catalogId,
            @RequestParam Long userId
    ) {

        return ResponseEntity.ok(
                favoriteService.addFavorite(catalogId, userId)
        );
    }

    @DeleteMapping("/catalog/{catalogId}")
    public ResponseEntity<Void> removeFavorite(
            @PathVariable Long catalogId,
            @RequestParam Long userId
    ) {

        favoriteService.removeFavorite(catalogId, userId);

        return ResponseEntity.noContent().build();
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<FavoriteResponse>> getUserFavorites(
            @PathVariable Long userId
    ) {

        return ResponseEntity.ok(
                favoriteService.getUserFavorites(userId)
        );
    }

    @GetMapping("/catalog/{catalogId}")
    public ResponseEntity<Boolean> isFavorite(
            @PathVariable Long catalogId,
            @RequestParam Long userId
    ) {

        return ResponseEntity.ok(
                favoriteService.isFavorite(catalogId, userId)
        );
    }
}