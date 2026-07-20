package org.example.Orders;


import jakarta.transaction.Transactional;
import org.example.Basket.Basket;
import org.example.Basket.BasketRepository;
import org.example.Deliveries.Deliveries;
import org.example.Deliveries.DeliveryRepository;
import org.example.Events.OrderCancelledEvent;
import org.example.Events.OrderStatusChangeEvent;
import org.example.Exception.ResourceNotFoundException;
import org.example.OrderItems.OrderItems;
import org.example.OrderItems.OrderItemsRepository;
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

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;


@Service
public class OrdersService {

    @Autowired
    private OrdersRepository ordersRepository;

    @Autowired
    private UsersRepository usersRepository;

    @Autowired
    private BasketRepository basketRepository;

    @Autowired
    private OrderItemsRepository orderItemsRepository;

    @Autowired
    private DeliveryRepository deliveryRepository;

    @Autowired
    private OrderMapper orderMapper;

    private static final Logger logger = LoggerFactory.getLogger(OrdersService.class);


    private final ApplicationEventPublisher publisher;

    public OrdersService(ApplicationEventPublisher publisher) {
        this.publisher = publisher;
    }

    @EventListener(ApplicationReadyEvent.class)
    @CacheEvict(value = {"orders", "order"}, allEntries = true)
    public void clearCacheOnStartup() {
        logger.info("Application Ready: Internal and External Caches have been nuked to sync with Database.");
    }

    @Cacheable(value = "orders")
    public List<OrderResponse> getAllOrders() {
        logger.info("Displaying all orders");
        return ordersRepository.findAll().stream()
                .map(orderMapper::toResponse)
                .toList();
    }

    @Cacheable(value = "orders", key = "'page_'+#pageable.pageNumber+'_'+#pageable.pageSize+'_'+#pageable.sort.toString()")
    public Page<OrderResponse> getOrders(Pageable pageable) {
        logger.info("Displaying all orders by page");
        return ordersRepository.findAll(pageable)
                .map(orderMapper::toResponse);
    }

    @Cacheable(value = "order", key = "#userId")
    public List<OrderResponse> getOrderByUser(Long user_ID) {
        logger.info("Displaying orders by user ID: {}", user_ID);
        Users users = usersRepository.findById(user_ID)
                .orElseThrow(() -> new ResourceNotFoundException("User basket not found"));
        List<Orders> orders = ordersRepository.findByCustomer(users);
        return orderMapper.toListResponse(orders);
    }



    @Caching(
            put = {
                    @CachePut(value = "order", key = "#savedOrder.orderId")
            },
            evict = {
                    @CacheEvict(value = "orders", allEntries = true)
            }
    )
    @Transactional
    public OrderResponse addOrders(Long userId, OrderRequest orderRequest) {
        logger.info("Attempting to add new order for user ID: {}", userId);
        Users users = usersRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        List<Basket> userBasket = basketRepository.findByCustomer(users);
        LocalDate currentDate = LocalDate.now();


        double total =  userBasket.stream()
                .mapToDouble(Basket::getSubtotal)
                .sum();

        Orders orders = new Orders();
        orders.setCustomer(users);
        orders.setOrder_status(OrderStatuses.CONFIRMED);
        orders.setOrder_date(currentDate);
        orders.setOrder_price(total);
        orders.setOrder_address(orders.getOrder_address());
        orders.setOrder_notes(orders.getOrder_notes());


        ordersRepository.save(orders);


        List<OrderItems> orderItemsList = new ArrayList<>();

        for (Basket basketItem : userBasket) {
            OrderItems orderItem = new OrderItems();
            orderItem.setOrder_catalog(basketItem.getCatalog());
            orderItem.setOrders(orders);
            orderItem.setQuantity(basketItem.getQuantity());
            orderItem.setSubtotal(basketItem.getSubtotal());
            orderItemsRepository.save(orderItem);

            orderItemsList.add(orderItem);
        }

        orders.setOrder_price(total);
        orders.setOrderItems(orderItemsList);

        Deliveries deliveries = new Deliveries();
        deliveries.setOrders(orders);
        deliveries.setAddress(orderRequest.getOrder_address());

        deliveryRepository.save(deliveries);

        for (Basket basketItem : userBasket) {
            System.out.println(
                    "Basket ID: " + basketItem.getBasketId() +
                            " Catalog Name: " + basketItem.getCatalog().getCatalogName() +
                            " Qty: " + basketItem.getQuantity() +
                            " Subtotal: " + basketItem.getSubtotal()
            );
        }

        Orders savedOrder = ordersRepository.save(orders);
        basketRepository.deleteAll(userBasket);

        publisher.publishEvent(new OrderConfirmedEvent(this, savedOrder.getOrderId(), OrderStatuses.CONFIRMED));

        logger.info("Successfully added new order for user ID: {}", userId);
        return orderMapper.toResponse(savedOrder);

    }



    @Caching(
            put = {
                    @CachePut(value = "order", key = "#savedOrder.orderId")
            },
            evict = {
                    @CacheEvict(value = "orders", allEntries = true)
            }
    )
    public OrderResponse cancelOrder(Long orderId, String reason) {
        logger.info("Updating order ID: {}", orderId);
        Orders order = ordersRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found"));
        order.setOrder_status(OrderStatuses.CANCELLED);

        Orders savedOrder = ordersRepository.save(order);
        publisher.publishEvent(new OrderCancelledEvent(orderId, reason));
        logger.info("Successfully updated order ID: {}", orderId);
        return orderMapper.toResponse(savedOrder);
    }

    @Caching(evict = {
            @CacheEvict(value = "order", key = "#orderId"),
            @CacheEvict(value = "orders", allEntries = true)
    })
    public void deleteOrders(Long orderId) {
        logger.info("Deleting order ID: {}", orderId);
        Orders order = ordersRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found"));

        orderItemsRepository.deleteByOrders(order);
        deliveryRepository.deleteByOrders(order);
        ordersRepository.deleteById(orderId);
        logger.info("Successfully deleted order ID: {}", orderId);
    }



    @Cacheable(value = "order", key = "#orderId")
    public OrderResponse getOrdersById(Long orderId) {
        logger.info("Getting order ID: {}", orderId);
        Orders order = ordersRepository.findById(orderId)
                .orElseThrow(() -> {
                    return new ResourceNotFoundException("Order not found.");
                });
        logger.info("Successfully fetched order ID: {}", orderId);
        return orderMapper.toResponse(order);
    }
}
