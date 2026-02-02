package org.example.Orders;

import jakarta.transaction.Transactional;
import org.example.Basket.BasketRepository;
import org.example.Category.CategoryResponse;
import org.example.Deliveries.DeliveryRepository;
import org.example.OrderItems.OrderItemsRepository;
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

@RestController
@RequestMapping("api/v1/orders")
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

    @GetMapping("/all")
    public List<OrderResponse> getAllOrders() {
        return ordersService.getAllOrders();
    }

    @GetMapping
    public ResponseEntity<Page<OrderResponse>> getOrders(@RequestParam(defaultValue = "0") int page,
                                                                @RequestParam(defaultValue = "5") int size,
                                                                @RequestParam(defaultValue = "orderId") String sortBy,
                                                                @RequestParam(defaultValue = "true") boolean descending) {
        Sort sort = descending ? Sort.by(sortBy).descending() : Sort.by(sortBy).ascending();
        Pageable pageable = PageRequest.of(page, size, sort);


        return ResponseEntity.ok(ordersService.getOrders(pageable));
    }

    @GetMapping("{id}")
    public OrderResponse getOrdersById(@PathVariable long id) {
        return ordersService.getOrdersById(id);
    }


    @GetMapping("/users/{userId}")
    public List<OrderResponse> getOrderByUser(@PathVariable Long userId){
        return ordersService.getOrderByUser(userId);
    }

    @PostMapping("/users/{userId}")
    public ResponseEntity<OrderResponse> addOrders(@Validated @PathVariable long userId, @RequestBody OrderRequest orderRequest) {
        OrderResponse orders = ordersService.addOrders(userId, orderRequest);
        return new ResponseEntity<>(orders, HttpStatus.OK);

    }

    @PutMapping("/orderStatus/{orderId}")
    public ResponseEntity<OrderResponse> updateOrderStatus(@Validated @PathVariable long orderId, @RequestBody OrderStatus orderStatus) {
        OrderResponse orders = ordersService.updateOrderStatus(orderId, orderStatus);
        return new ResponseEntity<>(orders, HttpStatus.OK);
    }


    @DeleteMapping("/{orderId}")
    @Transactional
    public ResponseEntity<String> deleteOrders(@PathVariable long orderId) {
        ordersService.deleteOrders(orderId);
        return ResponseEntity.ok("Deleted");
    }
}
