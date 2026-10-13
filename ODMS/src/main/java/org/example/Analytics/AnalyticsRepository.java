package org.example.Analytics;

import org.example.Orders.Orders;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;

@Repository
public interface AnalyticsRepository extends JpaRepository<Orders, Long> {

    @Query("SELECT COUNT(o) FROM Orders o")
    Long countTotalOrders();

    @Query("SELECT SUM(o.order_price) " +
            "FROM Orders o " +
            "WHERE o.order_status = 'DELIVERED'")
    BigDecimal getTotalRevenue();






}