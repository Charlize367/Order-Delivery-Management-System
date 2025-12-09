package org.example.Basket;


import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import org.example.Catalog.Catalog;
import org.example.Catalog.CatalogRepository;
import org.example.Users.Users;
import org.example.Users.UsersRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class BasketService {

    @Autowired
    private BasketRepository basketRepository;

    @Autowired
    private UsersRepository usersRepository;

    @Autowired
    private CatalogRepository catalogRepository;



    public List<Basket> getAllBasket() {
        return basketRepository.findAll();
    }

    public List<Basket> getBasketByUser(Long userId) {
        Users users = usersRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("User basket not found"));
        return basketRepository.findByCustomer(users);
    }

    public Basket addBasket(Long userId, Long catalogId, Basket basket) {

        Optional<Basket>  existingBasket = basketRepository.findByCustomer_UserIdAndCatalog_CatalogId(userId, catalogId);

        Catalog catalog = catalogRepository.findById(catalogId)
                .orElseThrow(() -> new EntityNotFoundException("Catalog not found"));
        Basket baskets;
        if (existingBasket.isPresent()) {
            baskets = existingBasket.get();
            baskets.setQuantity(baskets.getQuantity() + basket.getQuantity());
            baskets.setSubtotal(existingBasket.get().getSubtotal() + catalog.getCatalog_price() );


        } else {
            Users users = usersRepository.findById(userId)
                    .orElseThrow(() -> new EntityNotFoundException("User not found"));

            baskets = new Basket();
            baskets.setCustomer(users);
            baskets.setCatalog(catalog);
            baskets.setQuantity(basket.getQuantity());
            baskets.setSubtotal(catalog.getCatalog_price() * baskets.getQuantity());
        }

        return basketRepository.save(baskets);

    }

    public Basket updateBasketQuantity(Long basketId, Integer quantity) {
        Basket basket = basketRepository.findById(basketId)
                .orElseThrow(() -> new RuntimeException("Basket not found with id: " + basketId));
        basket.setQuantity(quantity);
        basket.setSubtotal(quantity * basket.getCatalog().getCatalog_price());
        return basketRepository.save(basket);
    }

    @Transactional
    public void deleteBasket(Long userId, Long catalogId) {
        Basket basket = basketRepository.findByCustomer_UserIdAndCatalog_CatalogId(userId, catalogId)
                .orElseThrow(() -> new RuntimeException("User ID and Catalog ID not found: " + userId + ", " + catalogId));
        basketRepository.delete(basket);
    }

    public Basket getBasketById(Long id) {
        return basketRepository.findById(id)
                .orElseThrow(() -> new IllegalStateException(id + "not found"));
    }
}


