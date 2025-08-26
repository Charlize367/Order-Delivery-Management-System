package org.example.OrderItems;

import org.example.OrderItems.OrderItems;
import org.example.Orders.Orders;
import org.example.Users.Users;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface OrderItemsRepository extends JpaRepository<OrderItems, Integer> {
    OrderItems findByOrders(Orders orders);
    void deleteByOrders(Orders orders);
}
