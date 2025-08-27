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


    @GetMapping("/users/customer/{user_ID}")
    public ResponseEntity<List<Deliveries>> getUserDeliveries(@PathVariable Integer user_ID) {
       Users customer = usersRepository.findById(user_ID).get();
       List<Deliveries> deliveries = deliveryRepository.findByOrdersCustomer(customer);
       return ResponseEntity.ok(deliveries);
    }

    @GetMapping("/users/delivery/{user_ID}")
    public ResponseEntity<List<Deliveries>> getDeliveriesForDeliveryMan(@PathVariable Integer user_ID) {
        Users delivery_man = usersRepository.findById(user_ID).get();
        List<Deliveries> deliveries = deliveryRepository.findByDeliveryMen(delivery_man);

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

    @PutMapping("/deliveryStatus/{delivery_ID}")
    public ResponseEntity<Deliveries> updateDeliveryStatus(@PathVariable int delivery_ID, @RequestBody DeliveryStatus deliveryStatus) {
        Deliveries deliveries = deliveryRepository.findById(delivery_ID).get();
        deliveries.setDelivery_status(deliveryStatus.getDelivery_status());
        deliveryRepository.save(deliveries);
        return new ResponseEntity<>(deliveries, HttpStatus.OK);
    }

    @PutMapping("/estimatedTime/{delivery_ID}")
    public ResponseEntity<Deliveries> updateEstimatedTime(@PathVariable int delivery_ID, @RequestBody EstimatedTime estimatedTime) {
        Deliveries deliveries = deliveryRepository.findById(delivery_ID).get();
        deliveries.setEstimated_time(estimatedTime.getEstimated_time());
        deliveryRepository.save(deliveries);
        return new ResponseEntity<>(deliveries, HttpStatus.OK);
    }

    @PutMapping("/deliveredTime/{delivery_ID}")
    public ResponseEntity<Deliveries> updateDeliveredTime(@PathVariable int delivery_ID, @RequestBody DeliveredTime deliveredTime) {
        Deliveries deliveries = deliveryRepository.findById(delivery_ID).get();
        deliveries.setDelivered_time(deliveredTime.getDelivered_time());
        deliveryRepository.save(deliveries);
        return new ResponseEntity<>(deliveries, HttpStatus.OK);
    }

    @PutMapping("/{delivery_ID}/drivers/{userId}")
    public ResponseEntity<Deliveries> updatedDriver(@PathVariable int delivery_ID, @PathVariable int userId) {
        Users deliveryMen = usersRepository.findById(userId).get();
        Deliveries deliveries = deliveryRepository.findById(delivery_ID).get();
        deliveries.setDeliveryMen(deliveryMen);
        return new ResponseEntity<>(deliveries, HttpStatus.OK);
    }


    @PostMapping("/users/{user_ID}")
    public Deliveries addUserToDeliveries(@PathVariable int user_ID, @RequestBody Deliveries deliveries) {
        Users users = usersRepository.findById(user_ID).get();
        deliveries.setDeliveryMen(users);
        return deliveryRepository.save(deliveries);
    }

    @PostMapping("/orders/{orders_ID}")
    public Deliveries addOrderToDelivery(@PathVariable int orders_ID, @RequestBody Deliveries deliveries) {
        Orders orders = ordersRepository.findById(orders_ID).get();
        deliveries.setOrders(orders);
        return deliveryRepository.save(deliveries);
    }

    @PutMapping("/{delivery_ID}/users/{userId}")
    public Deliveries addUserToDeliveries(@PathVariable Integer delivery_ID, @PathVariable Integer userId) {
        Users users = usersRepository.findById(userId).get();
        Deliveries deliveries = deliveryRepository.findById(delivery_ID).get();
        deliveries.setDeliveryMen(users);

        return deliveryRepository.save(deliveries);
    }

    @DeleteMapping("/{delivery_ID}")
    public ResponseEntity<Deliveries> deleteDeliveries(@PathVariable Integer delivery_ID, Deliveries deliveries) {
        deliveryService.deleteDeliveries(deliveries, delivery_ID);
        return null;
    }
}
