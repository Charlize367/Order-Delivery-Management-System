package org.example.Catalog;


import org.example.Basket.Basket;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class CatalogService {

    private final CatalogRepository catalogRepository;

    public CatalogService(CatalogRepository catalogRepository) {
        this.catalogRepository = catalogRepository;
    }

    public List<Catalog> getAllCatalog() {
        return catalogRepository.findAll();
    }

    public void addCatalog(Catalog catalog) {
        catalogRepository.save(catalog);
    }


    public Catalog updateCatalog(Catalog catalog, Integer id) {
        Optional<Catalog> catalogs = catalogRepository.findById(id);
        if (catalogs.isPresent()) {
            catalogRepository.save(catalog);
        }
        else {
            return null;
        }
        return catalog;
    }

    public void deleteCatalog(Catalog catalog, Integer id) {
        Optional<Catalog> catalogs = catalogRepository.findById(id);
        if (catalogs.isPresent()) {
            catalogRepository.delete(catalog);
        }
        else {
            return;
        }
    }

    public Catalog getCatalogById(Integer id) {
        return catalogRepository.findById(id)
                .orElseThrow(() -> new IllegalStateException(id + "not found"));
    }
}
