package org.example.Orders;

import org.example.Basket.Basket;
import org.example.Orders.Orders;
import org.example.Users.Users;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface OrdersRepository extends JpaRepository<Orders, Long> {
    List<Orders> findByCustomer(Users customer);


}
