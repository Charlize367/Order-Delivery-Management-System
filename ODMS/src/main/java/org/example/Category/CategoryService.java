package org.example.Category;


import jakarta.transaction.Transactional;
import org.example.Catalog.Catalog;
import org.example.Catalog.CatalogRepository;
import org.example.Deliveries.Deliveries;
import org.example.Users.Users;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.Optional;

import static org.example.Category.CategoryController.uploadDirectory;

@Service
public class CategoryService {

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private CatalogRepository catalogRepository;


    public List<Category> getAllCategories() {
        return categoryRepository.findAll();
    }

    public Category addCategory(String category_name, MultipartFile category_image) throws IOException {
        String originalFilename = category_image.getOriginalFilename();
        Path fileNameAndPath = Paths.get(uploadDirectory, originalFilename);
        Files.write(fileNameAndPath, category_image.getBytes());

        Category category = new Category();
        category.setCategory_name(category_name);
        category.setCategory_image(originalFilename);

        return categoryRepository.save(category);
    }


    public Category updateCategory(Long categoryId, String category_name, String category_image) throws IOException {
        Path fileNameAndPath = Paths.get(uploadDirectory, category_image);
        Files.write(fileNameAndPath, category_image.getBytes());

        Category category = categoryRepository.findById(categoryId).get();
        category.setCategoryId(categoryId);
        category.setCategory_name(category_name);
        category.setCategory_image(category_image);
        return categoryRepository.save(category);
    }

    @Transactional
    public void deleteByCategoryId(Long categoryId) {
        Category category = categoryRepository.findById(categoryId)
                .orElseThrow(() -> new RuntimeException("Category not found"));

        List<Catalog> catalogs = catalogRepository.getCatalogByCategory(category);
        for (Catalog catalog : catalogs) {
            catalog.setCategory(null);
            catalogRepository.save(catalog);
        }

        categoryRepository.delete(category);
    }

    public Category getCategoryById(Long id) {
        return categoryRepository.findById(id)
                .orElseThrow(() -> new IllegalStateException(id + "not found"));
    }
}
