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
    public OrderItems getOrderItemsById(@PathVariable int id) {
        return orderItemsService.getOrderItemsById(id);
    }

    @GetMapping("/orders/{order_ID}")
    public List<OrderItems> getOrderItemsByOrders(@PathVariable int order_ID) {
        return orderItemsService.getOrderItemsByOrder(order_ID);
    }

    @PostMapping
    public ResponseEntity<OrderItems> createOrderItems(@RequestBody OrderItems orderItems) {
        orderItemsService.addOrderItems(orderItems);
        return new ResponseEntity<>(HttpStatus.CREATED);
    }

    @PutMapping("/{orderItems_ID}")
    public ResponseEntity<OrderItems> updateOrderItems(@PathVariable int orderItems_ID, @RequestBody OrderItems orderItems) {
        OrderItems updateOrderItems = orderItemsService.updateOrderItems(orderItems, orderItems_ID);
        return new ResponseEntity<>(updateOrderItems, HttpStatus.OK);
    }

    @PutMapping("orders/{orders_ID}")
    public OrderItems addOrderItemsToOrder(@PathVariable int orders_ID, @RequestBody OrderItems orderItems) {
        Orders orders = ordersRepository.findById(orders_ID).get();
        orderItems.setOrders(orders);
        return orderItemsRepository.save(orderItems);
    }

    @DeleteMapping("/{orderItems_ID}")
    public ResponseEntity<OrderItems> deleteOrderItems(@PathVariable Integer orderItems_ID, OrderItems orderItems) {
        orderItemsService.deleteOrderItems(orderItems, orderItems_ID);
        return null;
    }
}
