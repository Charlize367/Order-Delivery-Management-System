package org.example.Catalog;

import jakarta.validation.constraints.*;
import org.example.Category.CategoryResponse;
import org.springframework.web.multipart.MultipartFile;

import java.io.Serializable;

public class CatalogResponse implements Serializable {

    private static final long serialVersionUID = 1L;


    private Long catalogId;
    private String catalogName;


    private String catalog_description;


    private Double catalog_price;

    private String catalog_image;


    private CategoryResponse category;

    public Long getCatalogId() {
        return catalogId;
    }

    public void setCatalogId(Long catalogId) {
        this.catalogId = catalogId;
    }

    public CategoryResponse getCategory() {
        return category;
    }

    public void setCategory(CategoryResponse category) {
        this.category = category;
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

    public String getCatalog_image() {
        return catalog_image;
    }

    public void setCatalog_image(String catalog_image) {
        this.catalog_image = catalog_image;
    }
}
