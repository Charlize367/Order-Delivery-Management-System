package org.example.Deliveries;


import org.example.Exception.ResourceNotFoundException;
import org.example.Orders.Orders;
import org.example.Orders.OrdersRepository;
import org.example.Users.Users;
import org.example.Users.UsersRepository;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class DeliveryService {

    @Autowired
    private UsersRepository usersRepository;

    @Autowired
    private DeliveryRepository deliveryRepository;

    @Autowired
    private OrdersRepository ordersRepository;

    @Autowired
    private DeliveryMapper deliveryMapper;



    private static final Logger logger = LoggerFactory.getLogger(Deliveries.class);

    public List<DeliveryResponse> getAllDeliveries() {
        logger.info("Displaying all deliveries");
        return deliveryRepository.findAll().stream()
                .map(deliveryMapper::toResponse)
                .toList();
    }

    public Page<DeliveryResponse> getDeliveries(Long customerId, Long driverId, Pageable pageable) {
        logger.info("Displaying all deliveries by page");



        if(customerId != null) {
            Users customer = usersRepository.findById(customerId)
                    .orElseThrow(() -> new ResourceNotFoundException("Customer not found with id: " + customerId));
            return deliveryRepository.findByOrdersCustomer(customer, pageable)
                    .map(deliveryMapper::toResponse);
        }

        if(driverId != null) {
            Users driver = usersRepository.findById(driverId)
                    .orElseThrow(() -> new ResourceNotFoundException("Customer not found with id: " + driverId));
            return deliveryRepository.findByDeliveryMen(driver, pageable)
                    .map(deliveryMapper::toResponse);
        }

        return deliveryRepository.findAll(pageable)
                .map(deliveryMapper::toResponse);
    }

    public List<DeliveryResponse> getDeliveriesByUser(Long userId) {
        logger.info("Displaying deliveries by user");
        Users customer = usersRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found with id: " + userId));
        List<Deliveries> deliveries = deliveryRepository.getByOrdersCustomer(customer);
        return deliveryMapper.toListResponse(deliveries);
    }

    public List<DeliveryResponse> getDeliveriesByDeliveryMen(Long userId) {
        logger.info("Displaying deliveries by delivery men");
        Users deliveryMen = usersRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Delivery Men not found with id: " + userId));
        List<Deliveries> deliveries = deliveryRepository.getByDeliveryMen(deliveryMen);
        return deliveryMapper.toListResponse(deliveries);
    }

    public DeliveryResponse addDeliveries(DeliveryRequest request) {
        logger.info("Attempting to add new delivery with order ID: {}", request.getOrderId());
        Users deliveryMen = usersRepository.findById(request.getUserId())
                .orElseThrow(() -> new ResourceNotFoundException("Delivery Men not found with id: " + request.getUserId()));
        Orders order = ordersRepository.findById(request.getOrderId())
                .orElseThrow(() -> new ResourceNotFoundException("Delivery Men not found with id: " + request.getOrderId()));

        Deliveries delivery = new Deliveries();
        delivery.setAddress(request.getAddress());
        delivery.setOrders(order);
        delivery.setDeliveryMen(deliveryMen);
        delivery.setDelivery_status(request.getDelivery_status());
        delivery.setEstimated_time(request.getEstimated_time());
        delivery.setDelivered_time(request.getDelivered_time());
        Deliveries savedDelivery = deliveryRepository.save(delivery);
        logger.info("Successfully added new delivery for order ID: {}", request.getOrderId());
        return deliveryMapper.toResponse(savedDelivery);
    }

    public DeliveryResponse updateDeliveryStatus(Long deliveryId, DeliveryStatus deliveryStatus) {
        logger.info("Updating delivery status with ID: {}", deliveryId);
        Deliveries deliveries = deliveryRepository.findById(deliveryId)
                .orElseThrow(() -> new ResourceNotFoundException("Delivery not found with id: " + deliveryId));
        deliveries.setDelivery_status(deliveryStatus.getDelivery_status());
        Deliveries delivery = deliveryRepository.save(deliveries);
        logger.info("Successfully updated delivery status with ID: {}", deliveryId);
        return deliveryMapper.toResponse(delivery);
    }

    public DeliveryResponse updateEstimatedTime(Long deliveryId, EstimatedTime estimatedTime) {
        logger.info("Updating delivery ETA  with ID: {}", deliveryId);
        Deliveries deliveries = deliveryRepository.findById(deliveryId)
                .orElseThrow(() -> new ResourceNotFoundException("Delivery not found with id: " + deliveryId));
        deliveries.setEstimated_time(estimatedTime.getEstimated_time());
        Deliveries delivery =  deliveryRepository.save(deliveries);
        logger.info("Successfully updated delivery ETA with ID: {}", deliveryId);
        return deliveryMapper.toResponse(delivery);
    }

    public DeliveryResponse updateDeliveredTime(Long deliveryId, DeliveredTime deliveredTime) {
        logger.info("Updating delivery delivered time  with ID: {}", deliveryId);
        Deliveries deliveries = deliveryRepository.findById(deliveryId)
                .orElseThrow(() -> new ResourceNotFoundException("Delivery not found with id: " + deliveryId));
        deliveries.setDelivered_time(deliveredTime.getDelivered_time());
        Deliveries delivery = deliveryRepository.save(deliveries);
        logger.info("Successfully updated delivery delivered time  with ID: {}", deliveryId);
        return deliveryMapper.toResponse(delivery);
    }

    public DeliveryResponse updateDeliveryDriver(Long deliveryId, Long userId) {
        logger.info("Updating delivery ID {} with user ID: {}", deliveryId, userId);
        Users deliveryMen = usersRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + deliveryId));
        Deliveries deliveries = deliveryRepository.findById(deliveryId)
                .orElseThrow(() -> new ResourceNotFoundException("Delivery not found with id: " + deliveryId));
        deliveries.setDeliveryMen(deliveryMen);
        Deliveries delivery =  deliveryRepository.save(deliveries);
        logger.info("Successfully updated delivery ID {} with user ID: {}, name: {}", deliveryId, userId, deliveryMen.getUsername());
        return deliveryMapper.toResponse(delivery);
    }




    public void deleteDeliveries(Long id) {
        logger.info("Deleting delivery ID: {}", id);
        Optional<Deliveries> delivery = deliveryRepository.findById(id);
        Deliveries deliveries = deliveryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Delivery not found with id: " + id));
        if (delivery.isPresent()) {
            deliveryRepository.delete(deliveries);
        }
        else {
            return;
        }
        logger.info("Successfully deleted delivery ID: {}", id);
    }

    @Cacheable("deliveries")
    public DeliveryResponse getDeliveriesById(Long id) {
        logger.info("Getting delivery ID: {}", id);
        Deliveries delivery = deliveryRepository.findById(id)
                .orElseThrow(() -> {
                    return new ResourceNotFoundException("Delivery not found.");
                });
        logger.info("Successfully fetched delivery ID: {}", id);
        return deliveryMapper.toResponse(delivery);
    }
}
