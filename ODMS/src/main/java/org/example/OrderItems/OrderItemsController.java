package org.example.OrderItems;

import org.example.Deliveries.Deliveries;
import org.example.Orders.Orders;
import org.example.Orders.OrdersRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("api/v1/orderItems")
public class OrderItemsController {

    @Autowired
    OrderItemsRepository orderItemsRepository;
    private final OrderItemsService orderItemsService;

    @Autowired
    OrdersRepository ordersRepository;


    public OrderItemsController(OrderItemsService orderItemsService) {
        this.orderItemsService = orderItemsService;
    }

    @GetMapping
    public List<OrderItemsResponse> getOrderItems() {
        return orderItemsService.getAllOrderItems();
    }

    @GetMapping("{id}")
    public OrderItemsResponse getOrderItemsById(@PathVariable long id) {
        return orderItemsService.getOrderItemsById(id);
    }

    @GetMapping("/orders/{orderId}")
    public List<OrderItemsResponse> getOrderItemsByOrders(@PathVariable long orderId) {
        return orderItemsService.getOrderItemsByOrder(orderId);
    }

}
