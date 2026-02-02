package org.example.Catalog;

import org.example.Category.CategoryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("api/v1/catalog")
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

    @GetMapping("/all")
    public List<CatalogResponse> getAllCatalog() {
        return catalogService.getAllCatalog();
    }
    @GetMapping
    public ResponseEntity<Page<CatalogResponse>> getCatalog(@RequestParam(defaultValue = "0") int page,
                                                          @RequestParam(defaultValue = "5") int size,
                                                          @RequestParam(defaultValue = "catalogId") String sortBy,
                                                            @RequestParam(required = false) Long categoryId,
                                                          @RequestParam(defaultValue = "true") boolean descending) {
        Sort sort = descending ? Sort.by(sortBy).descending() : Sort.by(sortBy).ascending();
        Pageable pageable = PageRequest.of(page, size, sort);


        return ResponseEntity.ok(catalogService.getCatalog(categoryId, pageable));
    }

    @GetMapping("{id}")
    public CatalogResponse getCatalogById(@PathVariable long id) {
        return catalogService.getCatalogById(id);
    }

    @PostMapping("/category/{categoryId}")
    public ResponseEntity<CatalogResponse> addCatalogWithCategory(@Validated  @PathVariable long categoryId, @RequestBody CatalogRequest request) throws IOException {
        CatalogResponse catalog = catalogService.addCatalog(categoryId, request);
        return new ResponseEntity<>(catalog, HttpStatus.CREATED);
    }

    @PostMapping("/image/{id}")
    public ResponseEntity<Void> uploadImage(
            @PathVariable Long id,
            @RequestParam("catalog_image") MultipartFile file
    ) throws IOException {
        catalogService.saveImage(id, file);
        return ResponseEntity.ok().build();
    }
    

    @PutMapping("/{catalogId}/category/{categoryId}")
    public ResponseEntity<CatalogResponse> updateCatalog(@Validated @PathVariable long catalogId, @PathVariable long categoryId, @RequestBody UpdateCatalogRequest request) throws IOException {



        CatalogResponse catalog = catalogService.updateCatalog(catalogId, categoryId, request);
        return new ResponseEntity<>(catalog, HttpStatus.CREATED);
    }


    @DeleteMapping("/{catalogId}")
    public ResponseEntity<Catalog> deleteCatalog(@PathVariable Long catalogId) {
        catalogService.deleteCatalogById(catalogId);
        return null;
    }

    @GetMapping("/search")
    public ResponseEntity<List<Catalog>> searchCatalog(@RequestParam String query) {
        List<Catalog> results = catalogRepository.findByCatalogNameContainingIgnoreCaseAndActiveTrue(query);
        return ResponseEntity.ok(results);
    }
}
