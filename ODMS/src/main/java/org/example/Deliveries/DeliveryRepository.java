package org.example.Deliveries;

import org.example.Orders.Orders;
import org.example.Users.Users;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface DeliveryRepository extends JpaRepository<Deliveries, Long> {
    List<Deliveries> getByOrdersCustomer(Users userId);
    Page<Deliveries> findByOrdersCustomer(Users user, Pageable pageable);
    List<Deliveries> getByDeliveryMen(Users userId);
    Page<Deliveries> findByDeliveryMen(Users user, Pageable pageable);
    void deleteByOrders(Orders orders);
    Optional<Deliveries> getByOrdersOrderId(Long orderId);
    Deliveries findByOrdersOrderId(Long orderId);
    List<Deliveries> findByDeliveryMenIsNotNull();
}
