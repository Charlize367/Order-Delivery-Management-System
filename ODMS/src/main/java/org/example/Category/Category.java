package org.example.Category;


import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import org.example.Catalog.Catalog;

import java.util.List;
import java.util.Objects;

@Entity
public class Category {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Long categoryId;

    @NotBlank(message = "Category name cannot be blank")
    @Size(min = 1, max = 50, message = "Name must have at least 1-50 characters")
    private String category_name;

    private String category_image;

    @OneToMany(mappedBy = "category", fetch = FetchType.EAGER)
    private List<Catalog> catalog;


    public Category(){}

    public Category(Long categoryId, String category_name, String category_image) {
        this.categoryId = categoryId;
        this.category_name = category_name;
        this.category_image = category_image;
    }

    public Long getCategoryId() {
        return categoryId;
    }

    public void setCategoryId(Long categoryId) {
        this.categoryId = categoryId;
    }

    public String getCategory_name() {
        return category_name;
    }

    public void setCategory_name(String category_name) {
        this.category_name = category_name;
    }

    public String getCategory_image() {
        return category_image;
    }

    public void setCategory_image(String category_image) {
        this.category_image = category_image;
    }

    @Override
    public boolean equals(Object o) {
        if (o == null || getClass() != o.getClass()) return false;
        Category category = (Category) o;
        return Objects.equals(categoryId, category.categoryId) && Objects.equals(category_name, category.category_name) && Objects.equals(catalog, category.catalog) && Objects.equals(category_image, category.category_image);
    }

    @Override
    public int hashCode() {
        return Objects.hash(categoryId, category_name, catalog, category_image);
    }
}
