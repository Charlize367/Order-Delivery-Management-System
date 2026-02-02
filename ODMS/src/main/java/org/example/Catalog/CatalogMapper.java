package org.example.Catalog;

import org.example.Basket.Basket;
import org.example.Basket.BasketResponse;
import org.example.Category.Category;
import org.example.Category.CategoryMapper;
import org.example.Category.CategoryResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.stream.Collectors;

@Component
public class CatalogMapper {


    private final CategoryMapper categoryMapper;

    public CatalogMapper(CategoryMapper categoryMapper) {
        this.categoryMapper = categoryMapper;
    }

    public Catalog toEntity(CatalogRequest req, Category category) {

        Catalog catalog = new Catalog();
        catalog.setCatalogName(req.getCatalogName());
        catalog.setCatalog_description(req.getCatalog_description());
        catalog.setCatalog_price(req.getCatalog_price());
        catalog.setCategory(category);
        return catalog;
    }

    public CatalogResponse toResponse(Catalog catalog) {
        CatalogResponse catalogResponse = new CatalogResponse();
        catalogResponse.setCatalogId(catalog.getCatalogId());
        catalogResponse.setCatalogName(catalog.getCatalogName());
        catalogResponse.setCatalog_description(catalog.getCatalog_description());
        catalogResponse.setCatalog_price(catalog.getCatalog_price());
        if (catalog.getCategory() != null) {
            CategoryResponse catRes = new CategoryResponse();
            catRes.setCategoryId(catalog.getCategory().getCategoryId());
            catRes.setCategory_name(catalog.getCategory().getCategory_name());
            catalogResponse.setCategory(catRes);
        } else {
            catalogResponse.setCategory(null);
        }
        catalogResponse.setCatalog_image(catalog.getCatalog_image());
        return catalogResponse;
    }

    public List<CatalogResponse> toListResponse(List<Catalog> catalogs) {
        return catalogs.stream()
                .map(catalog -> {
                    CatalogResponse catalogResponse = new CatalogResponse();
                    catalogResponse.setCatalogId(catalog.getCatalogId());
                    catalogResponse.setCatalogName(catalog.getCatalogName());
                    catalogResponse.setCatalog_description(catalog.getCatalog_description());
                    catalogResponse.setCatalog_price(catalog.getCatalog_price());
                    if (catalog.getCategory() != null) {
                        CategoryResponse catRes = new CategoryResponse();
                        catRes.setCategoryId(catalog.getCategory().getCategoryId());
                        catRes.setCategory_name(catalog.getCategory().getCategory_name());
                        catalogResponse.setCategory(catRes);
                    } else {
                        catalogResponse.setCategory(null);
                    }
                    catalogResponse.setCatalog_image(catalog.getCatalog_image());
                    return catalogResponse;
                })
                .collect(Collectors.toList());
    }
}
