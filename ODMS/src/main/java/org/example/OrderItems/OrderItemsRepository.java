package org.example.OrderItems;

import org.example.OrderItems.OrderItems;
import org.springframework.data.jpa.repository.JpaRepository;
public interface OrderItemsRepository extends JpaRepository<OrderItems, Integer> {
}
