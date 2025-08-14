package org.example.Category;


import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class CategoryService {
    private final CategoryRepository categoryRepository;
    public CategoryService(CategoryRepository categoryRepository) {
        this.categoryRepository = categoryRepository;
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

    public void delete(Category category) {
        categoryRepository.delete(category);
    }

    public Category getCategoryById(Integer id) {
        return categoryRepository.findById(id)
                .orElseThrow(() -> new IllegalStateException(id + "not found"));
    }
}
