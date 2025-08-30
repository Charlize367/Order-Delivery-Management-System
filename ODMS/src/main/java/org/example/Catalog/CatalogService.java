package org.example.Catalog;


import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import org.example.Basket.Basket;
import org.example.Basket.BasketRepository;
import org.example.Category.Category;
import org.example.Category.CategoryRepository;
import org.example.Category.CategoryService;
import org.example.Deliveries.Deliveries;
import org.example.Users.Users;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class CatalogService {

    private final CatalogRepository catalogRepository;
    private final CategoryRepository categoryRepository;
    private final BasketRepository basketRepository;

    public CatalogService(CatalogRepository catalogRepository, CategoryRepository categoryRepository, BasketRepository basketRepository) {
        this.catalogRepository = catalogRepository;
        this.categoryRepository = categoryRepository;
        this.basketRepository = basketRepository;
    }

    public List<Catalog> getAllCatalog() {
        return catalogRepository.findAll();
    }

    public List <Catalog> getCatalogByCategory(Integer category_ID) {
        Category category = categoryRepository.findById(category_ID)
                .orElseThrow(() -> new EntityNotFoundException("Category not found"));
        return catalogRepository.getCatalogByCategory(category);
    }

    public void addCatalog(Catalog catalog) {
        catalogRepository.save(catalog);
    }


    public Catalog updateCatalog(Catalog catalog, Integer id) {
        Optional<Catalog> catalogs = catalogRepository.findById(id);
        if (catalogs.isPresent()) {
            catalogRepository.save(catalog);
        }
        else {
            return null;
        }
        return catalog;
    }

    @Transactional
    public void deleteCatalogById(Integer catalogId) {
        Catalog catalog = catalogRepository.findById(catalogId)
                .orElseThrow(() -> new RuntimeException("Catalog not found"));

        List<Basket> baskets = basketRepository.findByCatalog(catalog);
        for (Basket basket : baskets) {
            basket.setCatalog(null);
            basketRepository.save(basket);
        }

        catalogRepository.delete(catalog);
    }

    public Catalog getCatalogById(Integer id) {
        return catalogRepository.findById(id)
                .orElseThrow(() -> new IllegalStateException(id + "not found"));
    }
}
