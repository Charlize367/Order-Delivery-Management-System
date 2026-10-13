package org.example.Dispatcher;

import jakarta.transaction.Transactional;
import org.example.Deliveries.Deliveries;
import org.example.Deliveries.DeliveryMapper;
import org.example.Deliveries.DeliveryRepository;
import org.example.Deliveries.DeliveryResponse;
import org.example.Events.DriverAssignedEvent;
import org.example.Exception.ResourceNotFoundException;
import org.example.Orders.*;
import org.example.PageResponse;
import org.example.Users.UserMapper;
import org.example.Users.UserResponse;
import org.example.Users.Users;
import org.example.Users.UsersRepository;
import org.example.Validator.OrderStatusTransitionValidator;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.context.event.EventListener;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.Collections;
import java.util.List;

@Service
public class DispatcherService {

    private static final Logger logger = LoggerFactory.getLogger(DispatcherService.class);

    @Autowired
    private OrdersRepository ordersRepository;

    @Autowired
    private UsersRepository usersRepository;

    @Autowired
    private DeliveryRepository deliveryRepository;

    @Autowired
    private OrderMapper orderMapper;

    @Autowired
    private UserMapper userMapper;

    @Autowired
    private DeliveryMapper deliveryMapper;


    @Autowired
    private OrderStatusTransitionValidator validator;

    @Autowired
    private ApplicationEventPublisher publisher;

    @EventListener(ApplicationReadyEvent.class)
    @CacheEvict(value = {"readyOrders", "availableDrivers", "activeDeliveries"}, allEntries = true)
    public void clearCacheOnStartup() {
        logger.info("Application Ready: Internal and External Caches have been nuked to sync with Database.");
    }



    @Cacheable(value = "readyOrders", key = "'page_'+#pageable.pageNumber+'_'+#pageable.pageSize+'_'+#pageable.sort.toString()")
    public PageResponse<OrderResponse> getReadyOrders(Pageable pageable) {
        logger.info("Displaying ready orders");


        Page<Orders> page = ordersRepository.getKitchenQueue(Collections.singleton(OrderStatuses.READY), pageable);

        Page<OrderResponse> mapped = page.map(orderMapper::toResponse);

        return new PageResponse<>(mapped);
    }

    public List<UserResponse> getAvailableDrivers() {
        logger.info("Displaying all users");
        return usersRepository.getByRole("DELIVERY").stream()
                .map(userMapper::toResponse)
                .toList();
    }

    @CacheEvict(value = {"readyOrders", "availableDrivers", "activeDeliveries", "order", "orders"}, allEntries = true)
    @Transactional
    public void assignDriver(Long orderId, Long driverId) {
        logger.info("Updating order ID {} with user ID: {}", orderId,  driverId);
        Users deliveryMen = usersRepository.findById(driverId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + driverId));
        Deliveries deliveries = deliveryRepository.getByOrdersOrderId(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Delivery not found with order id: " + orderId));
        deliveries.setDeliveryMen(deliveryMen);

        Orders order = ordersRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with  id: " + orderId));

        if (deliveryMen == deliveries.getDeliveryMen()) {
            validator.validate(order.getOrder_status(), OrderStatuses.ASSIGNED);
            order.setOrder_status(OrderStatuses.ASSIGNED);
            ordersRepository.save(order);
            publisher.publishEvent(
                    new DriverAssignedEvent(
                            order.getOrderId(),
                            driverId

                    )
            );
        }
    }


    public List<DeliveryResponse> getActiveDeliveries() {
       return deliveryRepository.findByDeliveryMenIsNotNull()
               .stream()
               .map(deliveryMapper::toResponse)
               .toList();
    }
}