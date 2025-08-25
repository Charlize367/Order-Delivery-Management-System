package org.example.Basket;


import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import org.example.Catalog.CatalogRepository;
import org.example.Users.Users;
import org.example.Users.UsersRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;



@Service
public class BasketService {

    private final BasketRepository basketRepository;

    private final UsersRepository usersRepository;

    private final CatalogRepository catalogRepository;

    public BasketService(BasketRepository basketRepository, UsersRepository usersRepository, CatalogRepository catalogRepository) {
        this.basketRepository = basketRepository;
        this.usersRepository = usersRepository;
        this.catalogRepository = catalogRepository;
    }

    public List<Basket> getAllBasket() {
        return basketRepository.findAll();
    }

    public List<Basket> getBasketByUser(Integer userId) {
        Users users = usersRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("User basket not found"));
        return basketRepository.findByCustomer(users);
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

    @Transactional
    public void deleteBasket(Integer userId, Integer catalogId) {
        Basket basket = basketRepository.findByCustomer_UserIdAndCatalog_CatalogId(userId, catalogId).get();
        basketRepository.delete(basket);
    }

    public Basket getBasketById(Integer id) {
        return basketRepository.findById(id)
                .orElseThrow(() -> new IllegalStateException(id + "not found"));
    }
}


