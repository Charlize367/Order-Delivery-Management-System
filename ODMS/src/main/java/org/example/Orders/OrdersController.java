package org.example.Orders;

import jakarta.transaction.Transactional;
import org.example.Basket.BasketRepository;
import org.example.Deliveries.DeliveryRepository;
import org.example.OrderItems.OrderItemsRepository;
import org.example.Users.UsersRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("orders")
public class OrdersController {

    @Autowired
    OrdersRepository ordersRepository;

    @Autowired
    UsersRepository usersRepository;

    @Autowired
    BasketRepository basketRepository;

    @Autowired
    OrderItemsRepository orderItemsRepository;

    @Autowired
    DeliveryRepository deliveryRepository;


    private final OrdersService ordersService;

    public OrdersController(OrdersService ordersService) {
        this.ordersService = ordersService;
    }

    @GetMapping
    public List<Orders> getOrders() {
        return ordersService.getAllOrders();
    }

    @GetMapping("{id}")
    public Orders getOrdersById(@PathVariable long id) {
        return ordersService.getOrdersById(id);
    }


    @GetMapping("/users/{userId}")
    public List<Orders> getOrderByUser(@PathVariable Long userId){
        return ordersService.getOrderByUser(userId);
    }

    @PostMapping("/users/{user_ID}")
    public ResponseEntity<Orders> addOrders(@PathVariable long userId, @RequestBody OrderRequest orderRequest) {
        Orders orders = ordersService.addOrders(userId, orderRequest);
        return new ResponseEntity<>(orders, HttpStatus.OK);

    }

    @PutMapping("/orderStatus/{order_ID}")
    public ResponseEntity<Orders> updateOrderStatus(@PathVariable long orderId, @RequestBody OrderStatus orderStatus) {
        Orders orders = ordersService.updateOrderStatus(orderId, orderStatus);
        return new ResponseEntity<>(orders, HttpStatus.OK);
    }


    @DeleteMapping("/{orders_ID}")
    @Transactional
    public ResponseEntity<String> deleteOrders(@PathVariable long orderId) {
        ordersService.deleteOrders(orderId);
        return ResponseEntity.ok("Deleted");
    }
}
