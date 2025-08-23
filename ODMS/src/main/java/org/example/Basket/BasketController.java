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

    @GetMapping("/users/{user_ID}")
    public List<Basket> getBasketByUser(@PathVariable Integer user_ID){
        return basketService.getBasketByUser(user_ID);
    }

    @PostMapping
    public ResponseEntity<Basket> addBasket(@RequestBody Basket basket) {
        basketService.addBasket(basket);
        return new ResponseEntity<>(HttpStatus.CREATED);
    }

    @PutMapping("/{basket_ID}")
    public ResponseEntity<Basket> updateBasket(@PathVariable int basket_ID, @RequestBody Basket basket) {
        Basket updateBaskets = basketService.updateBasket(basket, basket_ID);
        basketRepository.save(basket);
        return new ResponseEntity<>(updateBaskets, HttpStatus.OK);
    }

    @PutMapping("/{basket_ID}/quantity/{quantity}")
    public ResponseEntity<Basket> updateQuantity(@PathVariable int basket_ID, @PathVariable int quantity) {
        Basket basket = basketRepository.findById(basket_ID).get();
        basket.setQuantity(quantity);
        basket.setSubtotal(quantity * basket.getCatalog().getCatalog_price());
        basketRepository.save(basket);
        return new ResponseEntity<>(basket, HttpStatus.OK);
    }

    @PostMapping("/users/{user_ID}/catalog/{catalog_ID}")
    public Basket addUserandCatalogToBasket(@PathVariable int user_ID, @PathVariable int catalog_ID, @RequestBody Basket basket) {

        Optional<Basket>  existingBasket = basketRepository.findByCustomer_UserIdAndCatalog_CatalogId(user_ID, catalog_ID);

        Catalog catalog_price = catalogRepository.findById(catalog_ID).get();
        Basket baskets;
        if (existingBasket.isPresent()) {
             baskets = existingBasket.get();
            baskets.setQuantity(baskets.getQuantity() + 1);
            baskets.setSubtotal(existingBasket.get().getSubtotal() + catalog_price.getCatalog_price() );


        } else {
            Users users = usersRepository.findById(user_ID).get();
            Catalog catalog = catalogRepository.findById(catalog_ID).get();

            baskets = new Basket();
            baskets.setCustomer(users);
            baskets.setCatalog(catalog);
            baskets.setQuantity(basket.getQuantity());
            baskets.setSubtotal(catalog.getCatalog_price() * baskets.getQuantity());



        }

        return basketRepository.save(baskets);

    }

    @DeleteMapping("/{basket_ID}")
    public ResponseEntity<Basket> deleteBasket(@PathVariable Integer basket_ID, Basket basket) {
        basketService.deleteBasket(basket, basket_ID);
        return null;
    }
}
