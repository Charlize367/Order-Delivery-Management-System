package org.example.Deliveries;


import org.example.Catalog.Catalog;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class DeliveryService {

    private final DeliveryRepository deliveryRepository;

    public DeliveryService(DeliveryRepository deliveryRepository) {
        this.deliveryRepository = deliveryRepository;
    }

    public List<Deliveries> getAllDeliveries() {
        return deliveryRepository.findAll();
    }

    public void addDeliveries(Deliveries deliveries) {
        deliveryRepository.save(deliveries);
    }


    public Deliveries updateDeliveries(Deliveries deliveries, Integer id) {
        Optional<Deliveries> delivery = deliveryRepository.findById(id);
        if (delivery.isPresent()) {
            deliveryRepository.save(deliveries);
        }
        else {
            return null;
        }
        return deliveries;
    }

    public void deleteDeliveries(Deliveries deliveries, Integer id) {
        Optional<Deliveries> delivery = deliveryRepository.findById(id);
        if (delivery.isPresent()) {
            deliveryRepository.delete(deliveries);
        }
        else {
            return;
        }
    }

    public Deliveries getDeliveriesById(Integer id) {
        return deliveryRepository.findById(id)
                .orElseThrow(() -> new IllegalStateException(id + "not found"));
    }
}
