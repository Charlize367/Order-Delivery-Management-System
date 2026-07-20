package org.example.Kitchen;

import org.example.Events.OrderCancelledEvent;
import org.example.Events.OrderStatusChangeEvent;
import org.example.Exception.ResourceNotFoundException;
import org.example.OrderItems.OrderItems;
import org.example.OrderItems.OrderItemsMapper;
import org.example.OrderItems.OrderItemsRepository;
import org.example.OrderItems.OrderItemsResponse;
import org.example.Orders.*;
import org.hibernate.query.Order;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.Arrays;
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

    private static final List<OrderStatuses> kitchenQueueStatuses = Arrays.asList(
            OrderStatuses.CONFIRMED,
            OrderStatuses.PREPARING
    );

    public KitchenService(ApplicationEventPublisher publisher) {
        this.publisher = publisher;
    }

    public Page<OrderResponse> getQueuedOrders(Pageable pageable) {
        logger.info("Displaying all orders");
        return ordersRepository.getKitchenQueue(kitchenQueueStatuses, pageable);
    }

    public OrderResponse markAsPreparing(Long orderId) {
        Orders order = ordersRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found"));

        order.setOrder_status(OrderStatuses.PREPARING);
        Orders updatedOrder = ordersRepository.save(order);
        publisher.publishEvent(new OrderStatusChangeEvent(orderId, OrderStatuses.PREPARING));
        return orderMapper.toResponse(updatedOrder);
    }


    public OrderResponse markAsReady(Long orderId) {
        Orders order = ordersRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found"));

        order.setOrder_status(OrderStatuses.READY);
        Orders updatedOrder = ordersRepository.save(order);
        publisher.publishEvent(new OrderStatusChangeEvent(orderId, OrderStatuses.READY));
        return orderMapper.toResponse(updatedOrder);
    }


    public OrderResponse cancelOrder(Long orderId, OrderCancellationReason reason) {
        Orders order = ordersRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found"));

        order.setOrder_status(OrderStatuses.READY);
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
