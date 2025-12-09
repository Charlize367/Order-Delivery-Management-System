package org.example.Basket;

import org.example.Catalog.Catalog;
import org.example.Catalog.CatalogRepository;
import org.example.Users.Users;
import org.example.Users.UsersRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("basket")
public class BasketController {


    private final BasketService basketService;

    public BasketController(BasketService basketService) {
        this.basketService = basketService;
    }

    @GetMapping
    public List<Basket> getBasket() {
        return basketService.getAllBasket();
    }

    @GetMapping("{id}")
    public Basket getBasketById(@PathVariable long id) {
        return basketService.getBasketById(id);
    }

    @GetMapping("/users/{userId}")
    public List<Basket> getBasketByUser(@PathVariable Long userId){
        return basketService.getBasketByUser(userId);
    }
    @PutMapping("/{basketId}/quantity/{quantity}")
    public ResponseEntity<Basket> updateQuantity(@PathVariable long basketId, @PathVariable int quantity) {
       Basket basket = basketService.updateBasketQuantity(basketId, quantity);
       return new ResponseEntity<>(basket, HttpStatus.OK);
    }

    @PostMapping("/users/{userId}/catalog/{catalogId}")
    public ResponseEntity<Basket> addToBasket(@PathVariable long userId, @PathVariable long catalogId, @RequestBody Basket basket) {
        Basket savedBasket = basketService.addBasket(userId, catalogId, basket);
        return new ResponseEntity<>(savedBasket, HttpStatus.OK);
    }

    @DeleteMapping("/users/{userId}/catalog/{catalogId}")
    public ResponseEntity<String> deleteBasket(@PathVariable Long userId, @PathVariable Long catalogId) {
        basketService.deleteBasket(userId, catalogId);
        return ResponseEntity.ok("Deleted successfully");
    }
}
