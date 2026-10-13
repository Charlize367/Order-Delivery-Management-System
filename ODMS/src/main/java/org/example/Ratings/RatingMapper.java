package org.example.Ratings;

import org.example.Catalog.Catalog;
import org.example.Orders.Orders;
import org.example.Users.Users;
import org.springframework.stereotype.Component;

@Component
public class RatingMapper {

    public Rating toEntity(
            RatingRequest request,
            Users user,
            Catalog catalog
    ) {
        Rating rating = new Rating();

        rating.setUser(user);
        rating.setCatalog(catalog);
        rating.setRating(request.rating());
        rating.setComment(request.comment());

        return rating;
    }

    public RatingResponse toResponse(Rating rating) {

        return new RatingResponse(
                rating.getRatingId(),
                rating.getCatalog().getCatalogId(),
                rating.getUser().getUserId(),
                rating.getRating(),
                rating.getComment(),
                rating.getCreatedAt(),
                rating.getUpdatedAt()
        );
    }
}