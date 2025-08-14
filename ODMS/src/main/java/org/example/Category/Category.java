package org.example.Category;


import jakarta.persistence.*;
import org.example.Catalog.Catalog;

import java.util.List;
import java.util.Objects;

@Entity
public class Category {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Integer category_ID;
    private String category_name;
    private String category_image;

    @OneToMany(mappedBy = "category", cascade = CascadeType.ALL, fetch = FetchType.EAGER)
    private List<Catalog> catalog;


    public Category(){}

    public Category(Integer category_ID, String category_name, String category_image) {
        this.category_ID = category_ID;
        this.category_name = category_name;
        this.category_image = category_image;
    }

    public Integer getCategory_ID() {
        return category_ID;
    }

    public void setCategory_ID(Integer category_ID) {
        this.category_ID = category_ID;
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
        return Objects.equals(category_ID, category.category_ID) && Objects.equals(category_name, category.category_name) && Objects.equals(catalog, category.catalog) && Objects.equals(category_image, category.category_image);
    }

    @Override
    public int hashCode() {
        return Objects.hash(category_ID, category_name, catalog, category_image);
    }
}
