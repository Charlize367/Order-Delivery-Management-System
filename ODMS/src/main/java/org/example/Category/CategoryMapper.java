package org.example.Category;

import org.springframework.stereotype.Component;

import java.util.Set;
import java.util.stream.Collectors;

@Component
public class CategoryMapper {
    public Category toEntity(CategoryRequest req) {
        Category category = new Category();
        category.setCategory_name(req.getCategory_name());
        return category;
    }

    public CategoryResponse toResponse(Category category) {
        CategoryResponse categoryResponse = new CategoryResponse();
        categoryResponse.setCategoryId(category.getCategoryId());
        categoryResponse.setCategory_name(category.getCategory_name());
        categoryResponse.setCategory_image(category.getCategory_image());
        return categoryResponse;
    }

}
