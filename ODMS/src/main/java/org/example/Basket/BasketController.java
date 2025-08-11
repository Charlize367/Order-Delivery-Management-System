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

@RestController
@RequestMapping("basket")
public class BasketController {

    @Autowired
    BasketRepository basketRepository;
    private final BasketService basketService;

    @Autowired
    CatalogRepository catalogRepository;

    @Autowired
    UsersRepository usersRepository;


    public BasketController(BasketService basketService) {
        this.basketService = basketService;
    }

    @GetMapping
    public List<Basket> getBasket() {
        return basketService.getAllBasket();
    }

    @GetMapping("{id}")
    public Basket getBasketById(@PathVariable int id) {
        return basketService.getBasketById(id);
    }

    @PostMapping
    public ResponseEntity<Basket> addBasket(@RequestBody Basket basket) {
        basketService.addBasket(basket);
        return new ResponseEntity<>(HttpStatus.CREATED);
    }

    @PutMapping("/{basket_ID}")
    public ResponseEntity<Basket> updateBasket(@PathVariable int basket_ID, @RequestBody Basket basket) {
        Basket updateBaskets = basketService.updateBasket(basket, basket_ID);
        return new ResponseEntity<>(updateBaskets, HttpStatus.OK);
    }

    @PostMapping("/users/{user_ID}")
    public Basket addUserToBasket(@PathVariable int user_ID, @RequestBody Basket basket) {
        Users users = usersRepository.findById(user_ID).get();
        basket.setCustomer(users);
        return basketRepository.save(basket);
    }

    @PostMapping("catalog/{catalog_ID}")
    public Basket addCatalogToBasket(@PathVariable int catalog_ID,  @RequestBody Basket basket) {
        Catalog catalog = catalogRepository.findById(catalog_ID).get();
        basket.setCatalog(catalog);
        return basketRepository.save(basket);
    }

    @DeleteMapping("/{basket_ID}")
    public ResponseEntity<Basket> deleteBasket(@PathVariable Integer basket_ID, Basket basket) {
        basketService.deleteBasket(basket, basket_ID);
        return null;
    }
}
