package org.example.Category;


import jakarta.transaction.Transactional;
import org.example.Catalog.Catalog;
import org.example.Catalog.CatalogRepository;
import org.example.Deliveries.Deliveries;
import org.example.Exception.ResourceNotFoundException;
import org.example.Users.Users;
import org.jsoup.Jsoup;
import org.jsoup.safety.Safelist;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cache.annotation.CacheEvict;
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
import java.util.Optional;



@Service
public class CategoryService {

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private CatalogRepository catalogRepository;

    @Autowired
    private CategoryMapper categoryMapper;

    private static final Logger logger = LoggerFactory.getLogger(Category.class);


    public List<CategoryResponse> getAllCategories() {
        logger.info("Displaying all categories");
        return categoryRepository.findAll().stream()
                .map(categoryMapper::toResponse)
                .toList();
    }

    public Page<CategoryResponse> getCategories(Pageable pageable) {
        logger.info("Displaying categories by page");
        return categoryRepository.findAll(pageable)
                .map(categoryMapper::toResponse);
    }

    public CategoryResponse addCategory(CategoryRequest request) throws IOException {
        logger.info("Attempting to add new category with name: {}", request.getCategory_name());

        String safeName = Jsoup.clean(request.getCategory_name(), Safelist.none()).trim();

        Category category = new Category();
        category.setCategory_name(safeName);
        category.setCategory_image(request.getCategory_image());


        Category savedCategory =  categoryRepository.save(category);
        logger.info("Successfully added new category with name: {}", request.getCategory_name());
        return categoryMapper.toResponse(savedCategory);
    }


    public CategoryResponse updateCategory(Long categoryId, UpdateCategoryRequest request) throws IOException {

        logger.info("Updating category with ID: {}", categoryId);


        String safeName = Jsoup.clean(request.getCategory_name(), Safelist.none()).trim();

        Category category = categoryRepository.findById(categoryId).get();
        category.setCategoryId(categoryId);
        category.setCategory_name(safeName);
        category.setCategory_image(request.getCategory_image());

        Category savedCategory =  categoryRepository.save(category);
        logger.info("Successfully updated category ID: {}", categoryId);
        return categoryMapper.toResponse(savedCategory);
    }

    @Transactional
    public void deleteByCategoryId(Long categoryId) {
        logger.info("Deleting category ID: {}", categoryId);
        Category category = categoryRepository.findById(categoryId)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found"));

        List<Catalog> catalogs = catalogRepository.getCatalogByCategory(category);
        for (Catalog catalog : catalogs) {
            catalog.setCategory(null);
            catalogRepository.save(catalog);
        }

        categoryRepository.delete(category);
        logger.info("Successfully deleted category ID: {}", categoryId);
    }


    @Cacheable("categories")
    public CategoryResponse getCategoryById(Long id) {
        logger.info("Getting category ID: {}", id);
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> {
                    return new ResourceNotFoundException("Category not found.");
                });
        logger.info("Successfully fetched category ID: {}", id);
        return categoryMapper.toResponse(category);
    }
}
