package org.example.Basket;

import org.example.Catalog.Catalog;
import org.example.Catalog.CatalogRepository;
import org.example.Users.Users;
import org.example.Users.UsersRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("api/v1/basket")
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
    public ResponseEntity<Page<BasketResponse>> getBasket(@RequestParam(defaultValue = "0") int page,
                                                                @RequestParam(defaultValue = "5") int size,
                                                                @RequestParam(defaultValue = "basketId") String sortBy,
                                                                @RequestParam(defaultValue = "true") boolean descending) {
        Sort sort = descending ? Sort.by(sortBy).descending() : Sort.by(sortBy).ascending();
        Pageable pageable = PageRequest.of(page, size, sort);


        return ResponseEntity.ok(basketService.getBasket(pageable));
    }


    @GetMapping("{id}")
    @Cacheable("basket")
    public BasketResponse getBasketById(@PathVariable long id) {
        return basketService.getBasketById(id);
    }

    @GetMapping("/users/{userId}")
    public List<BasketResponse> getBasketByUser(@PathVariable Long userId){
        return basketService.getBasketByUser(userId);
    }


    @PutMapping("/{basketId}/quantity/{quantity}")
    public ResponseEntity<BasketResponse> updateQuantity(@Validated @PathVariable long basketId, @PathVariable int quantity) {
       BasketResponse basket = basketService.updateBasketQuantity(basketId, quantity);
       return new ResponseEntity<>(basket, HttpStatus.OK);
    }

    @PostMapping("/users/{userId}/catalog/{catalogId}")
    public ResponseEntity<BasketResponse> addToBasket(@Validated @PathVariable long userId, @PathVariable long catalogId, @RequestBody BasketRequest request) {
        BasketResponse savedBasket = basketService.addBasket(userId, catalogId, request);
        return new ResponseEntity<>(savedBasket, HttpStatus.OK);
    }

    @DeleteMapping("/users/{userId}/catalog/{catalogId}")
    public ResponseEntity<String> deleteBasket(@PathVariable Long userId, @PathVariable Long catalogId) {
        basketService.deleteBasket(userId, catalogId);
        return ResponseEntity.ok("Deleted successfully");
    }
}
