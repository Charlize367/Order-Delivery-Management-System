package org.example.Ratings;

import jakarta.persistence.*;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import org.example.Catalog.Catalog;
import org.example.Users.Users;

import java.time.Instant;
import java.util.Objects;

@Entity
public class Rating {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long ratingId;

    @ManyToOne
    private Catalog catalog;

    @ManyToOne
    private Users user;

    @Min(1)
    @Max(5)
    private Integer rating;

    private String comment;

    private Instant createdAt;

    private Instant updatedAt;

    public Rating(Long ratingId, Catalog catalog, Users user, Integer rating,
                  String comment, Instant createdAt, Instant updatedAt) {
        this.ratingId = ratingId;
        this.catalog = catalog;
        this.user = user;
        this.rating = rating;
        this.comment = comment;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    public Rating() {}

    public Long getRatingId() {
        return ratingId;
    }

    public void setRatingId(Long ratingId) {
        this.ratingId = ratingId;
    }

    public Catalog getCatalog() {
        return catalog;
    }

    public void setCatalog(Catalog catalog) {
        this.catalog = catalog;
    }

    public Users getUser() {
        return user;
    }

    public void setUser(Users user) {
        this.user = user;
    }

    public Integer getRating() {
        return rating;
    }

    public void setRating(Integer rating) {
        this.rating = rating;
    }

    public String getComment() {
        return comment;
    }

    public void setComment(String comment) {
        this.comment = comment;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(Instant updatedAt) {
        this.updatedAt = updatedAt;
    }

    @Override
    public boolean equals(Object o) {
        if (o == null || getClass() != o.getClass()) return false;
        Rating rating1 = (Rating) o;
        return Objects.equals(ratingId, rating1.ratingId)
                && Objects.equals(catalog, rating1.catalog)
                && Objects.equals(user, rating1.user)
                && Objects.equals(rating, rating1.rating)
                && Objects.equals(comment, rating1.comment)
                && Objects.equals(createdAt, rating1.createdAt)
                && Objects.equals(updatedAt, rating1.updatedAt);
    }

    @Override
    public int hashCode() {
        return Objects.hash(
                ratingId,
                catalog,
                user,
                rating,
                comment,
                createdAt,
                updatedAt
        );
    }
}