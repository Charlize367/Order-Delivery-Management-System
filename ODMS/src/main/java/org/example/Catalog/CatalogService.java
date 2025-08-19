package org.example.Catalog;


import jakarta.persistence.EntityNotFoundException;
import org.example.Basket.Basket;
import org.example.Category.Category;
import org.example.Category.CategoryRepository;
import org.example.Category.CategoryService;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class CatalogService {

    private final CatalogRepository catalogRepository;
    private final CategoryRepository categoryRepository;

    public CatalogService(CatalogRepository catalogRepository, CategoryRepository categoryRepository) {
        this.catalogRepository = catalogRepository;
        this.categoryRepository = categoryRepository;
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

    public void deleteCatalog(Catalog catalog, Integer id) {
        Optional<Catalog> catalogs = catalogRepository.findById(id);
        if (catalogs.isPresent()) {
            catalogRepository.delete(catalog);
        }
        else {
            return;
        }
    }

    public Catalog getCatalogById(Integer id) {
        return catalogRepository.findById(id)
                .orElseThrow(() -> new IllegalStateException(id + "not found"));
    }
}
