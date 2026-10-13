package org.example.OrderItems;

import io.lettuce.core.dynamic.annotation.Param;
import org.example.Orders.Orders;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface OrderItemsRepository extends JpaRepository<OrderItems, Long> {

    @Query("SELECT oi FROM OrderItems oi WHERE oi.orders.orderId = :orderId")
    List<OrderItems> findByOrders(@Param("orderId") Long orderId);
    void deleteByOrders(Orders orders);
}
