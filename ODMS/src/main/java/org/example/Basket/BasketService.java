
        package org.example.Basket;

import jakarta.transaction.Transactional;
import org.example.Catalog.Catalog;
import org.example.Catalog.CatalogRepository;
import org.example.Combo.BasketComboItem;
import org.example.Combo.Combo;
import org.example.Combo.ComboRepository;
import org.example.Exception.ResourceNotFoundException;
import org.example.ModifierOption.ModifierOption;
import org.example.ModifierOption.ModifierOptionRepository;
import org.example.PageResponse;
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

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class BasketService {

    private static final Logger logger =
            LoggerFactory.getLogger(BasketService.class);

    @Autowired
    private BasketRepository basketRepository;

    @Autowired
    private UsersRepository usersRepository;

    @Autowired
    private CatalogRepository catalogRepository;

    @Autowired
    private ModifierOptionRepository modifierOptionRepository;

    @Autowired
    private BasketMapper basketMapper;

    @Autowired
    private CacheManager cacheManager;

    @Autowired
    private ComboRepository comboRepository;


    @EventListener(ApplicationReadyEvent.class)
    @CacheEvict(
            value = {"basket", "basketItem", "userBasket"},
            allEntries = true
    )
    public void clearCacheOnStartup() {

        logger.info(
                "Application Ready: Internal and External Caches have been cleared."
        );
    }


    public List<BasketResponse> getAllBasket() {

        logger.info("Displaying all basket");

        return basketRepository.findAll()
                .stream()
                .map(basketMapper::toResponse)
                .toList();
    }


    @Cacheable(
            value = "basket",
            key = "'page_' + #pageable.pageNumber + '_' + " +
                    "#pageable.pageSize + '_' + #pageable.sort.toString()"
    )
    public PageResponse<BasketResponse> getBasket(Pageable pageable) {

        logger.info("Displaying basket by page");

        Page<Basket> page =
                basketRepository.findAll(pageable);

        Page<BasketResponse> mapped =
                page.map(basketMapper::toResponse);

        return new PageResponse<>(mapped);
    }


//    @Cacheable(value = "userBasket", key = "#userId")
    public List<BasketResponse> getBasketByUser(Long userId) {

        logger.info("Displaying basket by user");

        Users user = usersRepository.findById(userId)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "User basket not found"
                        )
                );

        List<Basket> baskets =
                basketRepository.findByCustomer(user);

        return basketMapper.toListResponse(baskets);
    }


    @Caching(
            put = {
                    @CachePut(
                            value = "basketItem",
                            key = "#result.basketId"
                    )
            },
            evict = {
                    @CacheEvict(
                            value = "userBasket",
                            allEntries = true
                    ),
                    @CacheEvict(
                            value = "basket",
                            allEntries = true
                    )
            }
    )
    @Transactional
    public BasketResponse addBasket(
            Long userId,
            Long catalogId,
            BasketRequest request) {

        logger.info(
                "Attempting to add basket with catalog: {}",
                catalogId
        );

        Optional<Basket> existingBasket =
                basketRepository
                        .findByCustomer_UserIdAndCatalog_CatalogId(
                                userId,
                                catalogId
                        );

        Catalog catalog =
                catalogRepository.findById(catalogId)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Catalog not found"
                                )
                        );

        List<ModifierOption> modifierOptions =
                modifierOptionRepository.findAll()
                        .stream()
                        .filter(option ->
                                request.getModifierOptionIds()
                                        .contains(
                                                option.getModifierOptionId()
                                        )
                        )
                        .collect(Collectors.toList());

        BigDecimal modifierPrice =
                modifierOptions.stream()
                        .filter(ModifierOption::isActive)
                        .map(ModifierOption::getPriceAdjustment)
                        .reduce(
                                BigDecimal.ZERO,
                                BigDecimal::add
                        );

        Basket basket;

        if (existingBasket.isPresent()) {

            basket = existingBasket.get();

            int newQuantity =
                    basket.getQuantity() + request.getQuantity();

            basket.setQuantity(newQuantity);
            basket.setSpecialInstructions(
                    request.getSpecialInstructions()
            );

            BigDecimal total =
                    catalog.getCatalog_price()
                            .add(modifierPrice)
                            .multiply(
                                    BigDecimal.valueOf(newQuantity)
                            );

            basket.setSubtotal(total);

        } else {

            Users user =
                    usersRepository.findById(userId)
                            .orElseThrow(() ->
                                    new ResourceNotFoundException(
                                            "User not found"
                                    )
                            );

            basket = new Basket();

            basket.setCustomer(user);
            basket.setCatalog(catalog);
            basket.setCombo(null);
            basket.setQuantity(request.getQuantity());
            basket.setSpecialInstructions(
                    request.getSpecialInstructions()
            );

            BigDecimal total =
                    catalog.getCatalog_price()
                            .add(modifierPrice)
                            .multiply(
                                    BigDecimal.valueOf(
                                            request.getQuantity()
                                    )
                            );

            basket.setSubtotal(total);
        }

        basket.setModifierOptions(modifierOptions);

        Basket savedBasket =
                basketRepository.save(basket);

        logger.info(
                "Successfully added basket. ID: {}",
                savedBasket.getBasketId()
        );

        return basketMapper.toResponse(savedBasket);
    }



    @Caching(
            put = {
                    @CachePut(
                            value = "basketItem",
                            key = "#result.basketId"
                    )
            },
            evict = {
                    @CacheEvict(
                            value = "userBasket",
                            allEntries = true
                    ),
                    @CacheEvict(
                            value = "basket",
                            allEntries = true
                    )
            }
    )
    @Transactional
    public BasketResponse addComboBasket(
            Long userId,
            Long comboId,
            ComboBasketRequest request) {

        logger.info(
                "Attempting to add combo {} to basket for user {}",
                comboId,
                userId
        );

        /*
         * Make sure the combo ID in the URL and request body
         * refer to the same combo.
         */
        if (!comboId.equals(request.comboId())) {
            throw new IllegalArgumentException(
                    "Combo ID in URL does not match combo ID in request"
            );
        }

        /*
         * Validate the user.
         */
        Users user = usersRepository.findById(userId)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "User not found: " + userId
                        )
                );

        /*
         * Find the combo.
         */
        Combo combo = comboRepository.findById(comboId)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Combo not found: " + comboId
                        )
                );

        /*
         * Create a NEW basket for this combo configuration.
         *
         * We intentionally do not use:
         *
         * findByCustomer_UserIdAndCombo_ComboId(...)
         *
         * because two instances of the same combo can have
         * different modifier selections.
         */
        Basket basket = new Basket();

        basket.setCustomer(user);
        basket.setCombo(combo);
        basket.setQuantity(request.quantity());
        basket.setSpecialInstructions(
                request.specialInstructions()
        );

        BigDecimal modifierPrice = BigDecimal.ZERO;

        /*
         * Build the customer's selected combo items.
         */
        for (ComboItemBasketRequest selection :
                request.itemSelections()) {

            Catalog catalog = catalogRepository.findById(
                    selection.catalogId()
            ).orElseThrow(() ->
                    new ResourceNotFoundException(
                            "Catalog not found: " +
                                    selection.catalogId()
                    )
            );

            /*
             * Get the modifier options selected for this
             * particular combo item.
             */
            List<ModifierOption> selectedModifiers =
                    modifierOptionRepository.findAllById(
                            selection.modifierOptionIds()
                    );

            /*
             * Calculate modifier price for this combo item.
             */
            BigDecimal itemModifierPrice =
                    selectedModifiers.stream()
                            .filter(ModifierOption::isActive)
                            .map(ModifierOption::getPriceAdjustment)
                            .reduce(
                                    BigDecimal.ZERO,
                                    BigDecimal::add
                            );

            /*
             * If the combo contains multiple units of this
             * catalog item, its modifier cost should apply
             * to each unit.
             */
            itemModifierPrice =
                    itemModifierPrice.multiply(
                            BigDecimal.valueOf(
                                    selection.quantity()
                            )
                    );

            modifierPrice =
                    modifierPrice.add(itemModifierPrice);

            /*
             * Create the customer's configured combo item.
             */
            BasketComboItem comboItem =
                    new BasketComboItem();

            comboItem.setBasket(basket);
            comboItem.setCatalog(catalog);
            comboItem.setQuantity(selection.quantity());
            comboItem.setModifierOptions(selectedModifiers);

            basket.getComboItems().add(comboItem);
        }

        /*
         * Combo price:
         *
         * bundle price
         * + all selected modifier adjustments
         *
         * then multiply the entire combo by the basket quantity.
         */
        BigDecimal unitPrice =
                combo.getBundlePrice()
                        .add(modifierPrice);

        BigDecimal subtotal =
                unitPrice.multiply(
                        BigDecimal.valueOf(
                                request.quantity()
                        )
                );

        basket.setSubtotal(subtotal);

        /*
         * Cascade saves BasketComboItems as well.
         */
        Basket savedBasket =
                basketRepository.save(basket);

        logger.info(
                "Successfully added combo basket. " +
                        "Basket ID: {}, combo ID: {}, quantity: {}, subtotal: {}",
                savedBasket.getBasketId(),
                comboId,
                savedBasket.getQuantity(),
                savedBasket.getSubtotal()
        );

        return basketMapper.toResponse(savedBasket);
    }



    @Caching(
            put = {
                    @CachePut(
                            value = "basketItem",
                            key = "#result.basketId"
                    )
            },
            evict = {
                    @CacheEvict(
                            value = "userBasket",
                            allEntries = true
                    ),
                    @CacheEvict(
                            value = "basket",
                            allEntries = true
                    )
            }
    )
    @Transactional
    public BasketResponse updateBasketQuantity(
            Long basketId,
            Integer quantity) {

        logger.info(
                "Updating basket {} quantity with {}",
                basketId,
                quantity
        );

        if (quantity == null || quantity <= 0) {
            throw new IllegalArgumentException(
                    "Quantity must be greater than 0"
            );
        }

        Basket basket =
                basketRepository.findById(basketId)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Basket not found with id: " +
                                                basketId
                                )
                        );

        BigDecimal unitPrice;

        if (basket.getCatalog() != null) {

            BigDecimal modifierPrice =
                    basket.getModifierOptions()
                            .stream()
                            .filter(
                                    ModifierOption::isActive
                            )
                            .map(
                                    ModifierOption
                                            ::getPriceAdjustment
                            )
                            .reduce(
                                    BigDecimal.ZERO,
                                    BigDecimal::add
                            );

            unitPrice =
                    basket.getCatalog()
                            .getCatalog_price()
                            .add(modifierPrice);

        } else if (basket.getCombo() != null) {

            BigDecimal modifierPrice =
                    basket.getComboItems()
                            .stream()
                            .flatMap(
                                    item ->
                                            item.getModifierOptions()
                                                    .stream()
                            )
                            .filter(
                                    ModifierOption::isActive
                            )
                            .map(
                                    ModifierOption
                                            ::getPriceAdjustment
                            )
                            .reduce(
                                    BigDecimal.ZERO,
                                    BigDecimal::add
                            );

            unitPrice =
                    basket.getCombo()
                            .getBundlePrice()
                            .add(modifierPrice);

        } else {

            throw new IllegalStateException(
                    "Basket must have either a catalog item or a combo"
            );
        }

        BigDecimal total =
                unitPrice.multiply(
                        BigDecimal.valueOf(quantity)
                );

        basket.setQuantity(quantity);
        basket.setSubtotal(total);

        Basket savedBasket =
                basketRepository.save(basket);

        logger.info(
                "Successfully updated basket. ID: {}, quantity: {}, subtotal: {}",
                savedBasket.getBasketId(),
                savedBasket.getQuantity(),
                savedBasket.getSubtotal()
        );

        return basketMapper.toResponse(savedBasket);
    }


    @Caching(
            evict = {
                    @CacheEvict(
                            value = "basketItem",
                            key = "#basketId"
                    ),
                    @CacheEvict(
                            value = "userBasket",
                            allEntries = true
                    ),
                    @CacheEvict(
                            value = "basket",
                            allEntries = true
                    )
            }
    )
    @Transactional
    public void deleteBasket(Long basketId) {

        logger.info(
                "Deleting basket with ID: {}",
                basketId
        );

        Basket basket =
                basketRepository.findById(basketId)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Basket not found with id: " +
                                                basketId
                                )
                        );

        basketRepository.delete(basket);

        logger.info(
                "Successfully deleted basket with ID: {}",
                basketId
        );
    }


    @Cacheable(value = "basketItem", key = "#basketId")
    public BasketResponse getBasketById(Long basketId) {

        logger.info(
                "Getting basket with ID: {}",
                basketId
        );

        Basket basket =
                basketRepository.findById(basketId)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Basket not found with id: " +
                                                basketId
                                )
                        );

        logger.info(
                "Successfully fetched basket with ID: {}",
                basketId
        );

        return basketMapper.toResponse(basket);
    }


    @Caching(evict = {
            @CacheEvict(value = "userBasket", allEntries = true),
            @CacheEvict(value = "basket", allEntries = true)
    })
    @Transactional
    public List<BasketResponse> addTemporaryBasket(
            List<BasketRequest> request) {

        logger.info("Adding temporary basket items");

        List<Basket> baskets = new ArrayList<>();
        List<BasketResponse> responses = new ArrayList<>();

        for (BasketRequest item : request) {

            Catalog catalog = catalogRepository.findById(item.getCatalogId())
                    .orElseThrow(() ->
                            new ResourceNotFoundException(
                                    "Catalog not found: " + item.getCatalogId()
                            )
                    );

            List<ModifierOption> modifierOptions =
                    modifierOptionRepository.findAllById(
                            item.getModifierOptionIds()
                    );

            BigDecimal modifierPrice = modifierOptions.stream()
                    .filter(ModifierOption::isActive)
                    .map(ModifierOption::getPriceAdjustment)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);

            BigDecimal subtotal = catalog.getCatalog_price()
                    .add(modifierPrice)
                    .multiply(
                            BigDecimal.valueOf(item.getQuantity())
                    );

            Basket basket = new Basket();

            basket.setCatalog(catalog);
            basket.setCombo(null);
            basket.setQuantity(item.getQuantity());
            basket.setSubtotal(subtotal);
            basket.setModifierOptions(modifierOptions);
            basket.setSpecialInstructions(
                    item.getSpecialInstructions()
            );

            /*
             * Temporary baskets don't have a customer.
             * Keep whatever customer/tenant behavior your existing
             * Basket entity requires here.
             */

            baskets.add(basket);
        }

        List<Basket> savedBaskets =
                basketRepository.saveAll(baskets);

        for (Basket savedBasket : savedBaskets) {

            BasketResponse response =
                    basketMapper.toResponse(savedBasket);

            responses.add(response);

            /*
             * Cache each newly created basket using its generated ID.
             */
            if (cacheManager.getCache("basketItem") != null) {
                cacheManager.getCache("basketItem")
                        .put(
                                savedBasket.getBasketId(),
                                response
                        );
            }
        }

        logger.info(
                "Successfully added {} temporary basket items",
                savedBaskets.size()
        );

        return responses;
    }


}

