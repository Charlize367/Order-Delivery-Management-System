package org.example.PromoCode;


import org.example.Catalog.CatalogResponse;
import org.example.Category.CategoryRequest;
import org.example.Category.CategoryResponse;
import org.example.Category.UpdateCategoryRequest;
import org.example.PageResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("api/v1/promoCode")
public class PromoCodeController {


    @Autowired
    private PromoCodeService promoCodeService;

    @PostMapping
    public ResponseEntity<PromoCodeResponse> addPromoCode(@Validated @RequestBody PromoCodeRequest request) throws IOException {
        PromoCodeResponse promoCode = promoCodeService.createPromoCode(request);
        return new ResponseEntity<>(promoCode, HttpStatus.CREATED);
    }




    @GetMapping("/all")
    public List<PromoCodeResponse> getAllPromoCodes() {
        return promoCodeService.getAllPromoCodes();
    }

    @GetMapping("{id}")
    public PromoCodeResponse getPromoCode(@PathVariable Long id) {
        return promoCodeService.getPromoCode(id);
    }

    @GetMapping
    public ResponseEntity<PageResponse<PromoCodeResponse>> getPromoCodes(@RequestParam(defaultValue = "0") int page,
                                                                    @RequestParam(defaultValue = "5") int size,
                                                                    @RequestParam(defaultValue = "promoCodeId") String sortBy,
                                                                    @RequestParam(defaultValue = "true") boolean descending) {
        Sort sort = descending ? Sort.by(sortBy).descending() : Sort.by(sortBy).ascending();
        Pageable pageable = PageRequest.of(page, size, sort);


        return ResponseEntity.ok(promoCodeService.getPromoCodes(pageable));
    }

    @PutMapping("/{promoCodeId}")
    public ResponseEntity<PromoCodeResponse> updatePromoCode(@Validated @PathVariable long promoCodeId, @RequestBody PromoCodeRequest request) throws IOException {
        PromoCodeResponse promoCode = promoCodeService.updatePromoCode(promoCodeId, request);
        return new ResponseEntity<>(promoCode, HttpStatus.CREATED);
    }

    @PatchMapping("/{promoCodeId}/deactivate")
    public ResponseEntity<PromoCodeResponse> deactivatePromoCode(@Validated @PathVariable long promoCodeId) throws IOException {
        PromoCodeResponse promoCode = promoCodeService.deactivatePromoCode(promoCodeId);
        return new ResponseEntity<>(promoCode, HttpStatus.CREATED);
    }

    @PatchMapping("/{promoCodeId}/activate")
    public ResponseEntity<PromoCodeResponse> activatePromoCode(@Validated @PathVariable long promoCodeId) throws IOException {
        PromoCodeResponse promoCode = promoCodeService.activatePromoCode(promoCodeId);
        return new ResponseEntity<>(promoCode, HttpStatus.CREATED);
    }

}
