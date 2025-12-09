package org.example.Deliveries;

import org.example.Basket.Basket;
import org.example.Catalog.Catalog;
import org.example.Orders.OrderStatus;
import org.example.Orders.Orders;
import org.example.Orders.OrdersRepository;
import org.example.Users.Users;
import org.example.Users.UsersRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("delivery")
public class DeliveryController {

    private final DeliveryService deliveryService;

    public DeliveryController(DeliveryService deliveryService) {
        this.deliveryService = deliveryService;
    }

    @GetMapping
    public List<Deliveries> getDeliveries() {
        return deliveryService.getAllDeliveries();
    }

    @GetMapping("{id}")
    public Deliveries getDeliveriesById(@PathVariable long id) {
        return deliveryService.getDeliveriesById(id);
    }


    @GetMapping("/users/customer/{userId}")
    public ResponseEntity<List<Deliveries>> getUserDeliveries(@PathVariable Long userId) {
       List<Deliveries> deliveries = deliveryService.getDeliveriesByUser(userId);
       return ResponseEntity.ok(deliveries);
    }

    @GetMapping("/users/delivery/{userId}")
    public ResponseEntity<List<Deliveries>> getDeliveriesForDeliveryMan(@PathVariable Long userId) {
        List<Deliveries> deliveries = deliveryService.getDeliveriesByDeliveryMen(userId);
        return ResponseEntity.ok(deliveries);
    }

    @PostMapping
    public ResponseEntity<Deliveries> addDeliveries(@RequestBody Deliveries deliveries) {
        Deliveries delivery = deliveryService.addDeliveries(deliveries);
        return new ResponseEntity<>(delivery, HttpStatus.CREATED);
    }

    @PutMapping("/{delivery_ID}")
    public ResponseEntity<Deliveries> updateDeliveries(@PathVariable long deliveryId, @RequestBody Deliveries deliveries) {
        Deliveries updatedDelivery = deliveryService.updateDeliveries(deliveries, deliveryId);
        return new ResponseEntity<>(updatedDelivery, HttpStatus.OK);
    }

    @PutMapping("/deliveryStatus/{delivery_ID}")
    public ResponseEntity<Deliveries> updateDeliveryStatus(@PathVariable long deliveryId, @RequestBody DeliveryStatus deliveryStatus) {
        Deliveries updatedDelivery = deliveryService.updateDeliveryStatus(deliveryId, deliveryStatus);
        return new ResponseEntity<>(updatedDelivery, HttpStatus.OK);
    }

    @PutMapping("/estimatedTime/{delivery_ID}")
    public ResponseEntity<Deliveries> updateEstimatedTime(@PathVariable long deliveryId, @RequestBody EstimatedTime estimatedTime) {
        Deliveries updatedDelivery = deliveryService.updateEstimatedTime(deliveryId, estimatedTime);
        return new ResponseEntity<>(updatedDelivery, HttpStatus.OK);
    }

    @PutMapping("/deliveredTime/{delivery_ID}")
    public ResponseEntity<Deliveries> updateDeliveredTime(@PathVariable long deliveryId, @RequestBody DeliveredTime deliveredTime) {
        Deliveries updatedDelivery = deliveryService.updateDeliveredTime(deliveryId, deliveredTime);
        return new ResponseEntity<>(updatedDelivery, HttpStatus.OK);
    }

    @PutMapping("/{delivery_ID}/drivers/{userId}")
    public ResponseEntity<Deliveries> updatedDriver(@PathVariable long deliveryId, @PathVariable long userId) {
        Deliveries updatedDelivery = deliveryService.updateDeliveryDriver(deliveryId, userId);
        return new ResponseEntity<>(updatedDelivery, HttpStatus.OK);
    }
//    @PostMapping("/users/{user_ID}")
//    public Deliveries addUserToDeliveries(@PathVariable int user_ID, @RequestBody Deliveries deliveries) {
//        Users users = usersRepository.findById(user_ID).get();
//        deliveries.setDeliveryMen(users);
//        return deliveryRepository.save(deliveries);
//    }

//    @PostMapping("/orders/{orders_ID}")
//    public Deliveries addOrderToDelivery(@PathVariable int orders_ID, @RequestBody Deliveries deliveries) {
//        Orders orders = ordersRepository.findById(orders_ID).get();
//        deliveries.setOrders(orders);
//        return deliveryRepository.save(deliveries);
//    }
//
//    @PutMapping("/{delivery_ID}/users/{userId}")
//    public Deliveries addUserToDeliveries(@PathVariable Integer delivery_ID, @PathVariable Integer userId) {
//        Users users = usersRepository.findById(userId).get();
//        Deliveries deliveries = deliveryRepository.findById(delivery_ID).get();
//        deliveries.setDeliveryMen(users);
//
//        return deliveryRepository.save(deliveries);
//    }

    @DeleteMapping("/{delivery_ID}")
    public ResponseEntity<Deliveries> deleteDeliveries(@PathVariable Long deliveryId, Deliveries deliveries) {
        deliveryService.deleteDeliveries(deliveries, deliveryId);
        return null;
    }
}
