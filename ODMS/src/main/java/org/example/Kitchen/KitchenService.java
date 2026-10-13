package org.example.Kitchen;

import org.example.Basket.Basket;
import org.example.Basket.BasketResponse;
import org.example.Events.OrderCancelledEvent;
import org.example.Events.OrderStatusChangeEvent;
import org.example.Exception.ResourceNotFoundException;
import org.example.OrderItems.OrderItems;
import org.example.OrderItems.OrderItemsMapper;
import org.example.OrderItems.OrderItemsRepository;
import org.example.OrderItems.OrderItemsResponse;
import org.example.Orders.*;
import org.example.PageResponse;
import org.example.Validator.OrderStatusTransitionValidator;
import org.hibernate.query.Order;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.cache.annotation.Caching;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.context.event.EventListener;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.Arrays;
import java.util.Collections;
import java.util.List;

@Service
public class KitchenService {

    private static final Logger logger = LoggerFactory.getLogger(KitchenService.class);

    private final ApplicationEventPublisher publisher;

    @Autowired
    private OrdersRepository ordersRepository;

    @Autowired
    private OrderItemsRepository orderItemsRepository;

    @Autowired
    private OrderMapper orderMapper;

    @Autowired
    private OrderItemsMapper orderItemsMapper;


    private final OrderStatusTransitionValidator validator;

    private static final List<OrderStatuses> kitchenQueueStatuses = Arrays.asList(
            OrderStatuses.CONFIRMED,
            OrderStatuses.PREPARING
    );

    public KitchenService(ApplicationEventPublisher publisher, OrderStatusTransitionValidator validator) {
        this.publisher = publisher;
        this.validator = validator;
    }

    @EventListener(ApplicationReadyEvent.class)
    @CacheEvict(value = {"queuedOrders", "readyOrders"}, allEntries = true)
    public void clearCacheOnStartup() {
        logger.info("Application Ready: Internal and External Caches have been nuked to sync with Database.");
    }

    @Cacheable(value = "queuedOrders", key = "'page_'+#pageable.pageNumber+'_'+#pageable.pageSize+'_'+#pageable.sort.toString()")
    public PageResponse<OrderResponse> getQueuedOrders(Pageable pageable) {
        logger.info("Displaying all orders");


        Page<Orders> page = ordersRepository.getKitchenQueue(kitchenQueueStatuses, pageable);

        Page<OrderResponse> mapped = page.map(orderMapper::toResponse);

        return new PageResponse<>(mapped);
    }


    @Cacheable(value = "readyOrders", key = "'page_'+#pageable.pageNumber+'_'+#pageable.pageSize+'_'+#pageable.sort.toString()")
    public PageResponse<OrderResponse> getReadyOrders(Pageable pageable) {
        logger.info("Displaying ready orders");


        Page<Orders> page = ordersRepository.getKitchenQueue(Collections.singleton(OrderStatuses.READY), pageable);

        Page<OrderResponse> mapped = page.map(orderMapper::toResponse);

        return new PageResponse<>(mapped);
    }

    @Caching(evict = {
            @CacheEvict(value = "queuedOrders", allEntries = true),
            @CacheEvict(value = "readyOrders", allEntries = true),
            @CacheEvict(value = "order", key = "#orderId"),
            @CacheEvict(value = "orders", allEntries = true)
    })
    public OrderResponse markAsPreparing(Long orderId) {
        Orders order = ordersRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found"));

        validator.validate(order.getOrder_status(), OrderStatuses.PREPARING);

        System.out.println("ORDER STATUS NOW BEFORE PREPARING: " + order.getOrder_status());

        order.setOrder_status(OrderStatuses.PREPARING);
        Orders updatedOrder = ordersRepository.save(order);
        publisher.publishEvent(new OrderStatusChangeEvent(orderId, OrderStatuses.PREPARING));
        return orderMapper.toResponse(updatedOrder);
    }


    @Caching(evict = {
            @CacheEvict(value = "queuedOrders", allEntries = true),
            @CacheEvict(value = "readyOrders", allEntries = true),
            @CacheEvict(value = "order", key = "#orderId"),
            @CacheEvict(value = "orders", allEntries = true)
    })
    public OrderResponse markAsReady(Long orderId) {
        Orders order = ordersRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found"));

        validator.validate(order.getOrder_status(), OrderStatuses.READY);
        order.setOrder_status(OrderStatuses.READY);
        Orders updatedOrder = ordersRepository.save(order);
        publisher.publishEvent(new OrderStatusChangeEvent(orderId, OrderStatuses.READY));
        return orderMapper.toResponse(updatedOrder);
    }


    @Caching(evict = {
            @CacheEvict(value = "queuedOrders", allEntries = true),
            @CacheEvict(value = "readyOrders", allEntries = true),
            @CacheEvict(value = "order", key = "#orderId"),
            @CacheEvict(value = "orders", allEntries = true)
    })
    public OrderResponse cancelOrder(Long orderId, OrderCancellationReason reason) {
        Orders order = ordersRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found"));

        validator.validate(order.getOrder_status(), OrderStatuses.CANCELLED);
        order.setOrder_status(OrderStatuses.CANCELLED);
        Orders updatedOrder = ordersRepository.save(order);
        publisher.publishEvent(new OrderCancelledEvent(orderId, reason));
        return orderMapper.toResponse(updatedOrder);
    }

    public OrderResponse getOrderDetails(Long orderId) {
        Orders order = ordersRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found"));
        return orderMapper.toResponse(order);
    }

}