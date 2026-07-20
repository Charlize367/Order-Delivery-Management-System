package org.example.Kitchen;


import org.example.OrderItems.OrderItemsResponse;
import org.example.Orders.OrderCancellationReason;
import org.example.Orders.OrderResponse;
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
@RequestMapping("api/v1/kitchen")
public class KitchenController {

    @Autowired
    private KitchenService kitchenService;

    @GetMapping
    public ResponseEntity<Page<OrderResponse>> getQueuedOrders(@RequestParam(defaultValue = "0") int page,
                                                         @RequestParam(defaultValue = "5") int size,
                                                         @RequestParam(defaultValue = "orderId") String sortBy,
                                                         @RequestParam(defaultValue = "true") boolean descending) {
        Sort sort = descending ? Sort.by(sortBy).descending() : Sort.by(sortBy).ascending();
        Pageable pageable = PageRequest.of(page, size, sort);


        return ResponseEntity.ok(kitchenService.getQueuedOrders(pageable));
    }

    @PatchMapping("/preparing/{orderId}")
    public ResponseEntity<OrderResponse> markAsPreparing(@Validated @PathVariable long orderId) {
        OrderResponse orders = kitchenService.markAsPreparing(orderId);
        return new ResponseEntity<>(orders, HttpStatus.OK);
    }

    @PatchMapping("/ready/{orderId}")
    public ResponseEntity<OrderResponse> markAsReady(@Validated @PathVariable long orderId) {
        OrderResponse orders = kitchenService.markAsReady(orderId);
        return new ResponseEntity<>(orders, HttpStatus.OK);
    }

    @PatchMapping("/cancel/{orderId}")
    public ResponseEntity<OrderResponse> cancelOrder(@Validated @PathVariable long orderId, OrderCancellationReason reason) {
        OrderResponse orders = kitchenService.cancelOrder(orderId, reason);
        return new ResponseEntity<>(orders, HttpStatus.OK);
    }


    @GetMapping("/details/{orderId}")
    public OrderResponse getOrderDetails(@PathVariable Long orderId){
        return kitchenService.getOrderDetails(orderId);
    }

}
