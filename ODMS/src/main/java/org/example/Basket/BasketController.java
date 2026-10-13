package org.example.Basket;

import org.example.PageResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/basket")
public class BasketController {

    private final BasketService basketService;

    public BasketController(BasketService basketService) {
        this.basketService = basketService;
    }

    @GetMapping("/all")
    public List<BasketResponse> getAllBasket() {
        return basketService.getAllBasket();
    }

    @GetMapping
    public ResponseEntity<PageResponse<BasketResponse>> getBasket(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "5") int size,
            @RequestParam(defaultValue = "basketId") String sortBy,
            @RequestParam(defaultValue = "true") boolean descending) {

        Sort sort = descending
                ? Sort.by(sortBy).descending()
                : Sort.by(sortBy).ascending();

        Pageable pageable = PageRequest.of(page, size, sort);

        return ResponseEntity.ok(basketService.getBasket(pageable));
    }

    @GetMapping("/{id}")
    public BasketResponse getBasketById(@PathVariable Long id) {
        return basketService.getBasketById(id);
    }

    @GetMapping("/users/{userId}")
    public List<BasketResponse> getBasketByUser(@PathVariable Long userId) {
        return basketService.getBasketByUser(userId);
    }

    @PutMapping("/{basketId}/quantity/{quantity}")
    public ResponseEntity<BasketResponse> updateQuantity(
            @PathVariable Long basketId,
            @PathVariable Integer quantity) {

        BasketResponse basket =
                basketService.updateBasketQuantity(basketId, quantity);

        return ResponseEntity.ok(basket);
    }

    @PostMapping("/users/{userId}/catalog/{catalogId}")
    public ResponseEntity<BasketResponse> addToBasket(
            @PathVariable Long userId,
            @PathVariable Long catalogId,
            @Validated @RequestBody BasketRequest request) {

        BasketResponse savedBasket =
                basketService.addBasket(userId, catalogId, request);

        return ResponseEntity.status(HttpStatus.OK).body(savedBasket);
    }


    @PostMapping("/users/{userId}/combo/{comboId}")
    public ResponseEntity<BasketResponse> addComboToBasket(
            @PathVariable Long userId,
            @PathVariable Long comboId,
            @Validated @RequestBody ComboBasketRequest request) {

        BasketResponse savedBasket =
                basketService.addComboBasket(
                        userId,
                        comboId,
                        request
                );

        return ResponseEntity.ok(savedBasket);
    }



    @PostMapping("/batchBasket")
    public ResponseEntity<List<BasketResponse>> addTemporaryBasket(
            @Validated @RequestBody List<BasketRequest> request) {

        List<BasketResponse> savedBaskets =
                basketService.addTemporaryBasket(request);

        return ResponseEntity.ok(savedBaskets);
    }

    @DeleteMapping("/{basketId}")
    public ResponseEntity<Void> deleteBasket(@PathVariable Long basketId) {

        basketService.deleteBasket(basketId);

        return ResponseEntity.noContent().build();
    }
}

