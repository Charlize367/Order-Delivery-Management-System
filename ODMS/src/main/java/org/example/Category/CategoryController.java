package org.example.Category;


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


    public static String uploadDirectory = System.getProperty("user.dir") + "/src/main/resources/static/images";

    public CategoryController(CategoryService categoryService) {
        this.categoryService = categoryService;
    }

    @GetMapping
    public List<Category> getCategories() {
        return categoryService.getAllCategories();
    }

    @GetMapping("{id}")
    public Category getCategoryById(@PathVariable Integer id) {
        return categoryService.getCategoryById(id);
    }

    @PostMapping
    public ResponseEntity<Category> addCategory(@RequestParam("category_name") String category_name,
                                                @RequestParam("category_image") MultipartFile category_image) throws IOException {


        String originalFilename = category_image.getOriginalFilename();
        Path fileNameAndPath = Paths.get(uploadDirectory, originalFilename);
        Files.write(fileNameAndPath, category_image.getBytes());

        Category category = new Category();
        category.setCategory_name(category_name);
        category.setCategory_image(originalFilename);

        categoryService.addCategory(category);
        return new ResponseEntity<>(HttpStatus.CREATED);

    }



    @PutMapping("/{category_ID}")
    public ResponseEntity<Category> updateCategory(@PathVariable int category_ID, @RequestBody Category category) {
        Category updatedCategory = categoryService.updateCategory(category, category_ID);
        return new ResponseEntity<>(updatedCategory, HttpStatus.OK);
    }

    @DeleteMapping("{id}")
    public void deleteCategory(@PathVariable Integer id) {
        categoryService.getCategoryById(id);
        categoryService.delete(categoryService.getCategoryById(id));
    }
}
