package org.example.Category;


import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;

@RestController
@RequestMapping("categories")
@ControllerAdvice
public class CategoryController {
    private final CategoryService categoryService;

    @Autowired
    CategoryRepository categoryRepository;

    public static String uploadDirectory = System.getProperty("user.dir") + "/src/main/resources/static/images";

    public CategoryController(CategoryService categoryService) {
        this.categoryService = categoryService;
    }

    @GetMapping
    public List<Category> getCategories() {
        return categoryService.getAllCategories();
    }

    @GetMapping("{id}")
    public Category getCategoryById(@PathVariable Long id) {
        return categoryService.getCategoryById(id);
    }

    @PostMapping
    public ResponseEntity<Category> addCategory(@RequestParam("category_name") String category_name,
                                                @RequestParam("category_image") MultipartFile category_image) throws IOException {
        Category category = categoryService.addCategory(category_name, category_image);
        return new ResponseEntity<>(category, HttpStatus.CREATED);

    }

    @PutMapping("/{categoryId}")
    public ResponseEntity<Category> updateCategory(@PathVariable long categoryId, @RequestParam("category_name") String category_name,
                                                   @RequestParam("category_image") String category_image) throws IOException {
        Category category = categoryService.updateCategory(categoryId, category_name, category_image);
        return new ResponseEntity<>(HttpStatus.CREATED);
    }

    @DeleteMapping("/{id}")
    public void deleteCategory(@PathVariable Long id) {
        categoryService.deleteByCategoryId(id);

    }
}
