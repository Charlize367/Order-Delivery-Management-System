package org.example.Orders;

import org.example.Orders.Orders;
import org.springframework.data.jpa.repository.JpaRepository;
public interface OrdersRepository extends JpaRepository<Orders, Integer> {
}
