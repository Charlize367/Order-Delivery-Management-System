package org.example.Ratings;

import org.example.Catalog.Catalog;
import org.example.Users.Users;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface RatingRepository extends JpaRepository<Rating, Long> {

    Page<Rating> findByCatalog(Catalog catalog, Pageable pageable);

    Optional<Rating> findByUserAndCatalog(Users user, Catalog catalog);

    boolean existsByUserAndCatalog(Users user, Catalog catalog);
}