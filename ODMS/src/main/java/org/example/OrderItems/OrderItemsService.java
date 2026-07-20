package org.example.OrderItems;

import jakarta.persistence.EntityNotFoundException;
import org.example.Catalog.Catalog;
import org.example.Category.Category;
import org.example.Deliveries.DeliveryService;
import org.example.Exception.ResourceNotFoundException;
import org.example.Orders.Orders;
import org.example.Orders.OrdersRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class OrderItemsService {

    @Autowired
    private OrderItemsRepository orderItemsRepository;

    @Autowired
    private OrdersRepository ordersRepository;

    @Autowired
    private OrderItemsMapper orderItemsMapper;

    private static final Logger logger = LoggerFactory.getLogger(OrderItemsService.class);

    @EventListener(ApplicationReadyEvent.class)
    @CacheEvict(value = {"orderItems", "orderItem"}, allEntries = true)
    public void clearCacheOnStartup() {
        logger.info("Application Ready: Internal and External Caches have been nuked to sync with Database.");
    }

    @Cacheable(value = "orderItems")
    public List<OrderItemsResponse> getAllOrderItems() {
        return orderItemsRepository.findAll().stream()
                .map(orderItemsMapper::toResponse)
                .toList();
    }


    @Cacheable(value = "orderItem", key = "#orderItemId")
    public OrderItemsResponse getOrderItemsById(Long orderItemId) {
        OrderItems orderItems = orderItemsRepository.findById(orderItemId)
                .orElseThrow(() ->
                     new ResourceNotFoundException("Order Items not found."));
        return orderItemsMapper.toResponse(orderItems);
    }

    @Cacheable(value = "orderItem", key = "#orderId")
    public List<OrderItemsResponse> getOrderItemsByOrder(Long orderId) {
        List<OrderItems> orderItems =  orderItemsRepository.findByOrders(orderId);
        return orderItemsMapper.toListResponse(orderItems);
    }
}
