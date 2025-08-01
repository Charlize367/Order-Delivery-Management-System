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

    @PutMapping("/{delivery_ID}/users/{user_ID}")
    public Deliveries addUserToDeliveries(@PathVariable int delivery_ID, @PathVariable int user_ID) {
        Deliveries deliveries = deliveryRepository.findById(delivery_ID).get();
        Users users = usersRepository.findById(user_ID).get();
        deliveries.setDelivery_men(users);
        return deliveryRepository.save(deliveries);
    }

    @PutMapping("/{delivery_ID}/orders/{orders_ID}")
    public Deliveries addOrderToDelivery(@PathVariable int delivery_ID, @PathVariable int orders_ID) {
        Deliveries deliveries = deliveryRepository.findById(delivery_ID).get();
        Orders orders = ordersRepository.findById(orders_ID).get();
        deliveries.setOrders(orders);
        return deliveryRepository.save(deliveries);
    }

    @DeleteMapping("/{delivery_ID}")
    public ResponseEntity<Deliveries> deleteDeliveries(@PathVariable Integer delivery_ID, Deliveries deliveries) {
        deliveryService.deleteDeliveries(deliveries, delivery_ID);
        return null;
    }
}
