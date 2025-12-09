package org.example.Catalog;

import org.example.Category.Category;
import org.example.Category.CategoryRepository;
import org.example.Deliveries.Deliveries;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("catalog")
public class CatalogController {

    @Autowired
    CatalogRepository catalogRepository;

    @Autowired
    CategoryRepository categoryRepository;

    private final CatalogService catalogService;

    public static String uploadDirectory = System.getProperty("user.dir") + "/src/main/resources/static/images";


    public CatalogController(CatalogService catalogService) {
        this.catalogService = catalogService;
    }

    @GetMapping
    public List<Catalog> getCatalog() {
        return catalogService.getAllCatalog();
    }

    @GetMapping("{id}")
    public Catalog getCatalogById(@PathVariable long id) {
        return catalogService.getCatalogById(id);
    }

    @GetMapping("/category/{categoryId}")
    public List<Catalog> getCatalogByCategory(@PathVariable Long categoryId){
        return catalogService.getCatalogByCategory(categoryId);
    }

    @PostMapping("/category/{categoryId}")
    public ResponseEntity<Catalog> addCatalogWithCategory( @PathVariable long categoryId, @RequestParam("catalogName") String catalogName,
                                               @RequestParam("catalog_price") Double catalog_price, @RequestParam("catalog_description") String catalog_description, @RequestParam("catalog_image") MultipartFile catalog_image) throws IOException {
        Catalog catalog = catalogService.addCatalog(categoryId, catalogName, catalog_price, catalog_description, catalog_image );
        return new ResponseEntity<>(catalog, HttpStatus.CREATED);
    }
    

    @PutMapping("/{catalogId}/category/{category_ID}")
    public ResponseEntity<Catalog> updateCatalog(@PathVariable long catalogId, @PathVariable long categoryId, @RequestParam("catalogName") String catalogName,
                                                 @RequestParam("catalog_price") Double catalog_price, @RequestParam("catalog_description") String catalog_description, @RequestParam("catalog_image") String catalog_image) throws IOException {



        Catalog catalog = catalogService.updateCatalog(catalogId, categoryId, catalogName, catalog_price, catalog_description, catalog_image );
        return new ResponseEntity<>(catalog, HttpStatus.CREATED);
    }


    @DeleteMapping("/{catalogId}")
    public ResponseEntity<Catalog> deleteCatalog(@PathVariable Long catalogId) {
        catalogService.deleteCatalogById(catalogId);
        return null;
    }

    @GetMapping("/search")
    public ResponseEntity<List<Catalog>> searchCatalog(@RequestParam String query) {
        List<Catalog> results = catalogRepository.findByCatalogNameContainingIgnoreCase(query);
        return ResponseEntity.ok(results);
    }
}
