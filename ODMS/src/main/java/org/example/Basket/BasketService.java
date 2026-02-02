package org.example.Basket;


import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import org.example.Catalog.Catalog;
import org.example.Catalog.CatalogRepository;
import org.example.Exception.ResourceNotFoundException;
import org.example.Users.Users;
import org.example.Users.UsersRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
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

    @Autowired
    private BasketMapper basketMapper;

    private static final Logger logger = LoggerFactory.getLogger(Basket.class);

    public List<BasketResponse> getAllBasket() {
        logger.info("Displaying all basket");
        return basketRepository.findAll().stream()
                .map(basketMapper::toResponse)
                .toList();
    }

    public Page<BasketResponse> getBasket(Pageable pageable) {

        logger.info("Displaying basket by page");
        return basketRepository.findAll(pageable)
                .map(basketMapper::toResponse);
    }

    public List<BasketResponse> getBasketByUser(Long userId) {
        logger.info("Displaying basket by user");
        Users users = usersRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User basket not found"));
        List<Basket> basket = basketRepository.findByCustomer(users);
        return basketMapper.toListResponse(basket);
    }

    public BasketResponse addBasket(Long userId, Long catalogId, BasketRequest request) {
        logger.info("Attempting to add new basket with catalog: {}", request.getCatalogId());
        Optional<Basket>  existingBasket = basketRepository.findByCustomer_UserIdAndCatalog_CatalogId(userId, catalogId);

        Catalog catalog = catalogRepository.findById(catalogId)
                .orElseThrow(() -> new ResourceNotFoundException("Catalog not found"));

        Basket baskets;
        if (existingBasket.isPresent()) {
            baskets = existingBasket.get();
            baskets.setQuantity(baskets.getQuantity() + request.getQuantity());
            baskets.setSubtotal(existingBasket.get().getSubtotal() + catalog.getCatalog_price() );


        } else {
            Users users = usersRepository.findById(userId)
                    .orElseThrow(() -> new ResourceNotFoundException("User not found"));

            baskets = new Basket();
            baskets.setCustomer(users);
            baskets.setCatalog(catalog);
            baskets.setQuantity(request.getQuantity());
            baskets.setSubtotal(catalog.getCatalog_price() * baskets.getQuantity());
        }

        Basket savedBasket = basketRepository.save(baskets);
        logger.info("Successfully added new basket");
        return basketMapper.toResponse(savedBasket);

    }

    public BasketResponse updateBasketQuantity(Long basketId, Integer quantity) {
        logger.info("Updating basket {} quantity with {}", basketId, quantity);
        Basket basket = basketRepository.findById(basketId)
                .orElseThrow(() -> new ResourceNotFoundException("Basket not found with id: " + basketId));
        basket.setQuantity(quantity);
        basket.setSubtotal(quantity * basket.getCatalog().getCatalog_price());
        Basket savedBasket = basketRepository.save(basket);
        logger.info("Successfully updated basket quantity. ID: {}", basketId);
        return basketMapper.toResponse(savedBasket);
    }

    @Transactional
    public void deleteBasket(Long userId, Long catalogId) {
        logger.info("Deleting basket of User ID: {}", userId);
        Basket basket = basketRepository.findByCustomer_UserIdAndCatalog_CatalogId(userId, catalogId)
                .orElseThrow(() -> new ResourceNotFoundException("User ID and Catalog ID not found: " + userId + ", " + catalogId));
        basketRepository.delete(basket);
        logger.info("Successfully deleted basket with User ID: {}", userId);
    }

    @Cacheable("basket")
    public BasketResponse getBasketById(Long id) {
        logger.info("Getting basket with ID: {}", id);
        Basket basket = basketRepository.findById(id)
                .orElseThrow(() -> {
                    return new ResourceNotFoundException("Basket not found.");
                });
        logger.info("Successfully fetched basket with ID: {}", id);
        return basketMapper.toResponse(basket);

    }
}


