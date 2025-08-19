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
    public Catalog getCatalogById(@PathVariable int id) {
        return catalogService.getCatalogById(id);
    }

    @GetMapping("/category/{category_ID}")
    public List<Catalog> getCatalogByCategory(@PathVariable Integer category_ID){
        return catalogService.getCatalogByCategory(category_ID);
    }

    @PostMapping
    public ResponseEntity<Catalog> addCatalog( @RequestParam("catalog_name") String catalog_name,
                                              @RequestParam("catalog_price") Integer catalog_price, @RequestParam("catalog_description") String catalog_description, @RequestParam("catalog_image") MultipartFile catalog_image) throws IOException {
        String originalFilename = catalog_image.getOriginalFilename();
        Path fileNameAndPath = Paths.get(uploadDirectory, originalFilename);
        Files.write(fileNameAndPath, catalog_image.getBytes());

        Catalog catalog = new Catalog();
        catalog.setCatalog_name(catalog_name);
        catalog.setCatalog_price(catalog_price);
        catalog.setCatalog_description(catalog_description);
        catalog.setCatalog_image(originalFilename);

        catalogService.addCatalog(catalog);
        return new ResponseEntity<>(HttpStatus.CREATED);
    }

    @PostMapping("/category/{category_ID}")
    public ResponseEntity<Catalog> addCatalogWithCategory( @PathVariable int category_ID, @RequestParam("catalog_name") String catalog_name,
                                               @RequestParam("catalog_price") Integer catalog_price, @RequestParam("catalog_description") String catalog_description, @RequestParam("catalog_image") MultipartFile catalog_image) throws IOException {
        Category category = categoryRepository.findById(category_ID).get();



        String originalFilename = catalog_image.getOriginalFilename();
        Path fileNameAndPath = Paths.get(uploadDirectory, originalFilename);
        Files.write(fileNameAndPath, catalog_image.getBytes());

        Catalog catalog = new Catalog();
        catalog.setCatalog_name(catalog_name);
        catalog.setCatalog_price(catalog_price);
        catalog.setCatalog_description(catalog_description);
        catalog.setCatalog_image(originalFilename);
        catalog.setCategory(category);

        catalogService.addCatalog(catalog);
        return new ResponseEntity<>(HttpStatus.CREATED);
    }
    

    @PutMapping("/{catalog_ID}/category/{category_ID}")
    public ResponseEntity<Catalog> updateCatalog(@PathVariable int catalog_ID, @PathVariable int category_ID, @RequestParam("catalog_name") String catalog_name,
                                                 @RequestParam("catalog_price") Integer catalog_price, @RequestParam("catalog_description") String catalog_description, @RequestParam("catalog_image") MultipartFile catalog_image) throws IOException {

        Category category = categoryRepository.findById(category_ID).get();

        String originalFilename = catalog_image.getOriginalFilename();
        Path fileNameAndPath = Paths.get(uploadDirectory, originalFilename);
        Files.write(fileNameAndPath, catalog_image.getBytes());

        Catalog catalog = catalogRepository.findById(catalog_ID).get();
        catalog.setCatalog_ID(catalog_ID);
        catalog.setCatalog_name(catalog_name);
        catalog.setCatalog_price(catalog_price);
        catalog.setCatalog_description(catalog_description);
        catalog.setCatalog_image(originalFilename);
        catalog.setCategory(category);

        catalogService.updateCatalog(catalog, catalog_ID);
        return new ResponseEntity<>(HttpStatus.CREATED);
    }


    @DeleteMapping("/{catalog_ID}")
    public ResponseEntity<Catalog> deleteCatalog(@PathVariable Integer catalog_ID, Catalog catalog) {
        catalogService.deleteCatalog(catalog, catalog_ID);
        return null;
    }
}
