package org.example.Catalog;

import jakarta.persistence.*;
import org.example.Basket.Basket;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.util.List;
import java.util.Objects;

@Entity
public class Catalog {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer catalog_ID;
    private String catalog_name;
    private Integer catalog_price;
    private String catalog_description;
    private String catalog_image;

    @OneToMany(mappedBy = "catalog", cascade = CascadeType.ALL, fetch=FetchType.EAGER)
    private List<Basket> basket;


    public Integer getCatalog_ID() {
        return catalog_ID;
    }

    public void setCatalog_ID(Integer catalog_ID) {
        this.catalog_ID = catalog_ID;
    }

    public String getCatalog_name() {
        return catalog_name;
    }

    public void setCatalog_name(String catalog_name) {
        this.catalog_name = catalog_name;
    }

    public Integer getCatalog_price() {
        return catalog_price;
    }

    public void setCatalog_price(Integer catalog_price) {
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

    public Catalog(){}


    @Override
    public boolean equals(Object o) {
        if (o == null || getClass() != o.getClass()) return false;
        Catalog catalog = (Catalog) o;
        return Objects.equals(catalog_ID, catalog.catalog_ID) && Objects.equals(catalog_name, catalog.catalog_name) && Objects.equals(catalog_price, catalog.catalog_price) && Objects.equals(catalog_description, catalog.catalog_description)  && Objects.equals(catalog_image, catalog.catalog_image);
    }

    @Override
    public int hashCode() {
        return Objects.hash(catalog_ID, catalog_name, catalog_price, catalog_description, catalog_image);
    }



}
