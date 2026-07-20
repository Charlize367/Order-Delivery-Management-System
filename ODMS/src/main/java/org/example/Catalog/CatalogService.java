package org.example.Catalog;


import jakarta.transaction.Transactional;
import org.example.Basket.BasketRepository;
import org.example.Category.Category;
import org.example.Category.CategoryRepository;
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
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.util.List;

@Service
public class CatalogService {

    @Autowired
    private CatalogRepository catalogRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private BasketRepository basketRepository;

    @Autowired
    private CatalogMapper catalogMapper;


    private static final Logger logger = LoggerFactory.getLogger(CatalogService.class);

    @EventListener(ApplicationReadyEvent.class)
    @CacheEvict(value = {"catalog", "catalogItem"}, allEntries = true)
    public void clearCacheOnStartup() {
        logger.info("Application Ready: Internal and External Caches have been nuked to sync with Database.");
    }


    @Cacheable(value = "catalog")
    public List<CatalogResponse> getAllCatalog() {
        logger.info("Displaying all catalogs");


        return catalogRepository.findAll().stream()
                .map(catalogMapper::toResponse)
                .toList();
    }

    @Cacheable(value = "catalog", key = "'page_'+#pageable.pageNumber+'_'+#pageable.pageSize+'_'+#pageable.sort.toString()")
    public Page<CatalogResponse> getCatalog(Long categoryId, Pageable pageable) {
        logger.info("Displaying catalogs by page");

        if(categoryId != null) {
            return catalogRepository.findCatalogByCategoryCategoryIdAndActiveTrue(categoryId, pageable)
                    .map(catalogMapper::toResponse);
        }
        return catalogRepository.findByActiveTrue(pageable)
                .map(catalogMapper::toResponse);
    }


    @Caching(
            put = {
                    @CachePut(value = "catalogItem", key = "#savedCatalog.catalogId")
            },
            evict = {
                    @CacheEvict(value = "catalogItem", allEntries = true)
            }
    )
    public CatalogResponse addCatalog(Long categoryId, CatalogRequest request) throws IOException {
        logger.info("Attempting to add new catalog with name: {}", request.getCatalogName());
            Category category = categoryRepository.findById(categoryId)
                    .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + request.getCategoryId()));


            String safeName = Jsoup.clean(request.getCatalogName(), Safelist.none()).trim();
            String safeDescription = Jsoup.clean(request.getCatalog_description(), Safelist.none()).trim();


            Catalog catalog = new Catalog();
            catalog.setCatalogName(safeName);
            catalog.setCatalog_price(request.getCatalog_price());
            catalog.setCatalog_description(safeDescription);
            catalog.setCatalog_image(request.getCatalog_image());
            catalog.setCategory(category);

            Catalog savedCatalog =  catalogRepository.save(catalog);
            logger.info("Successfully added new catalog with name: {}", request.getCatalogName());
            return catalogMapper.toResponse(savedCatalog);

    }



    @Caching(
            put = {
                    @CachePut(value = "catalogItem", key = "#savedCatalog.catalogId")
            },
            evict = {
                    @CacheEvict(value = "catalog", allEntries = true)
            }
    )
    public CatalogResponse updateCatalog(Long catalogId, Long categoryId, UpdateCatalogRequest request) throws IOException {
        try {

            logger.info("Updating catalog with ID: {}", catalogId);
            Category category = categoryRepository.findById(categoryId)
                    .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + categoryId));




            String safeName = Jsoup.clean(request.getCatalogName(), Safelist.none()).trim();
            String safeDescription = Jsoup.clean(request.getCatalog_description(), Safelist.none()).trim();

            Catalog catalog = catalogRepository.findById(catalogId)
                    .orElseThrow(() -> new ResourceNotFoundException("Catalog not found with id: " + catalogId));;
            catalog.setCatalogId(catalogId);
            catalog.setCatalogName(safeName);
            catalog.setCatalog_price(request.getCatalog_price());
            catalog.setCatalog_description(safeDescription);
            catalog.setCatalog_image(request.getCatalog_image());
            catalog.setCategory(category);
            Catalog savedCatalog =  catalogRepository.save(catalog);
            logger.info("Successfully updated catalog ID: {}", catalogId);
            return catalogMapper.toResponse(savedCatalog);
        } catch (Exception e) {
            logger.warn("Error with catalog ID: {}", catalogId);
            throw new RuntimeException(e);

        }
    }


    @Caching(evict = {
            @CacheEvict(value = "catalogItem", key = "#catalogId"),
            @CacheEvict(value = "catalogItem", allEntries = true)
    })
    @Transactional
    public void deleteCatalogById(Long catalogId) {
        logger.info("Deleting catalog ID: {}", catalogId);
        Catalog catalog = catalogRepository.findById(catalogId)
                .orElseThrow(() -> new ResourceNotFoundException("Catalog not found"));

        catalog.setActive(false);

        catalogRepository.save(catalog);
        logger.info("Successfully deleted catalog ID: {}", catalogId);
    }



    @Cacheable(value = "catalogItem", key = "#catalogId")
    public CatalogResponse getCatalogById(Long catalogId) {
        logger.info("Getting catalog ID: {}", catalogId);
        Catalog catalog = catalogRepository.findById(catalogId)
                .orElseThrow(() -> {
                    return new ResourceNotFoundException("Catalog not found.");
                });
        logger.info("Successfully fetched catalog ID: {}", catalogId);
        return catalogMapper.toResponse(catalog);
    }
}
