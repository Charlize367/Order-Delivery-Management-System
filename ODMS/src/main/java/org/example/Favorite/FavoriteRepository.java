package org.example.Favorite;

import org.example.Catalog.Catalog;
import org.example.Users.Users;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface FavoriteRepository extends JpaRepository<Favorite, Long> {

    boolean existsByUserAndCatalog(Users user, Catalog catalog);

    Optional<Favorite> findByUserAndCatalog(Users user, Catalog catalog);

    List<Favorite> findByUserOrderByCreatedAtDesc(Users user);
}