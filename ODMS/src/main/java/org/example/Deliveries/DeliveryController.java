package org.example.Deliveries;

import org.example.Basket.Basket;
import org.example.Catalog.Catalog;
import org.example.Orders.Orders;
import org.example.Orders.OrdersRepository;
import org.example.Users.Users;
import org.example.Users.UsersRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("delivery")
public class DeliveryController {

    @Autowired
    DeliveryRepository deliveryRepository;
    private final DeliveryService deliveryService;

    @Autowired
    OrdersRepository ordersRepository;

    @Autowired
    UsersRepository usersRepository;


    public DeliveryController(DeliveryService deliveryService) {
        this.deliveryService = deliveryService;
    }

    @GetMapping
    public List<Deliveries> getDeliveries() {
        return deliveryService.getAllDeliveries();
    }

    @GetMapping("{id}")
    public Deliveries getDeliveriesById(@PathVariable int id) {
        return deliveryService.getDeliveriesById(id);
    }


    @GetMapping("/user/{user_ID}/deliveries")
    public ResponseEntity<List<Deliveries>> getUserDeliveries(@PathVariable Integer user_ID) {
        List<Deliveries> deliveries = deliveryRepository.findByOrderCustomerID(user_ID);
        return ResponseEntity.ok(deliveries);
    }

    @PostMapping
    public ResponseEntity<Deliveries> addDeliveries(@RequestBody Deliveries deliveries) {
        deliveryService.addDeliveries(deliveries);
        return new ResponseEntity<>(HttpStatus.CREATED);
    }

    @PutMapping("/{delivery_ID}")
    public ResponseEntity<Deliveries> updateDeliveries(@PathVariable int delivery_ID, @RequestBody Deliveries deliveries) {
        Deliveries updateDelivery = deliveryService.updateDeliveries(deliveries, delivery_ID);
        return new ResponseEntity<>(updateDelivery, HttpStatus.OK);
    }


    @PostMapping("/users/{user_ID}")
    public Deliveries addUserToDeliveries(@PathVariable int user_ID, @RequestBody Deliveries deliveries) {
        Users users = usersRepository.findById(user_ID).get();
        deliveries.setDelivery_men(users);
        return deliveryRepository.save(deliveries);
    }

    @PostMapping("/orders/{orders_ID}")
    public Deliveries addOrderToDelivery(@PathVariable int orders_ID, @RequestBody Deliveries deliveries) {
        Orders orders = ordersRepository.findById(orders_ID).get();
        deliveries.setOrders(orders);
        return deliveryRepository.save(deliveries);
    }

    @PostMapping("/users/{username}/orders/{order_ID}")
    public Deliveries addUserAndOrderToDeliveries(@PathVariable String username, @PathVariable int order_ID, @RequestBody Deliveries deliveries) {
        Users users = usersRepository.findByUsername(username);
        Orders orders = ordersRepository.findById(order_ID).get();
        deliveries.setDelivery_men(users);
        deliveries.setOrders(orders);
        return deliveryRepository.save(deliveries);
    }

    @DeleteMapping("/{delivery_ID}")
    public ResponseEntity<Deliveries> deleteDeliveries(@PathVariable Integer delivery_ID, Deliveries deliveries) {
        deliveryService.deleteDeliveries(deliveries, delivery_ID);
        return null;
    }
}
