package org.example.Catalog;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import org.example.Basket.Basket;
import org.example.Category.Category;

import java.util.List;
import java.util.Objects;

@Entity
public class Catalog {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long catalogId;

    @NotBlank(message = "Product name cannot be blank")
    @Size(min = 1, max = 50, message = "Name must have at least 1-50 characters")
    private String catalogName;

    @NotNull(message = "Price is required")
    @DecimalMin(value = "0.01", message = "Price must be greater than 0")
    @DecimalMax(value = "1000000.00", message = "Price must not exceed 1,000,000")
    private Double catalog_price;

    @NotBlank(message = "Product description cannot be blank")
    @Size(max = 100, message = "Name must have at least 1-100 characters")
    private String catalog_description;

    private String catalog_image;

    @OneToMany(mappedBy = "catalog", fetch=FetchType.EAGER)
    private List<Basket> basket;


    @ManyToOne( fetch=FetchType.EAGER)
    @JoinColumn(name = "category_ID")
    private Category category;

    private boolean active = true;


    public Catalog(Long catalogId, String catalogName, Double catalog_price, String catalog_description, String catalog_image, Category category) {
        this.catalogId = catalogId;
        this.catalogName = catalogName;
        this.catalog_price = catalog_price;
        this.catalog_description = catalog_description;
        this.catalog_image = catalog_image;
        this.category = category;
    }


    public Long getCatalogId() {
        return catalogId;
    }

    public void setCatalogId(Long catalogId) {
        this.catalogId = catalogId;
    }

    public String getCatalogName() {
        return catalogName;
    }

    public void setCatalogName(String catalogName) {
        this.catalogName = catalogName;
    }

    public Double getCatalog_price() {
        return catalog_price;
    }

    public void setCatalog_price(Double catalog_price) {
        this.catalog_price = catalog_price;
    }

    public String getCatalog_description() {
        return catalog_description;
    }

    public void setCatalog_description(String catalog_description) {
        this.catalog_description = catalog_description;
    }

    public String getCatalog_image() {
        return catalog_image;
    }

    public void setCatalog_image(String catalog_image) {
        this.catalog_image = catalog_image;
    }


    public Category getCategory() {
        return category;
    }

    public void setCategory(Category category) {
        this.category = category;
    }

    public Catalog(){}

    public boolean isActive() {
        return active;
    }

    public void setActive(boolean active) {
        this.active = active;
    }


    @Override
    public boolean equals(Object o) {
        if (o == null || getClass() != o.getClass()) return false;
        Catalog catalog = (Catalog) o;
        return Objects.equals(catalogId, catalog.catalogId) && Objects.equals(catalogName, catalog.catalogName) && Objects.equals(catalog_price, catalog.catalog_price) && Objects.equals(catalog_description, catalog.catalog_description)  && Objects.equals(catalog_image, catalog.catalog_image) && Objects.equals(category, catalog.category);
    }

    @Override
    public int hashCode() {
        return Objects.hash(catalogId, catalogName, catalog_price, catalog_description, catalog_image, category);
    }



}
