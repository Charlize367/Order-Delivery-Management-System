package org.example.Combo;

import jakarta.transaction.Transactional;
import org.example.Catalog.Catalog;
import org.example.Catalog.CatalogRepository;
import org.example.Exception.ResourceNotFoundException;
import org.jsoup.Jsoup;
import org.jsoup.safety.Safelist;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.CachePut;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.cache.annotation.Caching;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class ComboService {

    private static final Logger logger =
            LoggerFactory.getLogger(ComboService.class);

    @Autowired
    private ComboRepository comboRepository;

    @Autowired
    private CatalogRepository catalogRepository;

    @Autowired
    private ComboMapper comboMapper;

    @EventListener(ApplicationReadyEvent.class)
    @CacheEvict(value = {"combos", "combo"}, allEntries = true)
    public void clearCacheOnStartup() {
        logger.info("Application Ready: Internal and External Caches have been nuked to sync with Database.");
    }

    @Transactional
    @Caching(
            put = {
                    @CachePut(
                            value = "combo",
                            key = "#result.comboId"
                    )
            },
            evict = {
                    @CacheEvict(
                            value = "combos",
                            allEntries = true
                    )
            }
    )
    public ComboResponse addCombo(ComboRequest request) {

        logger.info("Attempting to create combo: {}", request.name());

        String safeName =
                Jsoup.clean(request.name(), Safelist.none()).trim();

        String safeDescription =
                request.description() == null
                        ? null
                        : Jsoup.clean(
                        request.description(),
                        Safelist.none()
                ).trim();

        Combo combo = new Combo();

        combo.setName(safeName);
        combo.setDescription(safeDescription);
        combo.setBundlePrice(request.bundlePrice());
        combo.setActive(true);

        List<ComboItem> comboItems = new ArrayList<>();

        for (ComboItemRequest itemRequest : request.comboItems()) {

            Catalog catalog = catalogRepository.findById(
                    itemRequest.catalogId()
            ).orElseThrow(() ->
                    new ResourceNotFoundException(
                            "Catalog not found with id: "
                                    + itemRequest.catalogId()
                    )
            );

            ComboItem comboItem = new ComboItem();

            comboItem.setCombo(combo);
            comboItem.setCatalog(catalog);
            comboItem.setQuantity(itemRequest.quantity());

            comboItems.add(comboItem);
        }

        combo.setComboItems(comboItems);

        Combo savedCombo = comboRepository.save(combo);

        logger.info(
                "Successfully created combo with ID: {}",
                savedCombo.getComboId()
        );

        return comboMapper.toResponse(savedCombo);
    }


    public List<ComboResponse> getAllCombos() {

        logger.info("Getting all combos");

        return comboMapper.toListResponse(
                comboRepository.findAll()
        );
    }

    @Cacheable(value = "combo", key = "#comboId")
    public ComboResponse getComboById(Long comboId) {

        logger.info("Getting combo ID: {}", comboId);

        Combo combo = comboRepository.findById(comboId)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Combo not found with id: "
                                        + comboId
                        )
                );

        return comboMapper.toResponse(combo);
    }

    @Transactional
    @Caching(
            put = {
                    @CachePut(
                            value = "combo",
                            key = "#result.comboId"
                    )
            },
            evict = {
                    @CacheEvict(
                            value = "combos",
                            allEntries = true
                    )
            }
    )
    public ComboResponse updateCombo(
            Long comboId,
            ComboRequest request
    ) {

        Combo combo = comboRepository.findById(comboId)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Combo not found with id: "
                                        + comboId
                        )
                );

        combo.setName(
                Jsoup.clean(
                        request.name(),
                        Safelist.none()
                ).trim()
        );

        combo.setDescription(
                request.description() == null
                        ? null
                        : Jsoup.clean(
                        request.description(),
                        Safelist.none()
                ).trim()
        );

        combo.setBundlePrice(request.bundlePrice());

        combo.getComboItems().clear();

        for (ComboItemRequest itemRequest : request.comboItems()) {

            Catalog catalog = catalogRepository.findById(
                    itemRequest.catalogId()
            ).orElseThrow(() ->
                    new ResourceNotFoundException(
                            "Catalog not found with id: "
                                    + itemRequest.catalogId()
                    )
            );

            ComboItem comboItem = new ComboItem();

            comboItem.setCombo(combo);
            comboItem.setCatalog(catalog);
            comboItem.setQuantity(itemRequest.quantity());

            combo.getComboItems().add(comboItem);
        }

        Combo savedCombo = comboRepository.save(combo);

        return comboMapper.toResponse(savedCombo);
    }

    @Caching(
            evict = {
                    @CacheEvict(
                            value = "combo",
                            key = "#comboId"
                    ),
                    @CacheEvict(
                            value = "combos",
                            allEntries = true
                    )
            }
    )
    @Transactional
    public void deactivateCombo(Long comboId) {

        Combo combo = comboRepository.findById(comboId)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Combo not found with id: "
                                        + comboId
                        )
                );

        combo.setActive(false);

        comboRepository.save(combo);
    }

    @Caching(
            evict = {
                    @CacheEvict(
                            value = "combo",
                            key = "#comboId"
                    ),
                    @CacheEvict(
                            value = "combos",
                            allEntries = true
                    )
            }
    )
    @Transactional
    public void activateCombo(Long comboId) {

        Combo combo = comboRepository.findById(comboId)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Combo not found with id: "
                                        + comboId
                        )
                );

        combo.setActive(true);

        comboRepository.save(combo);
    }


    public void deleteCombo(Long comboId) {

        logger.info("Deleting combo ID: {}", comboId);

        Combo combo = comboRepository.findById(comboId)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Combo not found with id: "
                                        + comboId
                        )
                );

       comboRepository.delete(combo);

        logger.info("Successfully deleted combo ID: {}", comboId);
    }
}