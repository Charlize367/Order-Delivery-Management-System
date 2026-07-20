package org.example.Orders;

import io.lettuce.core.dynamic.annotation.Param;
import org.example.Basket.Basket;
import org.example.Orders.Orders;
import org.example.Users.Users;
import org.hibernate.query.Order;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.Collection;
import java.util.List;

public interface OrdersRepository extends JpaRepository<Orders, Long> {
    List<Orders> findByCustomer(Users customer);

    @Query("SELECT new com.Orders.OrderResponse(o) o FROM Orders WHERE o.order_status IN :statuses")
    Page<OrderResponse> getKitchenQueue(@Param("statuses") Collection<OrderStatuses> statuses, Pageable pageable);

}
