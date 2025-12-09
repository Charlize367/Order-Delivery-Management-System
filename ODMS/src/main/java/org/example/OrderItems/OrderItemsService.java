package org.example.OrderItems;

import org.example.Catalog.Catalog;
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


    public List<OrderItems> getAllOrderItems() {
        return orderItemsRepository.findAll();
    }

    public void addOrderItems(OrderItems orderItems) {
        orderItemsRepository.save(orderItems);
    }


    public OrderItems updateOrderItems(OrderItems orderItems, Long id) {
        Optional<OrderItems> orderItem = orderItemsRepository.findById(id);
        if (orderItem.isPresent()) {
            orderItemsRepository.save(orderItems);
        }
        else {
            return null;
        }
        return orderItems;
    }

    public void deleteOrderItems(OrderItems orderItems, Long id) {
        Optional<OrderItems> orderItem = orderItemsRepository.findById(id);
        if (orderItem.isPresent()) {
            orderItemsRepository.delete(orderItems);
        }
        else {
            return;
        }
    }

    public OrderItems getOrderItemsById(Long id) {
        return orderItemsRepository.findById(id)
                .orElseThrow(() -> new IllegalStateException(id + "not found"));
    }

    public List<OrderItems> getOrderItemsByOrder(Long orderId) {
        Orders orders  = ordersRepository.findById(orderId).get();
        return orderItemsRepository.findByOrders(orders);
    }
}
