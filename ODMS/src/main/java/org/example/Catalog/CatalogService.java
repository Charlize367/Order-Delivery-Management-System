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
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;

import static org.example.Catalog.CatalogController.uploadDirectory;

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


    private static final Logger logger = LoggerFactory.getLogger(Catalog.class);



    public List<CatalogResponse> getAllCatalog() {
        logger.info("Displaying all catalogs");


        return catalogRepository.findAll().stream()
                .map(catalogMapper::toResponse)
                .toList();
    }

    public Page<CatalogResponse> getCatalog(Long categoryId, Pageable pageable) {
        logger.info("Displaying catalogs by page");

        if(categoryId != null) {
            return catalogRepository.findCatalogByCategoryCategoryIdAndActiveTrue(categoryId, pageable)
                    .map(catalogMapper::toResponse);
        }
        return catalogRepository.findAll(pageable)
                .map(catalogMapper::toResponse);
    }


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

    @Transactional
    public void deleteCatalogById(Long catalogId) {
        logger.info("Deleting catalog ID: {}", catalogId);
        Catalog catalog = catalogRepository.findById(catalogId)
                .orElseThrow(() -> new ResourceNotFoundException("Catalog not found"));

        catalog.setActive(false);

        catalogRepository.save(catalog);
        logger.info("Successfully deleted catalog ID: {}", catalogId);
    }


   
    public CatalogResponse getCatalogById(Long id) {
        logger.info("Getting catalog ID: {}", id);
        Catalog catalog = catalogRepository.findById(id)
                .orElseThrow(() -> {
                    return new ResourceNotFoundException("Catalog not found.");
                });
        logger.info("Successfully fetched catalog ID: {}", id);
        return catalogMapper.toResponse(catalog);
    }
}
