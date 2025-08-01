package org.example.Orders;


import org.example.OrderItems.OrderItems;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class OrdersService {
    private final OrdersRepository ordersRepository;

    public OrdersService(OrdersRepository ordersRepository) {
        this.ordersRepository = ordersRepository;
    }

    public List<Orders> getAllOrders() {
        return ordersRepository.findAll();
    }

    public void addOrders(Orders orders) {
        ordersRepository.save(orders);
    }


    public Orders updateOrders(Orders orders, Integer id) {
        Optional<Orders> order = ordersRepository.findById(id);
        if (order.isPresent()) {
            ordersRepository.save(orders);
        }
        else {
            return null;
        }
        return orders;
    }

    public void deleteOrders(Orders orders, Integer id) {
        Optional<Orders> order = ordersRepository.findById(id);
        if (order.isPresent()) {
            ordersRepository.delete(orders);
        }
        else {
            return;
        }
    }

    public Orders getOrdersById(Integer id) {
        return ordersRepository.findById(id)
                .orElseThrow(() -> new IllegalStateException(id + "not found"));
    }
}
