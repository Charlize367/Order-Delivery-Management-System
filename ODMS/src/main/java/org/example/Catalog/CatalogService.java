package org.example.Catalog;


import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import org.example.Basket.Basket;
import org.example.Basket.BasketRepository;
import org.example.Category.Category;
import org.example.Category.CategoryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.Optional;

import static org.example.Catalog.CatalogController.uploadDirectory;

@Service
public class CatalogService {

    @Autowired
    private CatalogRepository catalogRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private BasketRepository basketRepository;



    public List<Catalog> getAllCatalog() {
        return catalogRepository.findAll();
    }

    public List <Catalog> getCatalogByCategory(Long category_ID) {
        Category category = categoryRepository.findById(category_ID)
                .orElseThrow(() -> new EntityNotFoundException("Category not found"));
        return catalogRepository.getCatalogByCategory(category);
    }

    public Catalog addCatalog(Long categoryId, String catalogName, Double catalog_price, String catalog_description, MultipartFile catalog_image) throws IOException {

            Category category = categoryRepository.findById(categoryId)
                    .orElseThrow(() -> new RuntimeException("Category not found with id: " + categoryId));

            String originalFilename = catalog_image.getOriginalFilename();
            Path fileNameAndPath = Paths.get(uploadDirectory, originalFilename);
            Files.write(fileNameAndPath, catalog_image.getBytes());

            Catalog catalog = new Catalog();
            catalog.setCatalogName(catalogName);
            catalog.setCatalog_price(catalog_price);
            catalog.setCatalog_description(catalog_description);
            catalog.setCatalog_image(originalFilename);
            catalog.setCategory(category);
            return catalogRepository.save(catalog);

    }

    public Catalog updateCatalog(Long catalogId, Long categoryId, String catalogName, Double catalog_price, String catalog_description, String catalog_image) throws IOException {
        try {
            Category category = categoryRepository.findById(categoryId)
                    .orElseThrow(() -> new RuntimeException("Category not found with id: " + categoryId));

            Path fileNameAndPath = Paths.get(uploadDirectory, catalog_image);
            Files.write(fileNameAndPath, catalog_image.getBytes());

            Catalog catalog = catalogRepository.findById(catalogId)
                    .orElseThrow(() -> new RuntimeException("Catalog not found with id: " + catalogId));;
            catalog.setCatalogId(catalogId);
            catalog.setCatalogName(catalogName);
            catalog.setCatalog_price(catalog_price);
            catalog.setCatalog_description(catalog_description);
            catalog.setCatalog_image(catalog_image);
            catalog.setCategory(category);
            catalogRepository.save(catalog);
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
        return null;
    }

    @Transactional
    public void deleteCatalogById(Long catalogId) {
        Catalog catalog = catalogRepository.findById(catalogId)
                .orElseThrow(() -> new RuntimeException("Catalog not found"));

        List<Basket> baskets = basketRepository.findByCatalog(catalog);
        for (Basket basket : baskets) {
            basket.setCatalog(null);
            basketRepository.save(basket);
        }

        catalogRepository.delete(catalog);
    }

    public Catalog getCatalogById(Long id) {
        return catalogRepository.findById(id)
                .orElseThrow(() -> new IllegalStateException(id + "not found"));
    }
}
