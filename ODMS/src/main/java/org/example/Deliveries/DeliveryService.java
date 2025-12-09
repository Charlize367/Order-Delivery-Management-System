package org.example.Deliveries;


import org.example.Catalog.Catalog;
import org.example.Users.Users;
import org.example.Users.UsersRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class DeliveryService {

    @Autowired
    private UsersRepository usersRepository;

    @Autowired
    private DeliveryRepository deliveryRepository;


    public List<Deliveries> getAllDeliveries() {
        return deliveryRepository.findAll();
    }

    public List<Deliveries> getDeliveriesByUser(Long userId) {
        Users customer = usersRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Customer not found with id: " + userId));
        return deliveryRepository.findByOrdersCustomer(customer);
    }

    public List<Deliveries> getDeliveriesByDeliveryMen(Long userId) {
        Users deliveryMen = usersRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Delivery Men not found with id: " + userId));
        return deliveryRepository.findByDeliveryMen(deliveryMen);
    }

    public Deliveries addDeliveries(Deliveries deliveries) {
        return deliveryRepository.save(deliveries);
    }

    public Deliveries updateDeliveryStatus(Long deliveryId, DeliveryStatus deliveryStatus) {
        Deliveries deliveries = deliveryRepository.findById(deliveryId)
                .orElseThrow(() -> new RuntimeException("Delivery not found with id: " + deliveryId));
        deliveries.setDelivery_status(deliveryStatus.getDelivery_status());
        return deliveryRepository.save(deliveries);
    }

    public Deliveries updateEstimatedTime(Long deliveryId, EstimatedTime estimatedTime) {
        Deliveries deliveries = deliveryRepository.findById(deliveryId)
                .orElseThrow(() -> new RuntimeException("Delivery not found with id: " + deliveryId));
        deliveries.setEstimated_time(estimatedTime.getEstimated_time());
        return deliveryRepository.save(deliveries);
    }

    public Deliveries updateDeliveredTime(Long deliveryId, DeliveredTime deliveredTime) {
        Deliveries deliveries = deliveryRepository.findById(deliveryId)
                .orElseThrow(() -> new RuntimeException("Delivery not found with id: " + deliveryId));
        deliveries.setDelivered_time(deliveredTime.getDelivered_time());
        return deliveryRepository.save(deliveries);
    }

    public Deliveries updateDeliveryDriver(Long deliveryId, Long userId) {
        Users deliveryMen = usersRepository.findById(userId).get();
        Deliveries deliveries = deliveryRepository.findById(deliveryId).get();
        deliveries.setDeliveryMen(deliveryMen);
        return deliveryRepository.save(deliveries);
    }


    public Deliveries updateDeliveries(Deliveries deliveries, Long id) {
        Optional<Deliveries> delivery = deliveryRepository.findById(id);
        if (delivery.isPresent()) {
            deliveryRepository.save(deliveries);
        }
        else {
            return null;
        }
        return deliveries;
    }

    public void deleteDeliveries(Deliveries deliveries, Long id) {
        Optional<Deliveries> delivery = deliveryRepository.findById(id);
        if (delivery.isPresent()) {
            deliveryRepository.delete(deliveries);
        }
        else {
            return;
        }
    }

    public Deliveries getDeliveriesById(Long id) {
        return deliveryRepository.findById(id)
                .orElseThrow(() -> new IllegalStateException(id + "not found"));
    }
}
