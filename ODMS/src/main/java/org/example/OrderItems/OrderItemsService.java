package org.example.OrderItems;

import jakarta.persistence.EntityNotFoundException;
import org.example.Catalog.Catalog;
import org.example.Category.Category;
import org.example.Exception.ResourceNotFoundException;
import org.example.Orders.Orders;
import org.example.Orders.OrdersRepository;
import org.springframework.beans.factory.annotation.Autowired;
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


    public List<OrderItemsResponse> getAllOrderItems() {
        return orderItemsRepository.findAll().stream()
                .map(orderItemsMapper::toResponse)
                .toList();
    }


    public OrderItemsResponse getOrderItemsById(Long id) {
        OrderItems orderItems = orderItemsRepository.findById(id)
                .orElseThrow(() -> {
                    return new ResourceNotFoundException("Order Items not found.");
                });
        return orderItemsMapper.toResponse(orderItems);
    }

    public List<OrderItemsResponse> getOrderItemsByOrder(Long orderId) {
        Orders orders = ordersRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found"));
        List<OrderItems> orderItems =  orderItemsRepository.findByOrders(orders);
        return orderItemsMapper.toListResponse(orderItems);
    }
}
