package org.example.OrderItems;

import org.example.Orders.Orders;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface OrderItemsRepository extends JpaRepository<OrderItems, Long> {

    @Query("SELECT oi FROM OrderItems WHERE oi.order.id = :orderId")
    List<OrderItems> findByOrders(Long orderId);
    void deleteByOrders(Orders orders);
}
