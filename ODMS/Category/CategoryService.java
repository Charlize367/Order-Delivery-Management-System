package org.example.Category;


import jakarta.transaction.Transactional;
import org.example.Catalog.Catalog;
import org.example.Catalog.CatalogRepository;
import org.example.Deliveries.Deliveries;
import org.example.Users.Users;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class CategoryService {
    private final CategoryRepository categoryRepository;

    private final CatalogRepository catalogRepository;
    public CategoryService(CategoryRepository categoryRepository, CatalogRepository catalogRepository) {
        this.categoryRepository = categoryRepository;
        this.catalogRepository = catalogRepository;
    }

    public List<Category> getAllCategories() {
        return categoryRepository.findAll();
    }

    public void addCategory(Category category) {
        categoryRepository.save(category);
    }


    public Category updateCategory(Category category, Integer id) {
        Optional<Category> categories = categoryRepository.findById(id);
        if (categories.isPresent()) {
            categoryRepository.save(category);
        }
        else {
            return null;
        }
        return category;
    }

    @Transactional
    public void deleteByCategoryId(Integer categoryId) {
        Category category = categoryRepository.findById(categoryId)
                .orElseThrow(() -> new RuntimeException("Category not found"));

        List<Catalog> catalogs = catalogRepository.getCatalogByCategory(category);
        for (Catalog catalog : catalogs) {
            catalog.setCategory(null);
            catalogRepository.save(catalog);
        }

        categoryRepository.delete(category);
    }

    public Category getCategoryById(Integer id) {
        return categoryRepository.findById(id)
                .orElseThrow(() -> new IllegalStateException(id + "not found"));
    }
}
