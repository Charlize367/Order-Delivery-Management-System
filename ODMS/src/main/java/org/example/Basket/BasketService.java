package org.example.Basket;


import jakarta.transaction.Transactional;
import org.example.Catalog.Catalog;
import org.example.Catalog.CatalogRepository;
import org.example.Exception.ResourceNotFoundException;
import org.example.Users.Users;
import org.example.Users.UsersRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.cache.CacheManager;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.CachePut;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.cache.annotation.Caching;
import org.springframework.context.event.EventListener;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
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

    @Autowired
    private CacheManager cacheManager;


    @EventListener(ApplicationReadyEvent.class)
    @CacheEvict(value = {"basket", "basketItem"}, allEntries = true)
    public void clearCacheOnStartup() {
        logger.info("Application Ready: Internal and External Caches have been nuked to sync with Database.");
    }

    private static final Logger logger = LoggerFactory.getLogger(Basket.class);



    @Cacheable(value = "basket")
    public List<BasketResponse> getAllBasket() {
        logger.info("Displaying all basket");
        return basketRepository.findAll().stream()
                .map(basketMapper::toResponse)
                .toList();
    }

    @Cacheable(value = "basket", key = "'page_'+#pageable.pageNumber+'_'+#pageable.pageSize+'_'+#pageable.sort.toString()")
    public Page<BasketResponse> getBasket(Pageable pageable) {

        logger.info("Displaying basket by page");
        return basketRepository.findAll(pageable)
                .map(basketMapper::toResponse);
    }


    @Cacheable(value = "basketItem", key = "#userId")
    public List<BasketResponse> getBasketByUser(Long userId) {
        logger.info("Displaying basket by user");
        Users users = usersRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User basket not found"));
        List<Basket> basket = basketRepository.findByCustomer(users);
        return basketMapper.toListResponse(basket);
    }



    @Caching(

            evict = {
                    @CacheEvict(value = "basket", allEntries = true)
            }
    )
    @Transactional
    public List<BasketResponse> addTemporaryBasket(List<BasketRequest> request) {
        logger.info("Attempting to add temporary basket");
        List<Basket> baskets = new ArrayList<>();
        for (BasketRequest basketItem : request) {
            logger.info("Processing item -> userId: {}, catalogId: {}, quantity: {}",
                    basketItem.getUserId(),
                    basketItem.getCatalogId(),
                    basketItem.getQuantity());
            if (basketItem.getUserId() == null) {
                throw new IllegalArgumentException("UserId must not be null");
            }

            if (basketItem.getCatalogId() == null) {
                throw new IllegalArgumentException("CatalogId must not be null");
            }
            Optional<Basket> existingBasket = basketRepository.findByCustomer_UserIdAndCatalog_CatalogId(basketItem.getUserId(), basketItem.getCatalogId());

            Catalog catalog = catalogRepository.findById(basketItem.getCatalogId())
                    .orElseThrow(() -> new ResourceNotFoundException("Catalog not found"));

            Basket basket;
            logger.info("Existing basket present? {}",
                    existingBasket.isPresent());
            if (existingBasket.isPresent()) {

                basket = existingBasket.get();
                basket.setQuantity(basket.getQuantity() + basketItem.getQuantity());
                basket.setSubtotal(existingBasket.get().getSubtotal() + catalog.getCatalog_price() );



            } else {
                Users users = usersRepository.findById(basketItem.getUserId())
                        .orElseThrow(() -> new ResourceNotFoundException("User not found"));
                basket = new Basket();
                basket.setCustomer(users);
                basket.setCatalog(catalog);
                basket.setQuantity(basketItem.getQuantity());
                basket.setSubtotal(catalog.getCatalog_price() * basketItem.getQuantity());
                baskets.add(basket);
            }




        }

        List<Basket> savedBaskets = basketRepository.saveAll(baskets);

        for (Basket saved : savedBaskets) {
            cacheManager.getCache("basketItem")
                    .put(saved.getBasketId(), basketMapper.toResponse(saved));
        }

        logger.info("Successfully added temporary basket");
        return basketMapper.toListResponse(savedBaskets);
    }

    @Caching(
            put = {
                    @CachePut(value = "basketItem", key = "#savedBasket.basketId")
            },
            evict = {
                    @CacheEvict(value = "basket", allEntries = true)
            }
    )
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

    @Caching(
            put = {
                    @CachePut(value = "basket", key = "#savedBasket.basketId")
            },
            evict = {
                    @CacheEvict(value = "basket", allEntries = true)
            }
    )
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

    @Caching(evict = {
            @CacheEvict(value = "basketItem", key = "#basket.basketId"),
            @CacheEvict(value = "basket", allEntries = true)
    })
    @Transactional
    public void deleteBasket(Long userId, Long catalogId) {
        logger.info("Deleting basket of User ID: {}", userId);
        Basket basket = basketRepository.findByCustomer_UserIdAndCatalog_CatalogId(userId, catalogId)
                .orElseThrow(() -> new ResourceNotFoundException("User ID and Catalog ID not found: " + userId + ", " + catalogId));
        basketRepository.delete(basket);
        logger.info("Successfully deleted basket with User ID: {}", userId);
    }


    @Cacheable(value = "basketItem", key = "#basketId")
    public BasketResponse getBasketById(Long basketId) {
        logger.info("Getting basket with ID: {}", basketId);
        Basket basket = basketRepository.findById(basketId)
                .orElseThrow(() -> {
                    return new ResourceNotFoundException("Basket not found.");
                });
        logger.info("Successfully fetched basket with ID: {}", basketId);
        return basketMapper.toResponse(basket);

    }
}


