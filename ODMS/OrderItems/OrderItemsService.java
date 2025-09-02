package org.example.OrderItems;

import org.example.Catalog.Catalog;
import org.example.Orders.Orders;
import org.example.Orders.OrdersRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class OrderItemsService {
    private final OrderItemsRepository orderItemsRepository;
    private final OrdersRepository ordersRepository;

    public OrderItemsService(OrderItemsRepository orderItemsRepository, OrdersRepository ordersRepository) {
        this.orderItemsRepository = orderItemsRepository;
        this.ordersRepository = ordersRepository;
    }

    public List<OrderItems> getAllOrderItems() {
        return orderItemsRepository.findAll();
    }

    public void addOrderItems(OrderItems orderItems) {
        orderItemsRepository.save(orderItems);
    }


    public OrderItems updateOrderItems(OrderItems orderItems, Integer id) {
        Optional<OrderItems> orderItem = orderItemsRepository.findById(id);
        if (orderItem.isPresent()) {
            orderItemsRepository.save(orderItems);
        }
        else {
            return null;
        }
        return orderItems;
    }

    public void deleteOrderItems(OrderItems orderItems, Integer id) {
        Optional<OrderItems> orderItem = orderItemsRepository.findById(id);
        if (orderItem.isPresent()) {
            orderItemsRepository.delete(orderItems);
        }
        else {
            return;
        }
    }

    public OrderItems getOrderItemsById(Integer id) {
        return orderItemsRepository.findById(id)
                .orElseThrow(() -> new IllegalStateException(id + "not found"));
    }

    public List<OrderItems> getOrderItemsByOrder(Integer order_ID) {
        Orders orders  = ordersRepository.findById(order_ID).get();
        return orderItemsRepository.findByOrders(orders);
    }
}
