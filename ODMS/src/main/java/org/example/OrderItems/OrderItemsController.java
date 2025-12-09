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
@RequestMapping("orderItems")
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
    public List<OrderItems> getOrderItems() {
        return orderItemsService.getAllOrderItems();
    }

    @GetMapping("{id}")
    public OrderItems getOrderItemsById(@PathVariable long id) {
        return orderItemsService.getOrderItemsById(id);
    }

    @GetMapping("/orders/{order_ID}")
    public List<OrderItems> getOrderItemsByOrders(@PathVariable long orderId) {
        return orderItemsService.getOrderItemsByOrder(orderId);
    }

    @PostMapping
    public ResponseEntity<OrderItems> createOrderItems(@RequestBody OrderItems orderItems) {
        orderItemsService.addOrderItems(orderItems);
        return new ResponseEntity<>(HttpStatus.CREATED);
    }


    @DeleteMapping("/{orderItems_ID}")
    public ResponseEntity<OrderItems> deleteOrderItems(@PathVariable Long orderItemsId, OrderItems orderItems) {
        orderItemsService.deleteOrderItems(orderItems, orderItemsId);
        return null;
    }
}
