package org.example.Catalog;

import org.example.Deliveries.Deliveries;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("catalog")
public class CatalogController {

    @Autowired
    CatalogRepository catalogRepository;
    private final CatalogService catalogService;


    public CatalogController(CatalogService catalogService) {
        this.catalogService = catalogService;
    }

    @GetMapping
    public List<Catalog> getCatalog() {
        return catalogService.getAllCatalog();
    }

    @GetMapping("{id}")
    public Catalog getCatalogById(@PathVariable int id) {
        return catalogService.getCatalogById(id);
    }

    @PostMapping
    public ResponseEntity<Catalog> addCatalog(@RequestBody Catalog catalog) {
        catalogService.addCatalog(catalog);
        return new ResponseEntity<>(HttpStatus.CREATED);
    }

    @PutMapping("/{catalog_ID}")
    public ResponseEntity<Catalog> updateCatalog(@PathVariable int catalog_ID, @RequestBody Catalog catalog) {
        Catalog updateCatalogs = catalogService.updateCatalog(catalog, catalog_ID);
        return new ResponseEntity<>(updateCatalogs, HttpStatus.OK);
    }

    @DeleteMapping("/{catalog_ID}")
    public ResponseEntity<Catalog> deleteCatalog(@PathVariable Integer catalog_ID, Catalog catalog) {
        catalogService.deleteCatalog(catalog, catalog_ID);
        return null;
    }
}
