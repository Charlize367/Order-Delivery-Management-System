package org.example.Deliveries;

import org.example.Users.Users;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface DeliveryRepository extends JpaRepository<Deliveries, Integer> {
    List<Deliveries> findByOrdersCustomer(Users user_ID);
    List<Deliveries> findByDeliveryMen(Users user_ID);
}
