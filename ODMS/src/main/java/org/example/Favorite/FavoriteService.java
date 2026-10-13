package org.example.Favorite;

import org.example.Catalog.Catalog;
import org.example.Catalog.CatalogRepository;
import org.example.Users.Users;
import org.example.Users.UsersRepository;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.CachePut;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.cache.annotation.Caching;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;

@Service
public class FavoriteService {

    private final FavoriteRepository favoriteRepository;
    private final CatalogRepository catalogRepository;
    private final UsersRepository usersRepository;
    private final FavoriteMapper favoriteMapper;

    public FavoriteService(
            FavoriteRepository favoriteRepository,
            CatalogRepository catalogRepository,
            UsersRepository usersRepository,
            FavoriteMapper favoriteMapper
    ) {
        this.favoriteRepository = favoriteRepository;
        this.catalogRepository = catalogRepository;
        this.usersRepository = usersRepository;
        this.favoriteMapper = favoriteMapper;
    }

    @Caching(
            put = {
                    @CachePut(
                            value = "favoriteStatus",
                            key = "'user_'+#userId+'_catalog_'+#catalogId"
                    )
            },
            evict = {
                    @CacheEvict(
                            value = "favorites",
                            key = "'user_'+#userId"
                    )
            }
    )
    @Transactional
    public boolean addFavorite(Long catalogId, Long userId) {

        Catalog catalog = catalogRepository.findById(catalogId)
                .orElseThrow(() ->
                        new RuntimeException("Catalog item not found"));

        Users user = usersRepository.findById(userId)
                .orElseThrow(() ->
                        new RuntimeException("User not found"));

        if (favoriteRepository.existsByUserAndCatalog(user, catalog)) {
            throw new RuntimeException(
                    "This item is already in your favorites"
            );
        }

        Favorite favorite = new Favorite();

        favorite.setUser(user);
        favorite.setCatalog(catalog);
        favorite.setCreatedAt(Instant.now());

        favoriteRepository.save(favorite);

        return true;
    }


    @Caching(evict = {
            @CacheEvict(
                    value = "favorites",
                    key = "'user_'+#userId"
            ),
            @CacheEvict(
                    value = "favoriteStatus",
                    key = "'user_'+#userId+'_catalog_'+#catalogId"
            )
    })
    @Transactional
    public void removeFavorite(Long catalogId, Long userId) {

        Catalog catalog = catalogRepository.findById(catalogId)
                .orElseThrow(() ->
                        new RuntimeException("Catalog item not found"));

        Users user = usersRepository.findById(userId)
                .orElseThrow(() ->
                        new RuntimeException("User not found"));

        Favorite favorite = favoriteRepository
                .findByUserAndCatalog(user, catalog)
                .orElseThrow(() ->
                        new RuntimeException("Favorite not found"));

        favoriteRepository.delete(favorite);
    }


    @Cacheable(
            value = "favorites",
            key = "'user_'+#userId"
    )
    @Transactional(readOnly = true)
    public List<FavoriteResponse> getUserFavorites(Long userId) {

        Users user = usersRepository.findById(userId)
                .orElseThrow(() ->
                        new RuntimeException("User not found"));

        return favoriteRepository
                .findByUserOrderByCreatedAtDesc(user)
                .stream()
                .map(favoriteMapper::toResponse)
                .toList();
    }


    @Cacheable(
            value = "favoriteStatus",
            key = "'user_'+#userId+'_catalog_'+#catalogId"
    )
    @Transactional(readOnly = true)
    public boolean isFavorite(Long catalogId, Long userId) {

        Catalog catalog = catalogRepository.findById(catalogId)
                .orElseThrow(() ->
                        new RuntimeException("Catalog item not found"));

        Users user = usersRepository.findById(userId)
                .orElseThrow(() ->
                        new RuntimeException("User not found"));

        return favoriteRepository.existsByUserAndCatalog(user, catalog);
    }
}