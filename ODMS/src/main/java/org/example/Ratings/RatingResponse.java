package org.example.Ratings;

import java.time.Instant;

public record RatingResponse(
        Long ratingId,
        Long catalogId,
        Long userId,
        Integer rating,
        String comment,
        Instant createdAt,
        Instant updatedAt
) {}
