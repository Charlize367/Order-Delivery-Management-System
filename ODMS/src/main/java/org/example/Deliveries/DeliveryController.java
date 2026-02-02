package org.example.Deliveries;

import org.example.Basket.Basket;
import org.example.Catalog.Catalog;
import org.example.Category.CategoryResponse;
import org.example.Orders.OrderStatus;
import org.example.Orders.Orders;
import org.example.Orders.OrdersRepository;
import org.example.Users.Users;
import org.example.Users.UsersRepository;
import org.springframework.beans.factory.annotation.Autowired;
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
@RequestMapping("api/v1/delivery")
public class DeliveryController {

    private final DeliveryService deliveryService;

    public DeliveryController(DeliveryService deliveryService) {
        this.deliveryService = deliveryService;
    }

    @GetMapping("/all")
    public List<DeliveryResponse> getAllDeliveries() {
        return deliveryService.getAllDeliveries();
    }

    @GetMapping
    public ResponseEntity<Page<DeliveryResponse>> getDeliveries(@RequestParam(defaultValue = "0") int page,
                                                                @RequestParam(defaultValue = "5") int size,
                                                                @RequestParam(defaultValue = "deliveryId") String sortBy,
                                                                @RequestParam(required = false) Long customerId,
                                                                @RequestParam(required = false) Long driverId,
                                                                @RequestParam(defaultValue = "true") boolean descending) {
        Sort sort = descending ? Sort.by(sortBy).descending() : Sort.by(sortBy).ascending();
        Pageable pageable = PageRequest.of(page, size, sort);


        return ResponseEntity.ok(deliveryService.getDeliveries(customerId, driverId, pageable));
    }

    @GetMapping("{id}")
    public DeliveryResponse getDeliveriesById(@PathVariable long id) {
        return deliveryService.getDeliveriesById(id);
    }


    @GetMapping("/users/customer/{userId}")
    public ResponseEntity<List<DeliveryResponse>> getUserDeliveries(@PathVariable Long userId) {
       List<DeliveryResponse> deliveries = deliveryService.getDeliveriesByUser(userId);
       return ResponseEntity.ok(deliveries);
    }

    @GetMapping("/users/delivery/{userId}")
    public ResponseEntity<List<DeliveryResponse>> getDeliveriesForDeliveryMan(@PathVariable Long userId) {
        List<DeliveryResponse> deliveries = deliveryService.getDeliveriesByDeliveryMen(userId);
        return ResponseEntity.ok(deliveries);
    }

    @PostMapping
    public ResponseEntity<DeliveryResponse> addDeliveries(@Validated @RequestBody DeliveryRequest request) {
        DeliveryResponse delivery = deliveryService.addDeliveries(request);
        return new ResponseEntity<>(delivery, HttpStatus.CREATED);
    }


    @PutMapping("/deliveryStatus/{deliveryId}")
    public ResponseEntity<DeliveryResponse> updateDeliveryStatus(@Validated @PathVariable long deliveryId, @RequestBody DeliveryStatus deliveryStatus) {
        DeliveryResponse updatedDelivery = deliveryService.updateDeliveryStatus(deliveryId, deliveryStatus);
        return new ResponseEntity<>(updatedDelivery, HttpStatus.OK);
    }

    @PutMapping("/estimatedTime/{deliveryId}")
    public ResponseEntity<DeliveryResponse> updateEstimatedTime(@Validated @PathVariable long deliveryId, @RequestBody EstimatedTime estimatedTime) {
        DeliveryResponse updatedDelivery = deliveryService.updateEstimatedTime(deliveryId, estimatedTime);
        return new ResponseEntity<>(updatedDelivery, HttpStatus.OK);
    }

    @PutMapping("/deliveredTime/{deliveryId}")
    public ResponseEntity<DeliveryResponse> updateDeliveredTime(@Validated @PathVariable long deliveryId, @RequestBody DeliveredTime deliveredTime) {
        DeliveryResponse updatedDelivery = deliveryService.updateDeliveredTime(deliveryId, deliveredTime);
        return new ResponseEntity<>(updatedDelivery, HttpStatus.OK);
    }

    @PutMapping("/{deliveryId}/drivers/{userId}")
    public ResponseEntity<DeliveryResponse> updatedDriver(@Validated @PathVariable long deliveryId, @PathVariable long userId) {
        DeliveryResponse updatedDelivery = deliveryService.updateDeliveryDriver(deliveryId, userId);
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

    @DeleteMapping("/{deliveryId}")
    public ResponseEntity<DeliveryResponse> deleteDeliveries(@PathVariable Long deliveryId) {
        deliveryService.deleteDeliveries(deliveryId);
        return null;
    }
}
