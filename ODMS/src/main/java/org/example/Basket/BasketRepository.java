package org.example.Basket;

import org.example.Basket.Basket;
import org.example.Catalog.Catalog;
import org.example.Category.Category;
import org.example.Users.Users;
import org.example.Users.UsersRepository;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.security.core.userdetails.User;

import java.util.List;
import java.util.Optional;

public interface BasketRepository extends JpaRepository<Basket, Integer> {
    List<Basket> findByCustomer(Users customer);
    Optional<Basket> findByCustomer_UserIdAndCatalog_CatalogId(Integer user_ID, Integer catalog_ID);

}
