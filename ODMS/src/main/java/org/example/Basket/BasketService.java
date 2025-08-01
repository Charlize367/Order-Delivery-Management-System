package org.example.Basket;


import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class BasketService {

    private final BasketRepository basketRepository;

    public BasketService(BasketRepository basketRepository) {
        this.basketRepository = basketRepository;
    }

    public List<Basket> getAllBasket() {
        return basketRepository.findAll();
    }

    public void addBasket(Basket basket) {
        basketRepository.save(basket);
    }


    public Basket updateBasket(Basket basket, Integer id) {
        Optional<Basket> baskets = basketRepository.findById(id);
        if (baskets.isPresent()) {
            basketRepository.save(basket);
        }
        else {
            return null;
        }
        return basket;
    }

    public void deleteBasket(Basket basket, Integer id) {
        Optional<Basket> baskets = basketRepository.findById(id);
        if (baskets.isPresent()) {
            basketRepository.delete(basket);
        }
        else {
            return;
        }
    }

    public Basket getBasketById(Integer id) {
        return basketRepository.findById(id)
                .orElseThrow(() -> new IllegalStateException(id + "not found"));
    }
}


