package org.example.Ratings;

import org.example.Catalog.Catalog;
import org.example.Catalog.CatalogRepository;
import org.example.Users.Users;
import org.example.Users.UsersRepository;
import org.example.PageResponse;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.cache.annotation.Caching;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.time.Instant;

@Service
public class RatingService {

    private final RatingRepository ratingRepository;
    private final CatalogRepository catalogRepository;
    private final UsersRepository usersRepository;
    private final RatingMapper ratingMapper;

    public RatingService(
            RatingRepository ratingRepository,
            CatalogRepository catalogRepository,
            UsersRepository usersRepository,
            RatingMapper ratingMapper
    ) {
        this.ratingRepository = ratingRepository;
        this.catalogRepository = catalogRepository;
        this.usersRepository = usersRepository;
        this.ratingMapper = ratingMapper;
    }

    @Caching(
            evict = {
                    @CacheEvict(value = "ratings", allEntries = true)
            }
    )
    public RatingResponse createRating(
            Long catalogId,
            Long userId,
            RatingRequest request
    ) {

        Catalog catalog = catalogRepository.findById(catalogId)
                .orElseThrow(() ->
                        new RuntimeException("Catalog item not found")
                );

        Users user = usersRepository.findById(userId)
                .orElseThrow(() ->
                        new RuntimeException("User not found")
                );

        if (ratingRepository.existsByUserAndCatalog(user, catalog)) {
            throw new RuntimeException(
                    "You have already rated this product"
            );
        }

        Rating rating = ratingMapper.toEntity(
                request,
                user,
                catalog
        );

        rating.setCreatedAt(Instant.now());
        rating.setUpdatedAt(Instant.now());

        Rating savedRating = ratingRepository.save(rating);

        return ratingMapper.toResponse(savedRating);
    }

    @Cacheable(
            value = "ratings",
            key = "'catalog_' + #catalogId + '_page_' + #pageable.pageNumber + '_' + #pageable.pageSize + '_' + #pageable.sort.toString()"
    )
    public PageResponse<RatingResponse> getRatingsByCatalog(
            Long catalogId,
            Pageable pageable
    ) {

        Catalog catalog = catalogRepository.findById(catalogId)
                .orElseThrow(() ->
                        new RuntimeException("Catalog item not found")
                );

        Page<Rating> page =
                ratingRepository.findByCatalog(catalog, pageable);

        Page<RatingResponse> mapped =
                page.map(ratingMapper::toResponse);

        return new PageResponse<>(mapped);
    }

    @Caching(
            evict = {
                    @CacheEvict(value = "ratings", allEntries = true)
            }
    )
    public RatingResponse updateRating(
            Long ratingId,
            Long userId,
            RatingRequest request
    ) {

        Rating rating = ratingRepository.findById(ratingId)
                .orElseThrow(() ->
                        new RuntimeException("Rating not found")
                );

        if (!rating.getUser().getUserId().equals(userId)) {
            throw new RuntimeException(
                    "You can only update your own rating"
            );
        }

        rating.setRating(request.rating());
        rating.setComment(request.comment());
        rating.setUpdatedAt(Instant.now());

        Rating updatedRating =
                ratingRepository.save(rating);

        return ratingMapper.toResponse(updatedRating);
    }

    @Caching(
            evict = {
                    @CacheEvict(value = "ratings", allEntries = true)
            }
    )
    public void deleteRating(
            Long ratingId,
            Long userId
    ) {

        Rating rating = ratingRepository.findById(ratingId)
                .orElseThrow(() ->
                        new RuntimeException("Rating not found")
                );

        if (!rating.getUser().getUserId().equals(userId)) {
            throw new RuntimeException(
                    "You can only delete your own rating"
            );
        }

        ratingRepository.delete(rating);
    }
}