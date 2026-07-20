package org.example.Deliveries;


import org.example.Events.OrderDeliveredEvent;
import org.example.Events.OrderStatusChangeEvent;
import org.example.Exception.ResourceNotFoundException;
import org.example.Notifications.NotificationRepository;
import org.example.Orders.*;
import org.example.Users.Users;
import org.example.Users.UsersRepository;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.CachePut;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.cache.annotation.Caching;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.context.event.EventListener;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.time.LocalTime;
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
    private NotificationRepository notificationRepository;

    @Autowired
    private DeliveryMapper deliveryMapper;

    @Autowired
    private OrderMapper orderMapper;

    private final ApplicationEventPublisher publisher;




    private static final Logger logger = LoggerFactory.getLogger(DeliveryService.class);

    public DeliveryService(ApplicationEventPublisher publisher) {
        this.publisher = publisher;
    }

    @EventListener(ApplicationReadyEvent.class)
    @CacheEvict(value = {"deliveries", "delivery"}, allEntries = true)
    public void clearCacheOnStartup() {
        logger.info("Application Ready: Internal and External Caches have been nuked to sync with Database.");
    }

    @Cacheable(value = "deliveries")
    public List<DeliveryResponse> getAllDeliveries() {
        logger.info("Displaying all deliveries");
        return deliveryRepository.findAll().stream()
                .map(deliveryMapper::toResponse)
                .toList();
    }

    @Cacheable(value = "deliveries", key = "'page_'+#pageable.pageNumber+'_'+#pageable.pageSize+'_'+#pageable.sort.toString()")
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


    @Cacheable(value = "delivery", key = "#userId")
    public List<DeliveryResponse> getDeliveriesByUser(Long userId) {
        logger.info("Displaying deliveries by user");
        Users customer = usersRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found with id: " + userId));
        List<Deliveries> deliveries = deliveryRepository.getByOrdersCustomer(customer);
        return deliveryMapper.toListResponse(deliveries);
    }

    @Cacheable(value = "delivery", key = "#userId")
    public List<DeliveryResponse> getDeliveriesByDeliveryMen(Long userId) {
        logger.info("Displaying deliveries by delivery men");
        Users deliveryMen = usersRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Delivery Men not found with id: " + userId));
        List<Deliveries> deliveries = deliveryRepository.getByDeliveryMen(deliveryMen);
        return deliveryMapper.toListResponse(deliveries);
    }


    @Caching(
            put = {
                    @CachePut(value = "delivery", key = "#savedDelivery.deliveryId")
            },
            evict = {
                    @CacheEvict(value = "deliveries", allEntries = true)
            }
    )
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
        delivery.setEstimated_time(request.getEstimated_time());
        delivery.setDelivered_time(request.getDelivered_time());
        Deliveries savedDelivery = deliveryRepository.save(delivery);
        logger.info("Successfully added new delivery for order ID: {}", request.getOrderId());
        return deliveryMapper.toResponse(savedDelivery);
    }




    @Caching(
            put = {
                    @CachePut(value = "delivery", key = "#delivery.deliveryId")
            },
            evict = {
                    @CacheEvict(value = "deliveries", allEntries = true)
            }
    )
    public DeliveryResponse updateEstimatedTime(Long deliveryId, EstimatedTime estimatedTime) {
        logger.info("Updating delivery ETA  with ID: {}", deliveryId);
        Deliveries deliveries = deliveryRepository.findById(deliveryId)
                .orElseThrow(() -> new ResourceNotFoundException("Delivery not found with id: " + deliveryId));
        deliveries.setEstimated_time(estimatedTime.getEstimated_time());
        Deliveries delivery =  deliveryRepository.save(deliveries);
        logger.info("Successfully updated delivery ETA with ID: {}", deliveryId);
        return deliveryMapper.toResponse(delivery);
    }



    @Caching(
            put = {
                    @CachePut(value = "delivery", key = "#delivery.deliveryId")
            },
            evict = {
                    @CacheEvict(value = "deliveries", allEntries = true)
            }
    )
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


    public OrderResponse markAsOTW(Long orderId) {
        Orders order = ordersRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found"));

        order.setOrder_status(OrderStatuses.OUT_FOR_DELIVERY);
        publisher.publishEvent(
                new OrderStatusChangeEvent(
                       orderId,
                        OrderStatuses.OUT_FOR_DELIVERY

                )
        );

        return orderMapper.toResponse(order);
    }


    public OrderResponse markAsDelivered(Long orderId, Long deliveryId) {
        Orders order = ordersRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found"));

        order.setOrder_status(OrderStatuses.DELIVERED);

        Deliveries deliveries = deliveryRepository.findById(deliveryId)
                .orElseThrow(() -> new ResourceNotFoundException("Delivery not found with id: " + deliveryId));
        deliveries.setDelivered_time(LocalTime.now());
        publisher.publishEvent(new OrderDeliveredEvent(orderId, deliveryId, LocalTime.now()));

        return orderMapper.toResponse(order);
    }


    @Caching(evict = {
            @CacheEvict(value = "delivery", key = "#deliveryId"),
            @CacheEvict(value = "deliveries", allEntries = true)
    })
    public void deleteDeliveries(Long deliveryId) {
        logger.info("Deleting delivery ID: {}", deliveryId);
        Optional<Deliveries> delivery = deliveryRepository.findById(deliveryId);
        Deliveries deletedDelivery = deliveryRepository.findById(deliveryId)
                .orElseThrow(() -> new ResourceNotFoundException("Delivery not found with id: " + deliveryId));
        if (delivery.isPresent()) {
            deliveryRepository.delete(deletedDelivery);
        }
        else {
            return;
        }
        logger.info("Successfully deleted delivery ID: {}", deliveryId);
    }

    @Cacheable(value = "delivery", key = "#deliveryId")
    public DeliveryResponse getDeliveriesById(Long deliveryId) {
        logger.info("Getting delivery ID: {}", deliveryId);
        Deliveries delivery = deliveryRepository.findById(deliveryId)
                .orElseThrow(() ->
                     new ResourceNotFoundException("Delivery not found."));
        logger.info("Successfully fetched delivery ID: {}", deliveryId);
        return deliveryMapper.toResponse(delivery);
    }
}
