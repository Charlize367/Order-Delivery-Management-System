package org.example.Deliveries;

import org.example.Deliveries.Deliveries;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface DeliveryRepository extends JpaRepository<Deliveries, Integer> {
    List<Deliveries> findByOrderCustomerID(Integer user_ID);
}
