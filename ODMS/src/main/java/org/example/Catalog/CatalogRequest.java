package org.example.Catalog;

import jakarta.validation.constraints.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public class CatalogRequest {
    @NotBlank(message = "Product name cannot be blank")
    @Size(min = 1, max = 50, message = "Name must have at least 1-50 characters")
    private String catalogName;

    @NotBlank(message = "Product description cannot be blank")
    @Size(max = 100, message = "Name must have at least 1-100 characters")
    private String catalog_description;

    @NotNull(message = "Price is required")
    @DecimalMin(value = "0.01", message = "Price must be greater than 0")
    @DecimalMax(value = "1000000.00", message = "Price must not exceed 1,000,000")
    private Double catalog_price;


    @NotNull(message = "Category ID is required")
    private Long categoryId;





    public Long getCategoryId() {
        return categoryId;
    }

    public void setCategoryId(Long categoryId) {
        this.categoryId = categoryId;
    }

    public String getCatalogName() {
        return catalogName;
    }

    public void setCatalogName(String catalogName) {
        this.catalogName = catalogName;
    }

    public String getCatalog_description() {
        return catalog_description;
    }

    public void setCatalog_description(String catalog_description) {
        this.catalog_description = catalog_description;
    }

    public Double getCatalog_price() {
        return catalog_price;
    }

    public void setCatalog_price(Double catalog_price) {
        this.catalog_price = catalog_price;
    }

}
