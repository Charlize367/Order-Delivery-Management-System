package org.example.Basket;

import org.example.Basket.Basket;
import org.springframework.data.jpa.repository.JpaRepository;
public interface BasketRepository extends JpaRepository<Basket, Integer> {
}
