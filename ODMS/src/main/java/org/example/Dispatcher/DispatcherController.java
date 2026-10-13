package org.example.Dispatcher;

import org.example.Deliveries.DeliveryResponse;
import org.example.Orders.OrderResponse;
import org.example.PageResponse;
import org.example.Users.UserResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Pageable;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/dispatcher")
public class DispatcherController {

    @Autowired
    private DispatcherService dispatcherService;

    @GetMapping("/orders/ready")
    public PageResponse<OrderResponse> getReadyOrders(Pageable pageable) {
        return dispatcherService.getReadyOrders(pageable);
    }

    @GetMapping("/drivers/available")
    public List<UserResponse> getAvailableDrivers() {
        return dispatcherService.getAvailableDrivers();
    }

    @PostMapping("/orders/{orderId}/assign")
    public void assignDriver(
            @PathVariable Long orderId,
            @RequestParam Long driverId
    ) {
        dispatcherService.assignDriver(orderId, driverId);
    }

    @GetMapping("/deliveries/active")
    public List<DeliveryResponse> getActiveDeliveries() {
        return dispatcherService.getActiveDeliveries();
    }
}