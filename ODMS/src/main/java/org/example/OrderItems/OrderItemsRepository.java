package org.example.OrderItems;

import org.example.Orders.Orders;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface OrderItemsRepository extends JpaRepository<OrderItems, Long> {
    List<OrderItems> findByOrders(Orders orders);
    void deleteByOrders(Orders orders);
}
